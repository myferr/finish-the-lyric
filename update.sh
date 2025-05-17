#!/usr/bin/bash

# If a new command is added, then trigger this script at the root (outside of the bot's directory)
# to keep your env.yml and STORAGE and update.

# Specify the directory of the bot like so
# EXAMPLE: bash update.sh --bot-directory finish-the-lyric

set -e

usage() {
  echo "Usage: Just run ./update.sh (from within your bot directory)"
  exit 1
}

BOT_DIR="$(basename "$PWD")"
PARENT_DIR="$(dirname "$PWD")"
SCRIPT_NAME="$(basename "$0")"

TMP_ENV="$PARENT_DIR/env.yml.bak"
TMP_STORAGE="$PARENT_DIR/STORAGE.bak"
TMP_SCRIPT="$PARENT_DIR/$SCRIPT_NAME"

echo "📦 Backing up env.yml and STORAGE/..."
cp env.yml "$TMP_ENV"
cp -r src/STORAGE "$TMP_STORAGE"

echo "📤 Moving update.sh temporarily..."
mv "$SCRIPT_NAME" "$TMP_SCRIPT"

echo "🧹 Deleting old bot directory: $BOT_DIR..."
cd "$PARENT_DIR"
rm -rf "$BOT_DIR"

echo "📥 Fetching fresh clone from GitHub..."
bash <(curl -Ss https://raw.githubusercontent.com/myferr/finish-the-lyric/refs/heads/main/x.sh)

if [[ ! -d "$BOT_DIR" ]]; then
  echo "❌ Error: Expected $BOT_DIR to be created."
  exit 1
fi

cd "$BOT_DIR"

echo "🧼 Removing default env.yml and STORAGE/..."
rm -f env.yml
rm -rf src/STORAGE

echo "♻️ Restoring backed-up files..."
mv "$TMP_ENV" env.yml
mv "$TMP_STORAGE" src/STORAGE

echo "📥 Restoring update.sh..."
mv "$TMP_SCRIPT" update.sh
chmod +x update.sh

echo "✅ Bot updated successfully with your configuration preserved!"
