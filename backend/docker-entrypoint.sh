#!/bin/sh
set -e

node ace migration:run --force

# The seeder itself is a no-op when the entries table already has rows.
if [ "$SEED_ON_BOOT" = "true" ]; then
  node ace db:seed --files "./database/seeders/entry_seeder.js"
fi

exec node bin/server.js
