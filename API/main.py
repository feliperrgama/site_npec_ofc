import os
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional, List
import bcrypt

from fastapi import FastAPI, HTTPException, Depends, APIRouter, UploadFile, File, Form, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from jose import JWTError, jwt
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY") or "secret-dev"
ALGORITHM = os.getenv("ALGORITHM") or "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES") or 30)
MONGO_URL = os.getenv("MONGO_URL") or "mongodb+srv://npec_db_user:Rx33zk4N5LI5XXI8@npec.5kslodu.mongodb.net/"

client = AsyncIOMotorClient(MONGO_URL)
db = client.npec
app = FastAPI(title="API NPEC", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://npecfainor.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="admin/login")

# UPLOADS
UPLOAD_BASE = "Back_End/uploads"
DOCS_DIR = os.path.join(UPLOAD_BASE, "documentos")

os.makedirs(DOCS_DIR, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=UPLOAD_BASE), name="uploads")


# FUNÇÕES DE SEGURANÇA
def gerar_hash_senha(senha: str) -> str:
    senha_bytes = senha.encode('utf-8')
    if len(senha_bytes) > 72:
        senha_bytes = senha_bytes[:72]

    salt = bcrypt.gensalt(rounds=12)
    hash_bytes = bcrypt.hashpw(senha_bytes, salt)

    return hash_bytes.decode('utf-8')


def verificar_senha(senha: str, senha_hash: str) -> bool:
    senha_bytes = senha.encode('utf-8')
    if len(senha_bytes) > 72:
        senha_bytes = senha_bytes[:72]
    try:
        return bcrypt.checkpw(senha_bytes, senha_hash.encode('utf-8'))
    except Exception:
        return False


def criar_token(id_usuario: str) -> str:
    expiracao = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": id_usuario, "exp": expiracao}, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        usuario_id: str = payload.get("sub")
        if usuario_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    usuario = await db.usuarios.find_one({"_id": usuario_id})
    if usuario is None:
        raise credentials_exception

    if not usuario.get("status", True):
        raise HTTPException(status_code=403, detail="Usuário desativado")

    return usuario


async def get_current_active_user(current_user: dict = Depends(get_current_user)) -> dict:
    if not current_user.get("status", True):
        raise HTTPException(status_code=400, detail="Usuário inativo")
    return current_user


async def salvar_arquivo(file: UploadFile, pasta: str) -> str:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Arquivo sem nome")

    allowed_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx'}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"Extensão não permitida. Use: {allowed_extensions}")

    nome = f"{uuid.uuid4()}{ext}"
    caminho = os.path.join(pasta, nome)

    try:
        content = await file.read()
        if len(content) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Arquivo muito grande (máx 10MB)")

        with open(caminho, "wb") as buffer:
            buffer.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar arquivo: {str(e)}")

    return caminho


def deletar_arquivo(caminho: str) -> bool:
    if caminho and os.path.exists(caminho):
        try:
            os.remove(caminho)
            return True
        except Exception:
            return False
    return False


# ROTAS
admin = APIRouter(prefix="/admin", tags=["Admin"])
noticia = APIRouter(prefix="/noticias", tags=["Notícias"])
documentos = APIRouter(prefix="/documentos", tags=["Documentos"])


# Verificação de Funcionamento
@app.get("/")
async def root():
    return {
        "message": "API NPEC rodando 🚀",
        "version": "1.0.0",
        "status": "online"
    }


@app.get("/health")
async def health_check():
    try:
        await db.command("ping")
        return {"status": "healthy", "database": "connected"}
    except Exception:
        return {"status": "unhealthy", "database": "disconnected"}


# ADMIN
@admin.post("/registro")
async def registro_usuario(
        nome: str = Form(...),
        email: str = Form(...),
        senha: str = Form(...)
):
    # Validações
    if len(senha) < 6:
        raise HTTPException(status_code=400, detail="Senha deve ter no mínimo 6 caracteres")
    senha_bytes = len(senha.encode('utf-8'))
    if senha_bytes > 72:
        raise HTTPException(status_code=400, detail=f"Senha muito longa: {senha_bytes} bytes. Máximo 72 bytes.")

    if await db.usuarios.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email já existe")

    usuario = {
        "_id": str(uuid.uuid4()),
        "nome": nome,
        "email": email,
        "senha": gerar_hash_senha(senha),
        "status": True,
        "criado_em": datetime.now(timezone.utc)
    }

    await db.usuarios.insert_one(usuario)
    return {"message": "Usuário criado com sucesso", "user_id": usuario["_id"]}


