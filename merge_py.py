import json
import re

json_path = "/Users/carter/new_questions_batch.json"
db_path = "/Users/carter/.gemini/antigravity/scratch/Liquid Logic/v3.6/trivia_db.js"
export_path = "/Users/carter/Downloads/AI/Liquid Logic/v3.6/trivia_db.js"

# Read JSON
with open(json_path, 'r', encoding='utf-8') as f:
    new_batch = json.load(f)

# Read JS Content
with open(db_path, 'r', encoding='utf-8') as f:
    js_content = f.read()

# We need to find the end of the `pool` object to append the new categories.
# Look for the last `}` before the final `};` of the export.
# In JS: `pool: { ... },` or just `}` at the end.
# A safe way is to find the LAST closing brace of the file `}` and the one right before it `}`.

last_brace = js_content.rfind('}')
second_to_last = js_content.rfind('}', 0, last_brace - 1)

new_categories_str = ""

for category, questions in new_batch.items():
    if not questions:
        continue
    qs_str = ",\n            ".join(json.dumps(q) for q in questions)
    new_categories_str += f',\n        "{category}": [\n            {qs_str}\n        ]'
    print(f"Prepared category: {category} ({len(questions)} qs)")

# Inject right before the second to last brace (which closes the `pool` object assuming standard structure)
final_content = js_content[:second_to_last] + new_categories_str + js_content[second_to_last:]

with open(db_path, 'w', encoding='utf-8') as f:
    f.write(final_content)

with open(export_path, 'w', encoding='utf-8') as f:
    f.write(final_content)

print("\nSuccess! Saved to both scratch and Downloads folders.")
