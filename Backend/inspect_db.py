import os
import psycopg
from core.config import settings

def inspect_db():
    conn_str = settings.SUPABASE_DB_URL
    try:
        with psycopg.connect(conn_str) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT column_name, data_type, udt_name, character_maximum_length 
                    FROM information_schema.columns 
                    WHERE table_name = 'langchain_pg_embedding';
                """)
                rows = cur.fetchall()
                print("Table: langchain_pg_embedding schema:")
                for r in rows:
                    print(f"  {r[0]}: {r[1]} (udt: {r[2]})")
                    
                cur.execute("""
                    SELECT name, uuid FROM langchain_pg_collection;
                """)
                collections = cur.fetchall()
                print("\nCollections in DB:")
                for c in collections:
                    print(f"  - {c[0]} (UUID: {c[1]})")
                    
    except Exception as e:
        print(f"DB Error: {e}")

if __name__ == "__main__":
    inspect_db()
