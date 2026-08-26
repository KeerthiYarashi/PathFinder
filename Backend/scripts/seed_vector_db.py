import os
import sys
import json
import asyncio

# Add backend dir to python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.config import settings
from services.vector_store import VectorStoreService
from langchain_core.documents import Document

def build_document(resource: dict) -> Document:
    skills = ", ".join(s["skill_id"] for s in resource.get("skills_covered", []))
    content = (
        f"Title: {resource['title']}. "
        f"Description: {resource['description']}. "
        f"Teaches skills: {skills}."
    )
    
    metadata = {
        "resource_id": resource["id"],
        "type": resource.get("type", "course"),
        "difficulty_level": resource.get("difficulty_level", 2),
        "duration_hours": resource.get("duration_hours", 0.0),
        "quality_score": resource.get("quality_score", 0.0),
        "skills_covered": skills,
        "url": resource.get("url", ""),
        "title": resource["title"]
    }
    
    return Document(page_content=content, metadata=metadata)

async def main():
    if not settings.SUPABASE_DB_URL:
        print("Error: SUPABASE_DB_URL must be set in .env to seed the vector database.")
        return

    data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'resources.json')
    with open(data_path, 'r') as f:
        resources = json.load(f)
        
    print(f"Loaded {len(resources)} resources from JSON.")
    
    docs = [build_document(r) for r in resources]
    
    print("Initializing VectorStoreService...")
    vector_service = VectorStoreService()
    store = vector_service.get_store()
    
    print("Adding documents to pgvector... (This may consume LLM API quota)")
    
    # Adding documents in batches to avoid rate limits
    batch_size = 10
    for i in range(0, len(docs), batch_size):
        batch = docs[i:i+batch_size]
        store.add_documents(batch)
        print(f"Added batch {i//batch_size + 1}/{(len(docs) + batch_size - 1)//batch_size}")
        
    print("Seeding complete!")

if __name__ == "__main__":
    asyncio.run(main())
