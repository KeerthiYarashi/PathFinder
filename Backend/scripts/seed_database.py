import os
import sys
import argparse
import time

# Add the Backend directory to the python path so imports work
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datasets import load_dataset
from core.config import settings
from services.vector_store import VectorStoreService
from langchain_core.documents import Document

def seed_database(limit: int = None):
    print("Initializing VectorStoreService (this will connect to Supabase and init Gemini embeddings)...")
    try:
        vector_service = VectorStoreService()
        store = vector_service.get_store()
    except Exception as e:
        print(f"Error connecting to Vector Store: {e}")
        print("Please check your .env variables (SUPABASE_DB_URL, GEMINI_API_KEY).")
        return

    print("Downloading 'reapxdev/coursera-scraper' dataset from Hugging Face...")
    try:
        ds = load_dataset("reapxdev/coursera-scraper", split="train")
    except Exception as e:
        print(f"Error downloading dataset: {e}")
        return

    total_rows = len(ds)
    if limit and limit < total_rows:
        print(f"Dataset has {total_rows} courses. Limiting upload to first {limit} courses as requested.")
        ds = ds.select(range(limit))
    else:
        print(f"Dataset has {total_rows} courses. Uploading ALL {total_rows} courses...")

    documents = []
    
    # Process the dataset
    for item in ds:
        # Construct the metadata based on our RecommendedResource schema
        # Dataset schema (from viewer):
        # name, description, slug, workload, level, courseType, etc.
        
        title = item.get("name") or "Unknown Course"
        description = item.get("description") or "No description provided."
        course_id = item.get("courseId") or item.get("slug") or str(hash(title))
        url = f"https://www.coursera.org/learn/{item.get('slug')}" if item.get('slug') else ""
        
        # Parse workload string (e.g. "1 hour 30 minutes", "3 weeks of study, 5-7 hours per week") to a rough float
        duration_hours = 10.0
        workload = str(item.get("workload") or "").lower()
        if "hour" in workload:
            try:
                # Naive extraction of first number, fallback to 10
                parts = workload.split()
                for p in parts:
                    if p.isdigit():
                        duration_hours = float(p)
                        break
            except:
                pass
                
        # Parse difficulty
        level = str(item.get("level") or "").upper()
        difficulty_level = 1
        if "INTERMEDIATE" in level:
            difficulty_level = 2
        elif "ADVANCED" in level:
            difficulty_level = 3
            
        format_type = "course"
        
        # Skills covered (from categories or domainTypes)
        skills = []
        domain_types = item.get("domainTypes") or []
        for dt in domain_types:
            if isinstance(dt, dict):
                if dt.get("subdomainId"): skills.append(dt["subdomainId"].replace("-", " "))
                if dt.get("domainId"): skills.append(dt["domainId"].replace("-", " "))
                
        categories = item.get("categories") or []
        for c in categories:
            if isinstance(c, str): skills.append(c)
            
        skills_covered = ",".join(list(set(skills))) if skills else title
        
        # The text content that will actually be embedded by Gemini
        page_content = f"Title: {title}\nDescription: {description}\nSkills: {skills_covered}"
        
        metadata = {
            "resource_id": f"coursera_{course_id}",
            "title": title,
            "description": description,
            "url": url,
            "duration_hours": duration_hours,
            "difficulty_level": difficulty_level,
            "type": format_type,
            "skills_covered": skills_covered
        }
        
        documents.append(Document(page_content=page_content, metadata=metadata))

    print(f"Generated {len(documents)} LangChain Document objects.")
    print("Uploading to Supabase `langchain_pg_embedding` table in batches...")
    
    # Upload in batches to avoid overwhelming the API or DB
    batch_size = 50
    i = 0
    while i < len(documents):
        print(f"Uploading batch {i} to {min(i+batch_size, len(documents))}...")
        batch = documents[i:i + batch_size]
        try:
            store.add_documents(batch)
            i += batch_size
        except Exception as e:
            print(f"\nError uploading batch {i} to {i+batch_size}: {e}")
            print("Stopping upload to prevent partial data corruption.")
            return
            
    print("\nSUCCESS! Database has been seeded.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed Supabase with Coursera courses.")
    parser.add_argument("--limit", type=int, help="Limit the number of courses to upload", default=None)
    args = parser.parse_args()
    
    seed_database(limit=args.limit)