@admin.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    usuario = await db.usuarios.find_one({"email": form_data.username})

    if not usuario or not verificar_senha(form_data.password, usuario["senha"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not usuario.get("status", True):
        raise HTTPException(status_code=403, detail="Usuário desativado")

    access_token = criar_token(usuario["_id"])

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": usuario["_id"],
            "nome": usuario["nome"],
            "email": usuario["email"]
        }
    }


@admin.get("/me")
async def perfil_usuario(current_user: dict = Depends(get_current_active_user)):
    return {
        "id": current_user["_id"],
        "nome": current_user["nome"],
        "email": current_user["email"],
        "status": current_user.get("status", True),
        "criado_em": current_user.get("criado_em")
    }


@admin.post("/refresh")
async def refresh_token(current_user: dict = Depends(get_current_user)):
    new_token = criar_token(current_user["_id"])
    return {
        "access_token": new_token,
        "token_type": "bearer"
    }


@admin.put("/alterar_senha")
async def alterar_senha(
        old_password: str = Form(...),
        new_password: str = Form(...),
        current_user: dict = Depends(get_current_active_user)
):
    if not verificar_senha(old_password, current_user["senha"]):
        raise HTTPException(status_code=400, detail="Senha atual incorreta")

    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="Nova senha deve ter no mínimo 6 caracteres")
    if len(new_password.encode('utf-8')) > 72:
        raise HTTPException(status_code=400, detail="Nova senha muito longa. Máximo 72 bytes.")

    await db.usuarios.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"senha": gerar_hash_senha(new_password)}}
    )

    return {"message": "Senha alterada com sucesso"}


# NOTÍCIAS
@noticia.post("/")
async def criar_noticia(
        current_user: dict = Depends(get_current_active_user),
        titulo: str = Form(..., min_length=3, max_length=200),
        descricao: Optional[str] = Form(None),
        conteudo: str = Form(..., min_length=10),
):

    nova_noticia = {
        "_id": str(uuid.uuid4()),
        "titulo": titulo,
        "descricao": descricao,
        "conteudo": conteudo,
        "usuario_id": current_user["_id"],
        "criado_em": datetime.now(timezone.utc),
        "atualizado_em": datetime.now(timezone.utc)
    }

    await db.noticias.insert_one(nova_noticia)
    return {"message": "Notícia criada com sucesso", "noticia_id": nova_noticia["_id"]}


@noticia.get("/")
async def listar_noticias(limit: int = 50, skip: int = 0):
    cursor = db.noticias.find().sort("criado_em", -1).skip(skip).limit(limit)
    noticias = await cursor.to_list(length=limit)

    # Converter para formato serializável
    for noticia_item in noticias:
        noticia_item["id"] = noticia_item["_id"]
        if "_id" in noticia_item:
            del noticia_item["_id"]

    return noticias


@noticia.get("/{noticia_id}")
async def buscar_noticia(noticia_id: str):
    noticia_item = await db.noticias.find_one({"_id": noticia_id})
    if not noticia_item:
        raise HTTPException(status_code=404, detail="Notícia não encontrada")

    noticia_item["id"] = noticia_item["_id"]
    del noticia_item["_id"]
    return noticia_item


@noticia.put("/{noticia_id}")
async def atualizar_noticia(
        noticia_id: str,
        current_user: dict = Depends(get_current_active_user),  # Adicionado para segurança
        titulo: Optional[str] = Form(None),
        descricao: Optional[str] = Form(None),
        conteudo: Optional[str] = Form(None),
):
    noticia_item = await db.noticias.find_one({"_id": noticia_id})
    if not noticia_item:
        raise HTTPException(status_code=404, detail="Notícia não encontrada")

    update_data = {}
    if titulo:
        update_data["titulo"] = titulo
    if conteudo:
        update_data["conteudo"] = conteudo
    if descricao is not None:
        update_data["descricao"] = descricao

    if update_data:
        update_data["atualizado_em"] = datetime.now(timezone.utc)
        await db.noticias.update_one({"_id": noticia_id}, {"$set": update_data})

    return {"message": "Notícia atualizada com sucesso"}


