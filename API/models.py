from datetime import datetime, timezone
from enum import Enum
from typing import Optional, Any

from bson import ObjectId
from pydantic import BaseModel, Field, EmailStr, ConfigDict
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


_model_config = ConfigDict(
    populate_by_name=True,
    arbitrary_types_allowed=True,
    json_encoders={ObjectId: str},
)


class UsuarioModel(BaseModel):
    model_config = _model_config

    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    nome: str
    email: EmailStr
    senha: str
    status: bool = True
    criado_em: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    atualizado_em: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class NoticiaModel(BaseModel):
    model_config = _model_config

    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    titulo: str = Field(..., max_length=200)
    conteudo: str
    descricao: Optional[str] = None
    imagem_url: Optional[str] = None
    usuario_id: str
    criado_em: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    atualizado_em: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class DocumentoModel(BaseModel):
    model_config = _model_config

    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    titulo: str = Field(..., max_length=200)
    descricao: Optional[str] = None          # campo corrigido (era "descri")
    arquivo_url: str
    nome_original: str                        # campo ausente no modelo original
    usuario_id: str
    criado_em: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    atualizado_em: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusProjeto(str, Enum):
    em_desenvolvimento = "Em desenvolvimento"
    fase_de_testes = "Fase de testes"
    planejamento = "Planejamento"
    lancado = "Lançado"
    publicacao_aberta = "Publicação Aberta"


class ProjetoModel(BaseModel):
    model_config = _model_config

    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    titulo: str = Field(..., max_length=200)
    categoria: str
    descricao: str
    status: StatusProjeto = StatusProjeto.em_desenvolvimento
    imagem_url: Optional[str] = None
    usuario_id: str
    criado_em: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    atualizado_em: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
