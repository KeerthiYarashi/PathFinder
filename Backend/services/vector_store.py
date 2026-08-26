from core.config import settings
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_postgres import PGVector

class VectorStoreService:
    def __init__(self):
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model=settings.EMBEDDING_MODEL,
            google_api_key=settings.GEMINI_API_KEY
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
            results = store.similarity_search(query, k=k, filter=filters)
            return [doc.metadata for doc in results]
        except Exception as e:
            print(f"Vector search failed: {e}")
            return []

    def get_resource_by_id(self, resource_id: str) -> dict | None:
        if not self.connection:
            return None
            
        store = self.get_store()
        try:
            results = store.similarity_search("", k=1, filter={"resource_id": resource_id})
            if results:
                return results[0].metadata
            return None
        except Exception as e:
            print(f"Vector search failed: {e}")
            return None
