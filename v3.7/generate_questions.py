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
# Liquid Logic v3.7 - ULTIMATE Question Generator
# ==============================================================================

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    print("ERROR: Please set your OPENAI_API_KEY before running!")
    exit(1)

DB_FILE_PATH = "trivia_db.js"
TARGET_PER_CATEGORY = 200
QUESTIONS_PER_BATCH = 50

openai.api_key = OPENAI_API_KEY
from openai import OpenAI
client = OpenAI(api_key=OPENAI_API_KEY)

categories = [
    "Before & After", "4-Letter Words", "Science", "English", "Barroom Physics",
    "Potent Potables", "Pub Grub", "Beer Science", "Alcohol Trivia", "Famous Bars",
    "US History", "Wars", "Technology", "Ancient Greece", "The 1980s",
    "Blockbuster Movies", "Reality TV", "Slogans & Brands", "Current Events", "Famous People",
    "Rock n' Roll Riots", "Lyrics about Liquor", "80s One-Hit Wonders", "Rap", "Haus (House Music)",
    "World Capitals", "Rivers & Lakes", "Mountains", "Islands", "Landmarks"
]

prompt_template = """
Generate {count} unique trivia questions for the category "{category}".
The questions must be scaled on difficulty 1 to 5, where 1 is easiest (200 points) and 5 is hardest (1000 points).
CRITICAL RULES:
1. The question text MUST NOT include or give away the answer!
2. Do not use the exact words from the answer in the question.

Format the output EXACTLY as a JSON array of objects like this:
[
  {{ "question": "The chemical formula for water.", "answer": "What is H2O?", "difficulty": 1 }}
]
Respond ONLY with the raw JSON array.
"""

def read_db():
    if not os.path.exists(DB_FILE_PATH):
        print(f"ERROR: {DB_FILE_PATH} not found!")
        exit(1)
    with open(DB_FILE_PATH, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract the pool object natively
    match = re.search(r'export const library = (\{.*?\n\});', content, re.DOTALL)
    if not match:
        print("ERROR: Could not parse library object from DB file.")
        exit(1)
        
    js_str = match.group(1)
    # We will use quick string injection to append questions securely to the raw string
    return content

def safe_json_extract(content):
    if content.startswith("```json"):
        content = content[7:-3]
    elif content.startswith("```"):
        content = content[3:-3]
    try:
        data = json.loads(content)
        # Filter out bad quality questions (where answer is in question)
        good_data = []
        for q in data:
            q_text = str(q.get('question', '')).lower()
            a_text = str(q.get('answer', '')).lower()
            clean_a = re.sub(r'^(who is|what is|who are|what are|the|a|an)\s+', '', a_text).strip('?')
            if len(clean_a) > 3 and clean_a in q_text:
                continue # Skip "answer in question" issues
            good_data.append(q)
        return good_data
    except:
        return []

print(f"Targeting {TARGET_PER_CATEGORY} questions for all {len(categories)} categories ({TARGET_PER_CATEGORY * len(categories)} total).")
print("This script will run continuously, sleep on rate limits, and automatically inject into your database!")

content = read_db()
# Find existing pool structure so we don't blindly format
pool_match = re.search(r'pool:\s*(\{.*\});', content, re.DOTALL)
if pool_match:
    try:
        # Load the JSON safely
        # Actually our fix_db.py made the pool valid JSON!
        pool_str = pool_match.group(1)
        existing_pool = json.loads(pool_str)
    except:
        existing_pool = {}
else:
    existing_pool = {}

for cat in categories:
    if cat not in existing_pool:
        existing_pool[cat] = []
        
    current_count = len(existing_pool[cat])
    while current_count < TARGET_PER_CATEGORY:
        needed = min(QUESTIONS_PER_BATCH, TARGET_PER_CATEGORY - current_count)
        print(f"[{cat}] Has {current_count}/{TARGET_PER_CATEGORY}. Requesting {needed} more...")
        
        try:
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a strict trivia master."},
                    {"role": "user", "content": prompt_template.format(count=needed, category=cat)}
                ],
                temperature=0.7
            )
            raw = response.choices[0].message.content.strip()
            new_qs = safe_json_extract(raw)
            if not new_qs:
                print(" -> Model returned invalid JSON. Retrying...")
                time.sleep(5)
                continue
                
            existing_pool[cat].extend(new_qs)
            current_count = len(existing_pool[cat])
            print(f" -> Added {len(new_qs)} valid questions. Total: {current_count}")
            
            # Auto-save immediately after every successful pull!
            with open(DB_FILE_PATH, 'r', encoding='utf-8') as f:
                full_js = f.read()
            
            pool_json_str = json.dumps(existing_pool, indent=4)
            # Use lambda to prevent re.sub from interpreting \u escapes in the JSON string
            new_js = re.sub(r'pool:\s*\{.*\n\s*\}\n*\}\n*;', lambda m: f"pool: {pool_json_str}\n}};", full_js, flags=re.DOTALL)
            # If the regex doesn't match perfectly, fallback to string replacement:
            if new_js == full_js:
                parts = full_js.split('pool:')
                new_js = parts[0] + "pool: " + pool_json_str + "\n};\n"
            
            with open(DB_FILE_PATH, 'w', encoding='utf-8') as f:
                f.write(new_js)
                
            # Sleep 10s to prevent rate limits
            time.sleep(10)
            
        except openai.RateLimitError:
            print(" -> API Rate Limit Hit! Sleeping for 60 seconds...")
            time.sleep(60)
        except Exception as e:
            print(f" -> Error: {e}")
            time.sleep(10)
            
print("\n[SUCCESS] 100% finished! The database is maxed out and fully validated!")
