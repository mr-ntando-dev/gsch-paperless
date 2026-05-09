#!/bin/sh
set -e

echo "==> Syncing database schema..."
# MIGRATE_DATABASE_URL must be the pooler URL WITHOUT ?pgbouncer=true
# DATABASE_URL can have pgbouncer=true for the app runtime
DATABASE_URL="$MIGRATE_DATABASE_URL" npx prisma db push --accept-data-loss --skip-generate

echo "==> Seeding default data (upsert — safe to re-run)..."
DATABASE_URL="$MIGRATE_DATABASE_URL" node prisma/seed.js

echo "==> Starting MediFile..."
exec node server.js
