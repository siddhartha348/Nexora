import asyncio
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import copy
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.errors import ServerSelectionTimeoutError
from app.core.config import settings

class MockCursor:
    def __init__(self, items: List[Dict[str, Any]]):
        self._items = items
        self._index = 0

    def sort(self, key_or_list, direction=1):
        if isinstance(key_or_list, str):
            key = key_or_list
            reverse = direction == -1
        elif isinstance(key_or_list, list) and len(key_or_list) > 0:
            key, direction = key_or_list[0]
            reverse = direction == -1
        else:
            return self
        self._items.sort(key=lambda x: x.get(key, ""), reverse=reverse)
        return self

    def limit(self, n: int):
        self._items = self._items[:n]
        return self

    def skip(self, n: int):
        self._items = self._items[n:]
        return self

    def __aiter__(self):
        return self

    async def __anext__(self):
        if self._index < len(self._items):
            item = self._items[self._index]
            self._index += 1
            return item
        raise StopAsyncIteration

    async def to_list(self, length: Optional[int] = None) -> List[Dict[str, Any]]:
        if length is not None:
            return copy.deepcopy(self._items[:length])
        return copy.deepcopy(self._items)

class MockCollection:
    def __init__(self, name: str):
        self.name = name
        self._docs: Dict[str, Dict[str, Any]] = {}

    def _matches(self, doc: Dict[str, Any], filter_dict: Dict[str, Any]) -> bool:
        for k, v in filter_dict.items():
            if k == "$or":
                sub_matches = any(self._matches(doc, sub) for sub in v)
                if not sub_matches:
                    return False
                continue
            if isinstance(v, dict):
                # Simple operator support ($in, $ne, $gte, etc.)
                if "$in" in v:
                    if doc.get(k) not in v["$in"]:
                        return False
                elif "$ne" in v:
                    if doc.get(k) == v["$ne"]:
                        return False
            else:
                if doc.get(k) != v:
                    return False
        return True

    async def find_one(self, filter_dict: Dict[str, Any], projection: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
        for doc in self._docs.values():
            if self._matches(doc, filter_dict):
                return copy.deepcopy(doc)
        return None

    def find(self, filter_dict: Optional[Dict[str, Any]] = None, projection: Optional[Dict[str, Any]] = None) -> MockCursor:
        filter_dict = filter_dict or {}
        matches = [copy.deepcopy(doc) for doc in self._docs.values() if self._matches(doc, filter_dict)]
        return MockCursor(matches)

    async def insert_one(self, doc: Dict[str, Any]):
        doc_copy = copy.deepcopy(doc)
        if "_id" not in doc_copy:
            doc_copy["_id"] = str(uuid.uuid4())
        self._docs[doc_copy["_id"]] = doc_copy
        class InsertResult:
            inserted_id = doc_copy["_id"]
        return InsertResult()

    async def update_one(self, filter_dict: Dict[str, Any], update_dict: Dict[str, Any]):
        matched = 0
        modified = 0
        for doc_id, doc in self._docs.items():
            if self._matches(doc, filter_dict):
                matched = 1
                if "$set" in update_dict:
                    for sk, sv in update_dict["$set"].items():
                        doc[sk] = copy.deepcopy(sv)
                    modified = 1
                if "$unset" in update_dict:
                    for uk in update_dict["$unset"].keys():
                        if uk in doc:
                            del doc[uk]
                            modified = 1
                break
        class UpdateResult:
            matched_count = matched
            modified_count = modified
        return UpdateResult()

    async def delete_one(self, filter_dict: Dict[str, Any]):
        deleted = 0
        for doc_id, doc in list(self._docs.items()):
            if self._matches(doc, filter_dict):
                del self._docs[doc_id]
                deleted = 1
                break
        class DeleteResult:
            deleted_count = deleted
        return DeleteResult()

    async def count_documents(self, filter_dict: Dict[str, Any]) -> int:
        count = sum(1 for doc in self._docs.values() if self._matches(doc, filter_dict))
        return count

class MockDatabase:
    def __init__(self, name: str):
        self.name = name
        self._collections: Dict[str, MockCollection] = {}

    def __getitem__(self, name: str) -> MockCollection:
        if name not in self._collections:
            self._collections[name] = MockCollection(name)
        return self._collections[name]

    def get_collection(self, name: str) -> MockCollection:
        return self[name]

class DatabaseManager:
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[Any] = None
    _is_mock: bool = False

    @classmethod
    async def connect_db(cls):
        try:
            client = AsyncIOMotorClient(
                settings.MONGODB_URI,
                serverSelectionTimeoutMS=800
            )
            # Ping database to confirm live server
            await client.admin.command('ping')
            cls.client = client
            cls.db = client[settings.MONGODB_DB_NAME]
            cls._is_mock = False
            print(f"[NEXORA DB] Connected to live MongoDB: {settings.MONGODB_DB_NAME}")
        except Exception as e:
            # Fallback to persistent Mock Database for offline/test environments
            cls.client = None
            cls.db = MockDatabase(settings.MONGODB_DB_NAME)
            cls._is_mock = True
            print(f"[NEXORA DB] Live MongoDB not detected ({str(e)[:50]}...). Engaged resilient Mock MongoDB store.")

    @classmethod
    async def close_db(cls):
        if cls.client:
            cls.client.close()
            print("[NEXORA DB] Closed MongoDB connection.")

    @classmethod
    def get_db(cls) -> Any:
        if cls.db is None:
            # Synchronous fallback initialization
            cls.db = MockDatabase(settings.MONGODB_DB_NAME)
            cls._is_mock = True
        return cls.db

db_manager = DatabaseManager()

async def get_db():
    return db_manager.get_db()

