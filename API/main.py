import os
import sys
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from typing import Optional

# Garante que a pasta deste arquivo seja sempre encontrada, independente do CWD
sys.path.insert(0, os.path.dirname(__file__))

import bcrypt
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends, APIRouter, UploadFile, File, Form, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from motor.motor_asyncio import AsyncIOMotorDatabase

from database import database, get_database

# Carrega .env da pasta do main.py
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

SECRET_KEY: str = os.getenv("SECRET_KEY", "")
ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

if not SECRET_KEY:
    raise RuntimeError(
        "SECRET_KEY não definida no .env. "
        "Gere um valor com: python -c \"import secrets; print(secrets.token_hex(32))\""
    )

# ── Cloudinary ────────────────────────────────────────────────────────────────
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME", ""),
    api_key=os.getenv("CLOUDINARY_API_KEY", ""),
    api_secret=os.getenv("CLOUDINARY_API_SECRET", ""),
    secure=True,
)

if not os.getenv("CLOUDINARY_CLOUD_NAME"):
    raise RuntimeError("CLOUDINARY_CLOUD_NAME não definida no .env.")


# ── Lifespan ──────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    await database.connect()
    db = database.get_db()
    # Índices — idempotentes, seguros para rodar sempre
    await db.usuarios.create_index("email", unique=True)
    await db.noticias.create_index("criado_em")
    await db.documentos.create_index("titulo")
    await db.projetos.create_index("criado_em")
    await db.projetos.create_index("status")
    print("✅ Aplicação iniciada com sucesso")
    print("☁️  Cloudinary configurado")
    yield
    await database.disconnect()


app = FastAPI(title="API NPEC", version="1.0.0", lifespan=lifespan)

