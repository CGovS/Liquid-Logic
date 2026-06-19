const fs = require('fs');
const path = require('path');

const jsonPath = '/Users/carter/new_questions_batch.json';
const dbPath = '/Users/carter/.gemini/antigravity/scratch/Liquid Logic/v3.6/trivia_db.js';

// 1. Read the JSON
let newBatch;
try {
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    newBatch = JSON.parse(rawData);
} catch (e) {
    console.error("Failed to read or parse JSON:", e);
    process.exit(1);
}

// 2. Read the JS Database
let jsContent = fs.readFileSync(dbPath, 'utf8');

// The file looks like:
// console.log("Trivia DB Module Evaluating...");
// export const library = { ... }
//
// We will extract just the JSON part, parse it, merge it, and stringify it back.

const startIndex = jsContent.indexOf('export const library = {');
if (startIndex === -1) {
    console.error("Could not find start of library object");
    process.exit(1);
}

// We just replace the entire export block using an evil eval for simplicity 
// since it's an internal trusted script.
let libraryObj;
try {
    // Strip the "export const library = " part to get raw object string
    const objectString = jsContent.substring(startIndex + 23);
    // Need to handle the fact it's JS, not strict JSON (comments, missing quotes on keys)
    // Actually, writing a dirty string-based parser is safer than evaling if there are errors.

    // Let's modify the file exactly how the user would: just append the JSON blocks to the pool.
    // Instead of regex, we'll slice the string at the end of the `pool: {` block.

    const poolEndIndex = jsContent.lastIndexOf('}'); // Very end of file is };
    const poolCloseIndex = jsContent.lastIndexOf('}', poolEndIndex - 1); // Close of pool object

    let newCategoriesString = "";

    for (const [category, questions] of Object.entries(newBatch)) {
        if (!questions || questions.length === 0) continue;

        let qsStr = questions.map(q => JSON.stringify(q)).join(',\n            ');
        newCategoriesString += `,\n        "${category}": [\n            ${qsStr}\n        ]`;
        console.log(`Prepared ${questions.length} questions for new category: ${category}`);
    }

    // Insert right before the closing brace of the pool.
    const finalContent = jsContent.slice(0, poolCloseIndex) + newCategoriesString + jsContent.slice(poolCloseIndex);

    fs.writeFileSync(dbPath, finalContent, 'utf8');
    fs.writeFileSync('/Users/carter/Downloads/AI/Liquid Logic/v3.6/trivia_db.js', finalContent, 'utf8');
    console.log("Successfully injected new categories to trivia_db.js and copied to Downloads!");

} catch (e) {
    console.error("Failed to parse or modify JS:", e);
}
