import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
import json

load_dotenv()
api_key = os.environ.get("GEMINI_API_KEY")

try:
    client = genai.Client(api_key=api_key)
    print("Listing models:")
    for m in client.models.list():
        print(f"Available model: {m.name}")
except Exception as e:
    print("FAILED to list models:", e)
