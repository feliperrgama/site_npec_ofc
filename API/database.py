from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL") or "mongodb://localhost:27017"
DATABASE_NAME = os.getenv("DATABASE_NAME") or "npec"


class Database:
    def __init__(self):
        self.client: Optional[AsyncIOMotorClient] = None
        self.db = None

    async def connect(self):
        if not self.client:
            self.client = AsyncIOMotorClient(MONGO_URL)
            self.db = self.client[DATABASE_NAME]

            await self.client.admin.command('ping')
            print(f"✅ Conectado ao MongoDB: {DATABASE_NAME}")

    async def disconnect(self):
        if self.client:
            self.client.close()
            print("👋 Conexão com MongoDB fechada")

    def get_db(self):
        if not self.db:
            raise Exception("Database não conectado. Chame connect() primeiro")
        return self.db

database = Database()

client = AsyncIOMotorClient(MONGO_URL)
db = client[DATABASE_NAME]


async def get_database():
    if not database.db:
        await database.connect()
    return database.get_db()