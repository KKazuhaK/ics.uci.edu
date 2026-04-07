#!/bin/bash
# Auto-generate sitemap.json from HTML files
# Run from project root: bash tools/generate-sitemap.sh
# Or set up a cron job / git hook to run it automatically

ROOT="/home/kazuhak/public_html"
BASE_URL="https://ics.uci.edu/~kazuhak"
OUTPUT="$ROOT/sitemap.json"

# Read about.html content for the about page
ABOUT_NAME=""
ABOUT_DEGREE=""
ABOUT_SCHOOL=""
ABOUT_EMAIL=""
ABOUT_BIO=""
ABOUT_GITHUB=""
ABOUT_WEBSITE=""

if [ -f "$ROOT/about.html" ]; then
  ABOUT_NAME=$(grep -oP '(?<=<h2>)[^<]+' "$ROOT/about.html" | head -1)
  ABOUT_DEGREE=$(grep -oP 'fa-graduation-cap"></span>\K[^<]+' "$ROOT/about.html" | head -1 | xargs)
  ABOUT_SCHOOL=$(grep -oP 'fa-university"></span>\K[^<]+' "$ROOT/about.html" | head -1 | xargs)
  ABOUT_EMAIL=$(grep -oP 'mailto:\K[^"]+' "$ROOT/about.html" | head -1)
  ABOUT_GITHUB=$(grep -oP 'github\.com/\K[^"]+' "$ROOT/about.html" | head -1)
  ABOUT_WEBSITE=$(grep -oP 'kazuhahub\.com[^"]*' "$ROOT/about.html" | head -1)
  # Extract bio paragraphs
  ABOUT_BIO=$(grep -oP '(?<=<p>)[^<]+(?=</p>)' "$ROOT/about.html" | head -3)
fi

# Collect all HTML pages (excluding assets, vendor, speedtest internals)
PAGES=$(find "$ROOT" -name "*.html" \
  -not -path "*/assets/*" \
  -not -path "*/resources/*" \
  -not -path "*/remote_profiles/*" \
  -not -path "*/temp/*" \
  -not -path "*/speedtest/app.html" \
  -not -path "*/speedtest/hosted.html" \
  | sort)

# Collect markdown content files
MD_FILES=$(find "$ROOT/notes" -name "*.md" 2>/dev/null | sort)

# Start JSON
cat > "$OUTPUT" << 'HEADER'
{
  "site": {
    "name": "Kazuha Mo - UC Irvine",
    "base_url": "https://ics.uci.edu/~kazuhak",
HEADER

echo "    \"owner\": \"${ABOUT_NAME:-Kazuha Mo}\"," >> "$OUTPUT"
echo "    \"affiliation\": \"${ABOUT_SCHOOL:-University of California, Irvine}\"," >> "$OUTPUT"
echo "    \"email\": \"${ABOUT_EMAIL:-kazuhak@uci.edu}\"," >> "$OUTPUT"
echo "    \"updated\": \"$(date +%Y-%m-%d)\"" >> "$OUTPUT"

cat >> "$OUTPUT" << 'MID'
  },
  "pages": [
MID

FIRST=true
for FILE in $PAGES; do
  REL_PATH="${FILE#$ROOT}"
  # Convert /index.html to /
  URL_PATH=$(echo "$REL_PATH" | sed 's|/index\.html$|/|')

  # Extract title from <title> tag
  TITLE=$(grep -oP '(?<=<title>)[^<|]+' "$FILE" | head -1 | sed 's/ *$//')
  [ -z "$TITLE" ] && TITLE="Untitled"

  # Determine category
  CATEGORY="main"
  echo "$REL_PATH" | grep -q "^/notes/" && CATEGORY="notes"
  echo "$REL_PATH" | grep -q "^/tools/" && CATEGORY="tools"

  # Add comma separator
  if [ "$FIRST" = true ]; then
    FIRST=false
  else
    echo "," >> "$OUTPUT"
  fi

  printf '    {"path":"%s","title":"%s","category":"%s"}' "$URL_PATH" "$TITLE" "$CATEGORY" >> "$OUTPUT"
done

# Add about page content block
if [ -n "$ABOUT_NAME" ]; then
  cat >> "$OUTPUT" << ABOUT
,
    {"path":"/about.html","_about_detail":{"name":"${ABOUT_NAME}","degree":"${ABOUT_DEGREE}","school":"${ABOUT_SCHOOL}","email":"${ABOUT_EMAIL}","github":"https://github.com/${ABOUT_GITHUB}","website":"https://www.${ABOUT_WEBSITE}"}}
ABOUT
fi

# Add markdown files info
if [ -n "$MD_FILES" ]; then
  for MD in $MD_FILES; do
    REL="${MD#$ROOT}"
    FILENAME=$(basename "$MD" .md)
    printf ',\n    {"path":"%s","type":"markdown","title":"%s"}' "$REL" "$FILENAME" >> "$OUTPUT"
  done
fi

cat >> "$OUTPUT" << 'FOOTER'

  ]
}
FOOTER

echo "Generated $OUTPUT with $(grep -c '"path"' "$OUTPUT") entries on $(date)"