# Lista de origens permitidas
origins = [
    "https://npecfainor.vercel.app",  # Seu frontend oficial
    "http://localhost:5173",          # Caso precise testar localmente
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # Usa a lista específica em vez de "*"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="admin/login")


# ── Segurança ─────────────────────────────────────────────────────────────────
def gerar_hash_senha(senha: str) -> str:
    return bcrypt.hashpw(senha.encode("utf-8")[:72], bcrypt.gensalt(rounds=12)).decode("utf-8")


def verificar_senha(senha: str, senha_hash: str) -> bool:
    try:
        return bcrypt.checkpw(senha.encode("utf-8")[:72], senha_hash.encode("utf-8"))
    except Exception:
        return False


def criar_token(id_usuario: str) -> str:
    expiracao = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": id_usuario, "exp": expiracao}, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        usuario_id: Optional[str] = payload.get("sub")
        if not usuario_id:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # CORREÇÃO: _id foi salvo como string (uuid4), busca correta por string
    usuario = await db.usuarios.find_one({"_id": usuario_id})
    if usuario is None:
        raise credentials_exception
    if not usuario.get("status", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário desativado",
        )
    return usuario


async def get_current_active_user(
    current_user: dict = Depends(get_current_user),
) -> dict:
    # Status já verificado em get_current_user; mantém por clareza
    if not current_user.get("status", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Usuário inativo"
        )
    return current_user


# ── Arquivos ──────────────────────────────────────────────────────────────────
ALLOWED_DOC_EXTENSIONS = {".pdf", ".doc", ".docx"}
ALLOWED_IMG_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
ALLOWED_EXTENSIONS = ALLOWED_DOC_EXTENSIONS | ALLOWED_IMG_EXTENSIONS
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100 MB


async def salvar_arquivo(file: UploadFile, pasta: str) -> tuple[str, str]:
    """
    Faz upload do arquivo para o Cloudinary e retorna (public_id, secure_url).
    A secure_url é o valor persistido no banco e devolvido ao frontend.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="Arquivo sem nome")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Extensão não permitida. Use: {sorted(ALLOWED_EXTENSIONS)}",
        )

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Arquivo muito grande (máx 100 MB)")

    # Determina resource_type: PDFs e docs precisam de "raw"; imagens usam "image"
    resource_type = "image" if ext in ALLOWED_IMG_EXTENSIONS else "raw"

    try:
        result = cloudinary.uploader.upload(
            content,
            resource_type=resource_type,
            folder=pasta,
            use_filename=True,
            unique_filename=True,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao enviar arquivo para o Cloudinary: {e}")

    public_id: str = result["public_id"]
    secure_url: str = result["secure_url"]
    return public_id, secure_url


def deletar_arquivo(public_id_ou_url: str) -> bool:
    """Remove arquivo do Cloudinary pelo public_id ou URL."""
    if not public_id_ou_url:
        return False
    # Se for URL completa do Cloudinary, extrai o public_id
    if public_id_ou_url.startswith("http"):
        # Ex: https://res.cloudinary.com/<cloud>/raw/upload/v123/<folder>/<id>.pdf
        # O public_id é tudo após "/upload/v<version>/" sem a extensão
        try:
            partes = public_id_ou_url.split("/upload/")
            sem_versao = partes[1].split("/", 1)[1]  # remove "v<version>/"
            public_id = os.path.splitext(sem_versao)[0]
        except (IndexError, AttributeError):
            public_id = public_id_ou_url
    else:
        public_id = public_id_ou_url

    try:
        cloudinary.uploader.destroy(public_id, resource_type="raw")
        cloudinary.uploader.destroy(public_id, resource_type="image")
        return True
    except Exception:
        return False


# ── Routers ───────────────────────────────────────────────────────────────────
admin = APIRouter(prefix="/admin", tags=["Admin"])
noticia = APIRouter(prefix="/noticias", tags=["Notícias"])
documentos = APIRouter(prefix="/documentos", tags=["Documentos"])
projetos = APIRouter(prefix="/projetos", tags=["Projetos"])


# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root():
    return {"message": "API NPEC rodando 🚀", "version": "1.0.0", "status": "online"}


@app.get("/health", tags=["Health"])
async def health_check(db: AsyncIOMotorDatabase = Depends(get_database)):
    try:
        await db.command("ping")
        return {"status": "healthy", "database": "connected"}
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"status": "unhealthy", "database": "disconnected"},
        )


# ── Admin ─────────────────────────────────────────────────────────────────────
@admin.post("/registro", status_code=status.HTTP_201_CREATED)
async def registro_usuario(
    nome: str = Form(...),
    email: str = Form(...),
    senha: str = Form(...),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    if len(senha) < 6:
        raise HTTPException(status_code=400, detail="Senha deve ter no mínimo 6 caracteres")
    if len(senha.encode("utf-8")) > 72:
        raise HTTPException(status_code=400, detail="Senha muito longa (máx 72 bytes)")
    if await db.usuarios.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="E-mail já cadastrado")

    usuario = {
        "_id": str(uuid.uuid4()),
        "nome": nome,
        "email": email,
        "senha": gerar_hash_senha(senha),
        "status": True,
        "criado_em": datetime.now(timezone.utc),
        "atualizado_em": datetime.now(timezone.utc),
    }
    await db.usuarios.insert_one(usuario)
    return {"message": "Usuário criado com sucesso", "user_id": usuario["_id"]}


@admin.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    usuario = await db.usuarios.find_one({"email": form_data.username})
    if not usuario or not verificar_senha(form_data.password, usuario["senha"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not usuario.get("status", True):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Usuário desativado")

    return {
        "access_token": criar_token(usuario["_id"]),
        "token_type": "bearer",
        "user": {
            "id": usuario["_id"],
            "nome": usuario["nome"],
            "email": usuario["email"],
        },
    }


@admin.get("/me")
async def perfil_usuario(current_user: dict = Depends(get_current_active_user)):
    return {
        "id": current_user["_id"],
        "nome": current_user["nome"],
        "email": current_user["email"],
        "status": current_user.get("status", True),
        "criado_em": current_user.get("criado_em"),
    }


@admin.post("/refresh")
async def refresh_token(current_user: dict = Depends(get_current_user)):
    return {"access_token": criar_token(current_user["_id"]), "token_type": "bearer"}


@admin.put("/alterar_senha")
async def alterar_senha(
    old_password: str = Form(...),
    new_password: str = Form(...),
    current_user: dict = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    if not verificar_senha(old_password, current_user["senha"]):
        raise HTTPException(status_code=400, detail="Senha atual incorreta")
    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="Nova senha deve ter no mínimo 6 caracteres")
    if len(new_password.encode("utf-8")) > 72:
        raise HTTPException(status_code=400, detail="Nova senha muito longa (máx 72 bytes)")

    await db.usuarios.update_one(
        {"_id": current_user["_id"]},
        {
            "$set": {
                "senha": gerar_hash_senha(new_password),
                "atualizado_em": datetime.now(timezone.utc),
            }
        },
    )
    return {"message": "Senha alterada com sucesso"}


# ── Notícias ──────────────────────────────────────────────────────────────────
@noticia.post("/", status_code=status.HTTP_201_CREATED)
async def criar_noticia(
    request: Request,
    titulo: str = Form(..., min_length=3, max_length=200),
    conteudo: str = Form(..., min_length=10),
    descricao: Optional[str] = Form(None),
    imagem: Optional[UploadFile] = File(None),   # CORREÇÃO: campo de imagem adicionado
    current_user: dict = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    imagem_url: Optional[str] = None
    if imagem and imagem.filename:
        ext = os.path.splitext(imagem.filename)[1].lower()
        if ext not in ALLOWED_IMG_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Imagem deve ser: {sorted(ALLOWED_IMG_EXTENSIONS)}",
            )
        _, imagem_url = await salvar_arquivo(imagem, "npec/imagens")

    nova = {
        "_id": str(uuid.uuid4()),
        "titulo": titulo,
        "descricao": descricao,
        "conteudo": conteudo,
        "imagem_url": imagem_url,           # CORREÇÃO: persistido corretamente
        "usuario_id": current_user["_id"],
        "criado_em": datetime.now(timezone.utc),
        "atualizado_em": datetime.now(timezone.utc),
    }
    await db.noticias.insert_one(nova)
    return {"message": "Notícia criada com sucesso", "noticia_id": nova["_id"]}


@noticia.get("/")
async def listar_noticias(
    limit: int = 50,
    skip: int = 0,
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    if limit > 200:
        limit = 200  # Evita dumps acidentais gigantes
    cursor = db.noticias.find().sort("criado_em", -1).skip(skip).limit(limit)
    noticias = await cursor.to_list(length=limit)
    for item in noticias:
        item["id"] = item.pop("_id")
    return noticias


@noticia.get("/{noticia_id}")
async def buscar_noticia(
    noticia_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    item = await db.noticias.find_one({"_id": noticia_id})
    if not item:
        raise HTTPException(status_code=404, detail="Notícia não encontrada")
    item["id"] = item.pop("_id")
    return item


@noticia.put("/{noticia_id}")
async def atualizar_noticia(
    noticia_id: str,
    titulo: Optional[str] = Form(None),
    descricao: Optional[str] = Form(None),
    conteudo: Optional[str] = Form(None),
    imagem: Optional[UploadFile] = File(None),
    current_user: dict = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    existente = await db.noticias.find_one({"_id": noticia_id})
    if not existente:
        raise HTTPException(status_code=404, detail="Notícia não encontrada")

    update: dict = {}
    if titulo is not None:
        update["titulo"] = titulo
    if conteudo is not None:
        update["conteudo"] = conteudo
    if descricao is not None:
        update["descricao"] = descricao

    if imagem and imagem.filename:
        # Remove imagem antiga antes de salvar a nova
        if existente.get("imagem_url"):
            deletar_arquivo(existente["imagem_url"])
        ext = os.path.splitext(imagem.filename)[1].lower()
        if ext not in ALLOWED_IMG_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Imagem deve ser: {sorted(ALLOWED_IMG_EXTENSIONS)}",
            )
        _, update["imagem_url"] = await salvar_arquivo(imagem, "npec/imagens")

    if update:
        update["atualizado_em"] = datetime.now(timezone.utc)
        await db.noticias.update_one({"_id": noticia_id}, {"$set": update})

    return {"message": "Notícia atualizada com sucesso"}


@noticia.delete("/{noticia_id}", status_code=status.HTTP_200_OK)
async def deletar_noticia(
    noticia_id: str,
    current_user: dict = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    existente = await db.noticias.find_one({"_id": noticia_id})
    if not existente:
        raise HTTPException(status_code=404, detail="Notícia não encontrada")

    # Remove imagem do disco ao deletar a notícia
    if existente.get("imagem_url"):
        deletar_arquivo(existente["imagem_url"])

    await db.noticias.delete_one({"_id": noticia_id})
    return {"message": "Notícia removida com sucesso"}


# ── Documentos ────────────────────────────────────────────────────────────────
@documentos.post("/", status_code=status.HTTP_201_CREATED)
async def criar_documento(
    titulo: str = Form(..., min_length=3, max_length=200),
    descricao: Optional[str] = Form(None),
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    # CORREÇÃO: persiste url_relativa no banco (não o caminho absoluto do servidor)
    _, arquivo_url = await salvar_arquivo(file, "npec/documentos")
    doc = {
        "_id": str(uuid.uuid4()),
        "titulo": titulo,
        "descricao": descricao,
        "arquivo_url": arquivo_url,         # URL acessível pelo frontend
        "nome_original": file.filename,
        "usuario_id": current_user["_id"],
        "criado_em": datetime.now(timezone.utc),
        "atualizado_em": datetime.now(timezone.utc),
    }
    await db.documentos.insert_one(doc)
    return {"message": "Documento criado com sucesso", "documento_id": doc["_id"]}


@documentos.get("/")
async def listar_documentos(
    limit: int = 100,
    skip: int = 0,
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    if limit > 200:
        limit = 200
    cursor = db.documentos.find().sort("criado_em", -1).skip(skip).limit(limit)
    docs = await cursor.to_list(length=limit)
    for d in docs:
        d["id"] = d.pop("_id")
    return docs


@documentos.get("/{documento_id}")
async def buscar_documento(
    documento_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    doc = await db.documentos.find_one({"_id": documento_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Documento não encontrado")
    doc["id"] = doc.pop("_id")
    return doc


@documentos.put("/{documento_id}")
async def atualizar_documento(
    documento_id: str,
    titulo: Optional[str] = Form(None),
    descricao: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    if not await db.documentos.find_one({"_id": documento_id}):
        raise HTTPException(status_code=404, detail="Documento não encontrado")

    update: dict = {}
    if titulo is not None:
        update["titulo"] = titulo
    if descricao is not None:
        update["descricao"] = descricao

    if update:
        update["atualizado_em"] = datetime.now(timezone.utc)
        await db.documentos.update_one({"_id": documento_id}, {"$set": update})

    return {"message": "Documento atualizado com sucesso"}


@documentos.delete("/{documento_id}")
async def deletar_documento(
    documento_id: str,
    current_user: dict = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    doc = await db.documentos.find_one({"_id": documento_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Documento não encontrado")

    deletar_arquivo(doc.get("arquivo_url", ""))
    await db.documentos.delete_one({"_id": documento_id})
    return {"message": "Documento removido com sucesso"}


# ── Projetos ──────────────────────────────────────────────────────────────────
STATUS_PROJETOS = [
    "Em desenvolvimento",
    "Fase de testes",
    "Planejamento",
    "Lançado",
    "Publicação Aberta",
]


@projetos.post("/", status_code=status.HTTP_201_CREATED)
async def criar_projeto(
    titulo: str = Form(..., min_length=3, max_length=200),
    categoria: str = Form(..., min_length=2, max_length=100),
    descricao: str = Form(..., min_length=10),
    status_projeto: str = Form("Em desenvolvimento"),
    imagem: Optional[UploadFile] = File(None),
    current_user: dict = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    if status_projeto not in STATUS_PROJETOS:
        raise HTTPException(
            status_code=400,
            detail=f"Status inválido. Opções: {STATUS_PROJETOS}",
        )

    imagem_url: Optional[str] = None
    if imagem and imagem.filename:
        ext = os.path.splitext(imagem.filename)[1].lower()
        if ext not in ALLOWED_IMG_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Imagem deve ser: {sorted(ALLOWED_IMG_EXTENSIONS)}",
            )
        _, imagem_url = await salvar_arquivo(imagem, "npec/projetos")

    novo = {
        "_id": str(uuid.uuid4()),
        "titulo": titulo,
        "categoria": categoria,
        "descricao": descricao,
        "status": status_projeto,
        "imagem_url": imagem_url,
        "usuario_id": current_user["_id"],
        "criado_em": datetime.now(timezone.utc),
        "atualizado_em": datetime.now(timezone.utc),
    }
    await db.projetos.insert_one(novo)
    return {"message": "Projeto criado com sucesso", "projeto_id": novo["_id"]}


@projetos.get("/")
async def listar_projetos(
    limit: int = 50,
    skip: int = 0,
    status_filtro: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    if limit > 200:
        limit = 200
    filtro: dict = {}
    if status_filtro:
        if status_filtro not in STATUS_PROJETOS:
            raise HTTPException(
                status_code=400,
                detail=f"Status inválido. Opções: {STATUS_PROJETOS}",
            )
        filtro["status"] = status_filtro
    cursor = db.projetos.find(filtro).sort("criado_em", -1).skip(skip).limit(limit)
    lista = await cursor.to_list(length=limit)
    for item in lista:
        item["id"] = item.pop("_id")
    return lista


@projetos.get("/status")
async def listar_status_projetos():
    """Retorna todos os status disponíveis para projetos."""
    return {"status": STATUS_PROJETOS}


@projetos.get("/{projeto_id}")
async def buscar_projeto(
    projeto_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    item = await db.projetos.find_one({"_id": projeto_id})
    if not item:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    item["id"] = item.pop("_id")
    return item


@projetos.put("/{projeto_id}")
async def atualizar_projeto(
    projeto_id: str,
    titulo: Optional[str] = Form(None),
    categoria: Optional[str] = Form(None),
    descricao: Optional[str] = Form(None),
    status_projeto: Optional[str] = Form(None),
    imagem: Optional[UploadFile] = File(None),
    current_user: dict = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    existente = await db.projetos.find_one({"_id": projeto_id})
    if not existente:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")

    update: dict = {}
    if titulo is not None:
        update["titulo"] = titulo
    if categoria is not None:
        update["categoria"] = categoria
    if descricao is not None:
        update["descricao"] = descricao
    if status_projeto is not None:
        if status_projeto not in STATUS_PROJETOS:
            raise HTTPException(
                status_code=400,
                detail=f"Status inválido. Opções: {STATUS_PROJETOS}",
            )
        update["status"] = status_projeto

    if imagem and imagem.filename:
        if existente.get("imagem_url"):
            deletar_arquivo(existente["imagem_url"])
        ext = os.path.splitext(imagem.filename)[1].lower()
        if ext not in ALLOWED_IMG_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Imagem deve ser: {sorted(ALLOWED_IMG_EXTENSIONS)}",
            )
        _, update["imagem_url"] = await salvar_arquivo(imagem, "npec/projetos")

    if update:
        update["atualizado_em"] = datetime.now(timezone.utc)
        await db.projetos.update_one({"_id": projeto_id}, {"$set": update})

    return {"message": "Projeto atualizado com sucesso"}


@projetos.delete("/{projeto_id}", status_code=status.HTTP_200_OK)
async def deletar_projeto(
    projeto_id: str,
    current_user: dict = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    existente = await db.projetos.find_one({"_id": projeto_id})
    if not existente:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")

    if existente.get("imagem_url"):
        deletar_arquivo(existente["imagem_url"])

    await db.projetos.delete_one({"_id": projeto_id})
    return {"message": "Projeto removido com sucesso"}


# ── Registrar routers ─────────────────────────────────────────────────────────
app.include_router(admin)
app.include_router(noticia)
app.include_router(documentos)
app.include_router(projetos)
