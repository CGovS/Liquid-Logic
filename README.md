# Liquid Logic - Setup & Instructions

## 1. Quick Start (Play Locally)
The game is currently running on your local machine.
**Link:** [http://localhost:8080/](http://localhost:8080/)

To start a new game:
1.  Refresh the page.
2.  Enter 4 Team Names.
3.  Click **Start Game**.

## 2. Moving Files to Downloads
To move these project files to your Downloads folder, open your terminal and run:

```bash
mkdir -p "$HOME/Downloads/AI/Liquid Logic"
cp -R /Users/carter/.gemini/antigravity/scratch/liquid_logic/* "$HOME/Downloads/AI/Liquid Logic/"
```

## 3. Pushing to GitHub
To upload this project to a new GitHub repository:

1.  **Create a new repository** on GitHub.com (e.g., named `liquid-logic`).
2.  Run the following commands in your terminal:

```bash
# Navigate to the project folder (if you moved it to Downloads)
cd "$HOME/Downloads/AI/Liquid Logic"

# Initialize Git
git init

# Add files
git add .
git commit -m "Initial commit of Liquid Logic"

# Link to your GitHub repo (replace URL with your actual repo URL)
git remote add origin https://github.com/YOUR_USERNAME/liquid-logic.git

# Push
git push -u origin main
```

*(Note: If you haven't set up your GitHub credentials locally, you may be prompted to log in).*
