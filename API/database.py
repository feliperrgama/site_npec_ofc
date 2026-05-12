import os
import asyncio
from typing import Optional

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

load_dotenv()


MONGO_URL = os.getenv("MONGO_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME", "npec")


class Database:
    def __init__(self):
        self._client: Optional[AsyncIOMotorClient] = None
        self._db: Optional[AsyncIOMotorDatabase] = None
        self._lock = asyncio.Lock()

    async def connect(self) -> None:
        async with self._lock:
            if self._client is not None:
                return

            if not MONGO_URL:
                raise RuntimeError("MONGO_URL não definida no ambiente")

            kwargs = {}

            # Atlas usa TLS automaticamente
            if MONGO_URL.startswith("mongodb+srv://"):
                import certifi
                kwargs.update(
                    tls=True,
                    tlsCAFile=certifi.where()
                )

            self._client = AsyncIOMotorClient(
                MONGO_URL,
                maxPoolSize=20,
                minPoolSize=5,
                serverSelectionTimeoutMS=10000,
                **kwargs
            )

            # Teste real de conexão
            await self._client.admin.command("ping")

            self._db = self._client[DATABASE_NAME]

            print(f"[MongoDB] conectado em '{DATABASE_NAME}'")

    async def disconnect(self) -> None:
        if self._client:
            self._client.close()
            self._client = None
            self._db = None
            print("[MongoDB] desconectado")

    def get_db(self) -> AsyncIOMotorDatabase:
        if self._db is None:
            raise RuntimeError("MongoDB não conectado")
        return self._db


database = Database()


async def get_database():
    if database._db is None:
        await database.connect()
    return database.get_db()
