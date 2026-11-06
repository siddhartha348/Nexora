import os
import chromadb
from typing import List, Dict, Any, Optional
from app.core.config import settings

class ChromaManager:
    client: Optional[chromadb.ClientAPI] = None

    @classmethod
    def get_client(cls) -> chromadb.ClientAPI:
        if cls.client is None:
            persist_dir = settings.CHROMA_PERSIST_DIR
            os.makedirs(persist_dir, exist_ok=True)
            cls.client = chromadb.PersistentClient(path=persist_dir)
        return cls.client

    @classmethod
    def get_org_collection(cls, org_id: str, collection_type: str = "knowledge_chunks"):
        """
        Retrieves tenant-isolated vector collection.
        e.g. org_12345_knowledge_chunks
        """
        client = cls.get_client()
        safe_org_id = org_id.replace("-", "_")
        col_name = f"org_{safe_org_id}_{collection_type}"
        return client.get_or_create_collection(
            name=col_name,
            metadata={"hnsw:space": "cosine", "org_id": org_id, "type": collection_type}
        )

    @classmethod
    def index_approved_chunks(
        cls,
        org_id: str,
        document_id: str,
        document_title: str,
        version_tag: str,
        chunks: List[Dict[str, Any]]
    ):
        """
        STRICT GOVERNANCE RULE:
        Only approved chunks are indexed into ChromaDB.
        """
        if not chunks:
            return

        collection = cls.get_org_collection(org_id, "knowledge_chunks")
        
        ids = [c["chunk_id"] for c in chunks]
        documents = [c["content"] for c in chunks]
        metadatas = [
            {
                "document_id": document_id,
                "document_title": document_title,
                "version_tag": version_tag,
                "page_number": c["page_number"],
                "category": c["category"],
                "is_approved": True
            }
            for c in chunks
        ]

        # Add or update chunks in Chroma
        collection.upsert(
            ids=ids,
            documents=documents,
            metadatas=metadatas
        )

    @classmethod
    def remove_document_chunks(cls, org_id: str, document_id: str):
        """Remove all chunks associated with a document upon version archival or deletion."""
        collection = cls.get_org_collection(org_id, "knowledge_chunks")
        collection.delete(where={"document_id": document_id})

    @classmethod
    def query_approved_knowledge(
        cls,
        org_id: str,
        query_text: str,
        n_results: int = 5,
        category: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Searches ONLY approved knowledge in the tenant's collection.
        """
        collection = cls.get_org_collection(org_id, "knowledge_chunks")

        where_filter: Dict[str, Any] = {"is_approved": True}
        if category:
            where_filter["category"] = category

        try:
            results = collection.query(
                query_texts=[query_text],
                n_results=n_results,
                where=where_filter
            )

            formatted: List[Dict[str, Any]] = []
            if results and results.get("ids") and len(results["ids"][0]) > 0:
                for idx in range(len(results["ids"][0])):
                    chunk_id = results["ids"][0][idx]
                    doc_content = results["documents"][0][idx]
                    metadata = results["metadatas"][0][idx]
                    distance = results["distances"][0][idx] if results.get("distances") else 0.2
                    similarity = max(0.0, min(1.0, 1.0 - distance))

                    formatted.append({
                        "chunk_id": chunk_id,
                        "document_id": metadata.get("document_id", ""),
                        "document_title": metadata.get("document_title", "Official Guideline"),
                        "version_tag": metadata.get("version_tag", "v1.0"),
                        "page_number": metadata.get("page_number", 1),
                        "category": metadata.get("category", "GUIDELINES"),
                        "content": doc_content,
                        "score": round(similarity, 4),
                        "is_approved": True
                    })
            return formatted
        except Exception as e:
            # If collection is empty or query fails, return empty list cleanly
            print(f"[CHROMA RAG NOTICE] Vector query notice for {org_id}: {str(e)}")
            return []

chroma_manager = ChromaManager()

