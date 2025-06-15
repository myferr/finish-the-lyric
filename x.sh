#!/bin/bash

set -euo pipefail

REPO_URL="https://github.com/myferr/finish-the-lyric"
CLONE_DIR="finish-the-lyric"

echo "🔍 Checking for required dependencies..."

# Check for Git
if ! command -v git &> /dev/null; then
  echo "❌ Git is not installed. Please install Git and try again."
  exit 1
else
  echo "✅ Git is installed."
fi

# Check for Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is not installed. Please install Node.js (https://nodejs.org) and try again."
  exit 1
else
  echo "✅ Node.js is installed (version $(node -v))"
fi

# Check for npm
if ! command -v npm &> /dev/null; then
  echo "❌ npm is not installed. Please install npm and try again."
  exit 1
else
  echo "✅ npm is installed (version $(npm -v))"
fi

# Clone the repository
if [ -d "$CLONE_DIR" ]; then
  echo "📁 Directory '$CLONE_DIR' already exists. Skipping clone."
else
  echo "📦 Cloning repository..."
  git clone "$REPO_URL" "$CLONE_DIR"
fi

cd "$CLONE_DIR"

# Install dependencies
echo "📦 Installing npm dependencies..."
npm install

# Check for .env.example.yml
if [ -f "env.example.yml" ]; then
  echo "⚙️ Detected env.example.yml"
  echo "Please put your credentials into the env.yml file"
  echo
  cp env.example.yml env.yml
  rm env.example.yml
  rmdir website
  rm .gitmodules
  echo
else
  echo "⚠️ No env.example.yml found. Make sure you have a env.yml file before running the app."
fi

# Final instructions
echo "🚀 Setup complete!"
echo
echo "Next steps:"
echo "1. Configure your environment: nano env.yml"
echo "2. Check dependencies: npm run updateDeps"
echo "3. Start the bot with:"
echo "   'npm run dev'  or 'npm start' depending on your script"
echo
