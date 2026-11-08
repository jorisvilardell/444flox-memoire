#!/bin/sh
# Writes /config.js from the container environment so one image serves every environment.
set -eu

API_URL="${API_URL:-http://localhost:3333}"

# Escape for a JS double-quoted string literal.
escaped=$(printf '%s' "$API_URL" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g')
printf 'window.__APP_CONFIG__ = { API_URL: "%s" };\n' "$escaped" > /usr/share/nginx/html/config.js
