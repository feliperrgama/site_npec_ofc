import os
from typing import Optional

import certifi
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

load_dotenv()

MONGO_URL: str = os.getenv("MONGO_URL", "mongodb://admin:admin123@mongodb:27017")
DATABASE_NAME: str = os.getenv("DATABASE_NAME", "npec")


class Database:
    """Gerencia o ciclo de vida da conexão com o MongoDB."""

    def __init__(self) -> None:
        self.client: Optional[AsyncIOMotorClient] = None
        self.db: Optional[AsyncIOMotorDatabase] = None

    async def connect(self) -> None:
        if self.client is not None:
            return

        use_tls = MONGO_URL.startswith("mongodb+srv") or "tls=true" in MONGO_URL.lower()

        kwargs: dict = {}
        if use_tls:
            kwargs["tls"] = True
            kwargs["tlsCAFile"] = certifi.where()

        self.client = AsyncIOMotorClient(MONGO_URL, **kwargs)
        self.db = self.client[DATABASE_NAME]

        await self.client.admin.command("ping")
        print(f"✅ Conectado ao MongoDB: {DATABASE_NAME}")

    async def disconnect(self) -> None:
        if self.client:
            self.client.close()
            self.client = None
            self.db = None
            print("👋 Conexão com MongoDB fechada")

    def get_db(self) -> AsyncIOMotorDatabase:
        if self.db is None:
            raise RuntimeError("Database não conectado. Chame connect() primeiro.")
        return self.db


# Instância global — usada via lifespan em main.py
database = Database()


async def get_database() -> AsyncIOMotorDatabase:
    """Dependência FastAPI que garante a conexão antes de retornar o db."""
    if database.db is None:
        await database.connect()
    return database.get_db()
