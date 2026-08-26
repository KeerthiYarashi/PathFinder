import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.coursera_scraper import CourseraScraperService
import json

def test_apify():
    scraper = CourseraScraperService()
    print("Testing Apify Coursera Scraper Fallback...")
    
    if not scraper.apify_token:
        print("ERROR: APIFY_API_TOKEN is empty.")
        return
        
    query = "Machine Learning"
    print(f"Searching for '{query}'...")
    
    courses = scraper.search_courses(query)
    
    if courses:
        print(f"SUCCESS! Found {len(courses)} courses:")
        print(json.dumps(courses, indent=2))
    else:
        print("No courses returned or run failed.")

if __name__ == "__main__":
    test_apify()
