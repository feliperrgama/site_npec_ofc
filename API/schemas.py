from datetime import datetime
from enum import Enum
from typing import Optional, Annotated, Any

from bson import ObjectId
from pydantic import BaseModel, ConfigDict, Field, EmailStr
from pydantic_core import core_schema


class PyObjectId(ObjectId):
    """ObjectId compatível com Pydantic v2."""

    @classmethod
    def __get_pydantic_core_schema__(
        cls, _source_type: Any, _handler: Any
    ) -> core_schema.CoreSchema:
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(ObjectId),
                core_schema.chain_schema([
                    core_schema.str_schema(),
                    core_schema.no_info_plain_validator_function(cls.validate),
                ]),
            ]),
            serialization=core_schema.plain_serializer_res_schema(
                function=lambda v: str(v),
                return_schema=core_schema.str_schema(),
                when_used="json",
            ),
        )

    @classmethod
    def validate(cls, v: str) -> "PyObjectId":
        if not ObjectId.is_valid(v):
            raise ValueError(f"ObjectId inválido: {v!r}")
        return cls(v)


# ── Configuração padrão ──────────────────────────────────────────────────────
_cfg = ConfigDict(
    populate_by_name=True,
    arbitrary_types_allowed=True,
    json_encoders={ObjectId: str},
)


# ── Usuários ─────────────────────────────────────────────────────────────────
class UsuarioBase(BaseModel):
    nome: str = Field(..., min_length=3, max_length=100)
    email: EmailStr


class CriarUsuario(UsuarioBase):
    senha: str = Field(..., min_length=6, max_length=72)


class LoginUsuario(BaseModel):
    email: EmailStr
    senha: str


class UsuarioResponse(UsuarioBase):
    model_config = _cfg

    id: str = Field(..., alias="_id")
    status: bool                          # campo correto no banco (era "ativo")
    criado_em: Optional[datetime] = None


class AlterarSenha(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=6, max_length=72)


# ── Notícias ─────────────────────────────────────────────────────────────────
class NoticiaBase(BaseModel):
    titulo: str = Field(..., min_length=3, max_length=200)
    conteudo: str = Field(..., min_length=10)
    descricao: Optional[str] = Field(None, max_length=500)


class CriarNoticia(NoticiaBase):
    pass


class AtualizarNoticia(BaseModel):
    titulo: Optional[str] = Field(None, min_length=3, max_length=200)
    conteudo: Optional[str] = Field(None, min_length=10)
    descricao: Optional[str] = Field(None, max_length=500)


class NoticiaResponse(NoticiaBase):
    model_config = _cfg

    id: str = Field(..., alias="_id")
    imagem_url: Optional[str] = None
    usuario_id: str
    criado_em: datetime
    atualizado_em: Optional[datetime] = None


# ── Documentos ───────────────────────────────────────────────────────────────
class DocumentoBase(BaseModel):
    titulo: str = Field(..., min_length=3, max_length=200)
    descricao: Optional[str] = Field(None, max_length=500)


class CriarDocumento(DocumentoBase):
    pass


class AtualizarDocumento(BaseModel):
    titulo: Optional[str] = Field(None, min_length=3, max_length=200)
    descricao: Optional[str] = Field(None, max_length=500)


class DocumentoResponse(DocumentoBase):
    model_config = _cfg

    id: str = Field(..., alias="_id")
    arquivo_url: str
    nome_original: str
    usuario_id: str
    criado_em: datetime
    atualizado_em: Optional[datetime] = None


# ── Token ────────────────────────────────────────────────────────────────────
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    usuario_id: Optional[str] = None


# ── Respostas padrão ─────────────────────────────────────────────────────────
class MensagemResponse(BaseModel):
    message: str
    detail: Optional[str] = None


class ErrorResponse(BaseModel):
    detail: str
    status_code: int


# ── Projetos ─────────────────────────────────────────────────────────────────
class StatusProjeto(str, Enum):
    em_desenvolvimento = "Em desenvolvimento"
    fase_de_testes = "Fase de testes"
    planejamento = "Planejamento"
    lancado = "Lançado"
    publicacao_aberta = "Publicação Aberta"


class ProjetoBase(BaseModel):
    titulo: str = Field(..., min_length=3, max_length=200)
    categoria: str = Field(..., min_length=2, max_length=100)
    descricao: str = Field(..., min_length=10)
    status: StatusProjeto = StatusProjeto.em_desenvolvimento


class CriarProjeto(ProjetoBase):
    pass


class AtualizarProjeto(BaseModel):
    titulo: Optional[str] = Field(None, min_length=3, max_length=200)
    categoria: Optional[str] = Field(None, min_length=2, max_length=100)
    descricao: Optional[str] = Field(None, min_length=10)
    status: Optional[StatusProjeto] = None


class ProjetoResponse(ProjetoBase):
    model_config = _cfg

    id: str = Field(..., alias="_id")
    imagem_url: Optional[str] = None
    usuario_id: str
    criado_em: datetime
    atualizado_em: Optional[datetime] = None
