#!/bin/bash
set -e
prisma generate
if [ -n "$DATABASE_URL" ]; then
  prisma migrate deploy
else
  echo "Skipping prisma migrate deploy (DATABASE_URL not set)"
fi
next build