@noticia.delete("/{noticia_id}")
async def deletar_noticia(noticia_id: str, current_user: dict = Depends(get_current_active_user)):
    noticia_item = await db.noticias.find_one({"_id": noticia_id})

    if not noticia_item:
        raise HTTPException(status_code=404, detail="Notícia não encontrada")

    await db.noticias.delete_one({"_id": noticia_id})
    return {"message": "Notícia removida com sucesso"}


# DOCUMENTOS
@documentos.post("/")
async def criar_documento(
        current_user: dict = Depends(get_current_active_user),
        titulo: str = Form(..., min_length=3, max_length=200),
        descricao: Optional[str] = Form(None),
        file: UploadFile = File(...)
):
    caminho = await salvar_arquivo(file, DOCS_DIR)

    documento = {
        "_id": str(uuid.uuid4()),
        "titulo": titulo,
        "descricao": descricao,
        "arquivo_url": caminho,
        "nome_original": file.filename,
        "usuario_id": current_user["_id"],
        "criado_em": datetime.now(timezone.utc)
    }

    await db.documentos.insert_one(documento)
    return {"message": "Documento criado com sucesso", "documento_id": documento["_id"]}


@documentos.get("/")
async def listar_documentos(limit: int = 100, skip: int = 0):
    cursor = db.documentos.find().skip(skip).limit(limit)
    documentos_list = await cursor.to_list(length=limit)

    for doc in documentos_list:
        doc["id"] = doc["_id"]
        if "_id" in doc:
            del doc["_id"]

    return documentos_list


@documentos.get("/{documento_id}")
async def buscar_documento(documento_id: str):
    documento = await db.documentos.find_one({"_id": documento_id})
    if not documento:
        raise HTTPException(status_code=404, detail="Documento não encontrado")

    documento["id"] = documento["_id"]
    del documento["_id"]
    return documento


@documentos.put("/{documento_id}")
async def atualizar_documento(
        documento_id: str,
        current_user: dict = Depends(get_current_active_user),
        titulo: Optional[str] = Form(None),
        descricao: Optional[str] = Form(None)
):
    """Atualiza um documento existente"""
    documento = await db.documentos.find_one({"_id": documento_id})
    if not documento:
        raise HTTPException(status_code=404, detail="Documento não encontrado")

    update_data = {}
    if titulo:
        update_data["titulo"] = titulo
    if descricao is not None:
        update_data["descricao"] = descricao

    if update_data:
        update_data["atualizado_em"] = datetime.now(timezone.utc)
        await db.documentos.update_one({"_id": documento_id}, {"$set": update_data})

    return {"message": "Documento atualizado com sucesso"}


@documentos.delete("/{documento_id}")
async def deletar_documento(documento_id: str, current_user: dict = Depends(get_current_active_user)):
    documento = await db.documentos.find_one({"_id": documento_id})

    if not documento:
        raise HTTPException(status_code=404, detail="Documento não encontrado")

    if documento.get("arquivo_url"):
        deletar_arquivo(documento["arquivo_url"])

    await db.documentos.delete_one({"_id": documento_id})
    return {"message": "Documento removido com sucesso"}


app.include_router(admin)
app.include_router(noticia)
app.include_router(documentos)


@app.on_event("startup")
async def startup_event():
    await db.usuarios.create_index("email", unique=True)
    await db.noticias.create_index("criado_em")
    await db.documentos.create_index("titulo")
    print("✅ Aplicação iniciada com sucesso")
    print(f"📁 Uploads configurado em: {UPLOAD_BASE}")


@app.on_event("shutdown")
async def shutdown_event():
    client.close()
    print("👋 Aplicação finalizada")