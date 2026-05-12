import os
import sys
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from typing import Optional

# Garante que a pasta onde este arquivo está seja sempre encontrada,
# independente de onde o uvicorn for iniciado (raiz ou dentro de API/).
sys.path.insert(0, os.path.dirname(__file__))

import bcrypt
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends, APIRouter, UploadFile, File, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from jose import JWTError, jwt
from motor.motor_asyncio import AsyncIOMotorDatabase

from database import database, get_database

# Carrega o .env da mesma pasta do main.py (API/.env), funciona de qualquer CWD
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

SECRET_KEY: str = os.getenv("SECRET_KEY", "secret-dev")
ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# ── Uploads ──────────────────────────────────────────────────────────────────
# Caminho absoluto → sempre relativo à pasta API/, independente do CWD
_BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_BASE = os.path.join(_BASE_DIR, "uploads")
DOCS_DIR = os.path.join(UPLOAD_BASE, "documentos")
os.makedirs(DOCS_DIR, exist_ok=True)

# ── Lifespan (substitui os eventos deprecated on_event) ──────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await database.connect()
    db = database.get_db()
    await db.usuarios.create_index("email", unique=True)
    await db.noticias.create_index("criado_em")
    await db.documentos.create_index("titulo")
    print("✅ Aplicação iniciada com sucesso")
    print(f"📁 Uploads configurado em: {UPLOAD_BASE}")

    yield

    # Shutdown
    await database.disconnect()


app = FastAPI(title="API NPEC", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=UPLOAD_BASE), name="uploads")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="admin/login")


# ── Segurança ─────────────────────────────────────────────────────────────────
def gerar_hash_senha(senha: str) -> str:
    senha_bytes = senha.encode("utf-8")[:72]
    return bcrypt.hashpw(senha_bytes, bcrypt.gensalt(rounds=12)).decode("utf-8")


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
        if usuario_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    usuario = await db.usuarios.find_one({"_id": usuario_id})
    if usuario is None:
        raise credentials_exception
    if not usuario.get("status", True):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Usuário desativado")
    return usuario


async def get_current_active_user(
    current_user: dict = Depends(get_current_user),
) -> dict:
    if not current_user.get("status", True):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Usuário inativo")
    return current_user


# ── Arquivos ──────────────────────────────────────────────────────────────────
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".pdf", ".doc", ".docx"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


async def salvar_arquivo(file: UploadFile, pasta: str) -> str:
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
        raise HTTPException(status_code=400, detail="Arquivo muito grande (máx 10 MB)")

    nome = f"{uuid.uuid4()}{ext}"
    caminho = os.path.join(pasta, nome)
    try:
        with open(caminho, "wb") as f:
            f.write(content)
    except OSError as e:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar arquivo: {e}")

    return caminho


def deletar_arquivo(caminho: str) -> bool:
    if caminho and os.path.exists(caminho):
        try:
            os.remove(caminho)
            return True
        except OSError:
            pass
    return False


# ── Routers ───────────────────────────────────────────────────────────────────
admin = APIRouter(prefix="/admin", tags=["Admin"])
noticia = APIRouter(prefix="/noticias", tags=["Notícias"])
documentos = APIRouter(prefix="/documentos", tags=["Documentos"])


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
        return {"status": "unhealthy", "database": "disconnected"}


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
        raise HTTPException(status_code=400, detail="Senha muito longa. Máximo 72 bytes.")
    if await db.usuarios.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email já cadastrado")

    usuario = {
        "_id": str(uuid.uuid4()),
        "nome": nome,
        "email": email,
        "senha": gerar_hash_senha(senha),
        "status": True,
        "criado_em": datetime.now(timezone.utc),
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
        "user": {"id": usuario["_id"], "nome": usuario["nome"], "email": usuario["email"]},
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
        raise HTTPException(status_code=400, detail="Nova senha muito longa. Máximo 72 bytes.")

    await db.usuarios.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"senha": gerar_hash_senha(new_password)}},
    )
    return {"message": "Senha alterada com sucesso"}


# ── Notícias ──────────────────────────────────────────────────────────────────
@noticia.post("/", status_code=status.HTTP_201_CREATED)
async def criar_noticia(
    titulo: str = Form(..., min_length=3, max_length=200),
    conteudo: str = Form(..., min_length=10),
    descricao: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    nova = {
        "_id": str(uuid.uuid4()),
        "titulo": titulo,
        "descricao": descricao,
        "conteudo": conteudo,
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
    current_user: dict = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    if not await db.noticias.find_one({"_id": noticia_id}):
        raise HTTPException(status_code=404, detail="Notícia não encontrada")

    update: dict = {}
    if titulo:
        update["titulo"] = titulo
    if conteudo:
        update["conteudo"] = conteudo
    if descricao is not None:
        update["descricao"] = descricao

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
    if not await db.noticias.find_one({"_id": noticia_id}):
        raise HTTPException(status_code=404, detail="Notícia não encontrada")
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
    caminho = await salvar_arquivo(file, DOCS_DIR)
    doc = {
        "_id": str(uuid.uuid4()),
        "titulo": titulo,
        "descricao": descricao,
        "arquivo_url": caminho,
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
    if titulo:
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


# ── Registrar routers ─────────────────────────────────────────────────────────
app.include_router(admin)
app.include_router(noticia)
app.include_router(documentos)
