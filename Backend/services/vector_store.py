from core.config import settings
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_postgres import PGVector
import torch

class VectorStoreService:
    def __init__(self):
        # Auto-detect CUDA for GPU acceleration on user's RTX 3050
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Initializing HuggingFaceEmbeddings on device: {device}")
        
        self.embeddings = HuggingFaceEmbeddings(
            model_name="all-MiniLM-L6-v2",
            model_kwargs={'device': device},
            encode_kwargs={'normalize_embeddings': True}
        )
        self.collection_name = settings.VECTOR_COLLECTION
        self.connection = settings.SUPABASE_DB_URL

    def get_store(self) -> PGVector:
        return PGVector(
            embeddings=self.embeddings,
            collection_name=self.collection_name,
            connection=self.connection,
            use_jsonb=True
        )

    def search_resources(self, skill_name: str, skill_description: str = "", k: int = 10, filters: dict = None) -> list[dict]:
        if not self.connection:
            print("Warning: SUPABASE_DB_URL not set. Returning empty search results.")
            return []
            
        store = self.get_store()
        query = f"Resources for {skill_name}. {skill_description}"
        
        try:
            # 6. CRITICAL ARCHITECTURE: Using LangChain Retriever explicitly
            search_kwargs = {"k": k}
            if filters:
                search_kwargs["filter"] = filters
                
            retriever = store.as_retriever(search_kwargs=search_kwargs)
            results = retriever.invoke(query)
            
            return [doc.metadata for doc in results]
        except Exception as e:
            print(f"Vector search failed: {e}")
            return []

    def get_resource_by_id(self, resource_id: str) -> dict | None:
        if not self.connection:
            return None
            
        store = self.get_store()
        try:
            retriever = store.as_retriever(search_kwargs={"k": 1, "filter": {"resource_id": resource_id}})
            results = retriever.invoke("")
            if results:
                return results[0].metadata
            return None
        except Exception as e:
            print(f"Vector search failed: {e}")
            return None

    def add_resources(self, resources: list[dict]):
        if not self.connection:
            print("Warning: SUPABASE_DB_URL not set. Skipping vector ingestion.")
            return
            
        store = self.get_store()
        from langchain_core.documents import Document
        
        docs = []
        for r in resources:
            text = f"{r.get('title', '')} {r.get('description', '')} {r.get('provider', '')}"
            docs.append(Document(page_content=text, metadata=r))
            
        try:
            store.add_documents(docs)
            print(f"Successfully added {len(docs)} resources to pgvector.")
        except Exception as e:
            print(f"Vector ingestion failed: {e}")

