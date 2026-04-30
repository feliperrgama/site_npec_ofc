from pydantic import BaseModel, ConfigDict, Field, EmailStr
from typing import Optional, Annotated, Any
from pydantic_core import core_schema
from bson import ObjectId
from datetime import datetime


class PyObjectId(ObjectId):
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
                when_used='json'
            ),
        )

    @classmethod
    def validate(cls, v: str) -> ObjectId:
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)


#USUÁRIOS
class UsuarioBase(BaseModel):
    nome: str = Field(..., min_length=3, max_length=100, description="Nome do usuário")
    email: EmailStr = Field(..., description="Email do usuário")


class CriarUsuario(UsuarioBase):
    senha: str = Field(
        ...,
        min_length=6,
        max_length=72,
        description="Senha do usuário (6-72 caracteres)"
    )
    ativo: Optional[bool] = Field(True, description="Status do usuário")


class LoginUsuario(BaseModel):
    email: EmailStr = Field(..., description="Email do usuário")
    senha: str = Field(..., description="Senha do usuário")


class UsuarioResponse(UsuarioBase):
    id: Annotated[PyObjectId, Field(alias="_id")]
    ativo: bool
    criado_em: Optional[datetime] = None

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )


class UsuarioInDB(UsuarioResponse):
    senha: str  # Hash da senha


#NOTÍCIAS
class NoticiaBase(BaseModel):
    titulo: str = Field(..., min_length=3, max_length=200, description="Título da notícia")
    conteudo: str = Field(..., min_length=10, description="Conteúdo da notícia")
    descricao: Optional[str] = Field(None, max_length=500, description="Descrição resumida")


class CriarNoticia(NoticiaBase):
    pass


class AtualizarNoticia(BaseModel):
    titulo: Optional[str] = Field(None, min_length=3, max_length=200)
    conteudo: Optional[str] = Field(None, min_length=10)
    descricao: Optional[str] = Field(None, max_length=500)


class NoticiaResponse(NoticiaBase):
    id: Annotated[PyObjectId, Field(alias="_id")]
    imagem_url: Optional[str] = None
    usuario_id: str
    criado_em: datetime
    atualizado_em: Optional[datetime] = None

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

#DOCUMENTOS
class DocumentoBase(BaseModel):
    titulo: str = Field(..., min_length=3, max_length=200, description="Título do documento")
    descricao: Optional[str] = Field(None, max_length=500, description="Descrição do documento")


class CriarDocumento(DocumentoBase):
    pass


class AtualizarDocumento(BaseModel):
    titulo: Optional[str] = Field(None, min_length=3, max_length=200)
    descricao: Optional[str] = Field(None, max_length=500)


class DocumentoResponse(DocumentoBase):
    id: Annotated[PyObjectId, Field(alias="_id")]
    arquivo_url: str
    nome_original: str
    usuario_id: str
    criado_em: datetime
    atualizado_em: Optional[datetime] = None

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )


#TOKEN
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    usuario_id: Optional[str] = None


#RESPOSTAS PADRÃO
class MensagemResponse(BaseModel):
    message: str
    detail: Optional[str] = None


class ErrorResponse(BaseModel):
    detail: str
    status_code: int