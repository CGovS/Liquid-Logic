import os
import json
import time
import re
try:
    import openai
except ImportError:
    print("Please install the openai library: pip install openai")
    exit(1)

# ==============================================================================
# Liquid Logic v3.6 - Question Generator Script
# 
# This script uses the OpenAI API to generate new trivia questions and append
# them to your trivia_db.js file until you reach your target count.
# ==============================================================================

# 1. SET YOUR OPENAI API KEY HERE (via the OPENAI_API_KEY environment variable):
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise SystemExit("ERROR: Please set your OPENAI_API_KEY environment variable before running!")

# Target total questions in the database
TARGET_TOTAL_QUESTIONS = 10000
QUESTIONS_PER_BATCH = 50 # How many questions to ask the API for at once
DB_FILE_PATH = "trivia_db.js"

from openai import OpenAI
client = OpenAI(api_key=OPENAI_API_KEY)

def extract_json_from_js(js_content):
    """Extracts the JavaScript object from the export const library = {...}; statement"""
    match = re.search(r'export const library = (\{.*\});', js_content, re.DOTALL)
    if match:
        json_str = match.group(1)
        pass
    return None

print("Welcome to the Liquid Logic Question Generator!")
print(f"Target: {TARGET_TOTAL_QUESTIONS} questions.")
print("Note: To fully integrate, this script will generate questions in the exact JSON format needed.")
print("Because parsing JS files with regex can be tricky, this script outputs new questions into 'new_questions.json', which you can then copy-paste into trivia_db.js.")

categories = [
    "Before & After", "4-Letter Words", "Science", "English", "Barroom Physics",
    "Biology", "Physics", "Astronomy", "Chemistry", "Famous Scientists",
    "History", "Geography", "Pop Culture", "Sports", "Music"
] # Add all your categories here

prompt_template = """
Generate {count} unique trivia questions for the category "{category}".
The questions must be scaled on difficulty 1 to 5, where 1 is easiest (200 points) and 5 is hardest (1000 points).
VERY IMPORTANT: The question text MUST NOT include or give away the answer! Do not put the answer in the question.

Format the output EXACTLY as a JSON array of objects like this:
[
  {{ "question": "The chemical formula for water.", "answer": "What is H2O?", "difficulty": 1 }},
  {{ "question": "This scientist discovered penicillin.", "answer": "Who is Alexander Fleming?", "difficulty": 5 }}
]
Respond ONLY with the raw JSON array.
"""

new_questions = {}

for category in categories:
    print(f"\nGenerating questions for category: {category}...")
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a trivia master that outputs only valid JSON arrays."},
                {"role": "user", "content": prompt_template.format(count=QUESTIONS_PER_BATCH, category=category)}
            ],
            temperature=0.7
        )
        
        content = response.choices[0].message.content.strip()
        # Clean markdown code blocks if any
        if content.startswith("```json"):
            content = content[7:-3]
        elif content.startswith("```"):
            content = content[3:-3]
            
        questions = json.loads(content)
        new_questions[category] = questions
        print(f"Successfully generated {len(questions)} questions for {category}.")
        
        # Save progress
        with open("new_questions_batch.json", "w") as f:
            json.dump(new_questions, f, indent=4)
            
        time.sleep(2) # Rate limit protection

    except Exception as e:
        print(f"Error generating for {category}: {e}")

print("\nDone! Check 'new_questions_batch.json'. You can copy these arrays into your trivia_db.js file under the respective 'pool' categories.")
