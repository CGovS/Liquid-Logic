import json
import re

# Paths
json_path = "/Users/carter/new_questions_batch.json"
js_path = "/Users/carter/.gemini/antigravity/scratch/Liquid Logic/v3.6/trivia_db.js"
output_path = "/Users/carter/.gemini/antigravity/scratch/Liquid Logic/v3.6/trivia_db.js"

# 1. Load the new questions
try:
    with open(json_path, 'r', encoding='utf-8') as f:
        new_batch = json.load(f)
except Exception as e:
    print(f"Error reading JSON: {e}")
    exit(1)

# 2. Load the existing JS file
try:
    with open(js_path, 'r', encoding='utf-8') as f:
        js_content = f.read()
except Exception as e:
    print(f"Error reading JS: {e}")
    exit(1)

# 3. Merge process
# The file has a structure: `pool: { "Category": [ {q1}, {q2} ], ... }`
# We'll regex search for each category array in the pool and insert the new questions.

for category, questions in new_batch.items():
    if not questions:
        continue
    
    # Format the new questions as a JS array string (strip outer brackets)
    formatted_qs = ",\n".join([f"            {json.dumps(q)}" for q in questions])
    
    # Try to find the category in the JS file
    # Look for: `"Category": [` or `Category: [`
    pattern = rf'("{category}"|{category})\s*:\s*\['
    match = re.search(pattern, js_content)
    
    if match:
        # Insert right after the opening bracket
        insert_pos = match.end()
        # Add a newline and the formatted questions, plus a comma to separate from existing
        js_content = js_content[:insert_pos] + "\n" + formatted_qs + ",\n" + js_content[insert_pos:]
        print(f"Merged {len(questions)} questions into existing category: '{category}'")
    else:
        # Category doesn't exist, need to append to the end of the pool
        # This is trickier with regex, but we will look for the end of the pool object.
        # For simplicity, if a category isn't found, we'll log it for manual injection or 
        # append it right before the strict closing of the pool `},\n    }`
        
        # simple heuristic: find `pool: {`
        pool_match = re.search(r'pool\s*:\s*\{', js_content)
        if pool_match:
            insert_pos = pool_match.end()
            new_cat_block = f'\n        "{category}": [\n{formatted_qs}\n        ],'
            js_content = js_content[:insert_pos] + new_cat_block + js_content[insert_pos:]
            print(f"Created new category '{category}' and merged {len(questions)} questions.")
        else:
             print(f"Warning: Could not find pool object for category '{category}'")

# 4. Save the updated JS file
try:
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(js_content)
    print("Successfully updated trivia_db.js!")
except Exception as e:
    print(f"Error saving JS: {e}")
