from services.vector_store import VectorStoreService

def test_search():
    print("Testing Vector Store Search...")
    vector_service = VectorStoreService()
    
    results = vector_service.search_resources(
        skill_name="Python Programming",
        skill_description="Learn basic to advanced Python concepts.",
        k=3
    )
    
    print("\n--- Top 3 Results ---")
    for idx, res in enumerate(results, 1):
        print(f"{idx}. {res.get('title', 'Unknown Title')}")
        print(f"   URL: {res.get('url', 'No URL')}")
        print(f"   Provider: {res.get('provider', 'Unknown')}")
        print(f"   Difficulty: {res.get('difficulty_level', 'Unknown')}")
        print("-" * 20)

if __name__ == "__main__":
    test_search()
