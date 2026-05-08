#!/bin/sh
set -e

echo "==> Syncing database schema..."
npx prisma db push --accept-data-loss

echo "==> Seeding default data (upsert — safe to re-run)..."
node prisma/seed.js

echo "==> Starting MediFile..."
exec node server.js
