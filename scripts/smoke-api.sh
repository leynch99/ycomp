#!/usr/bin/env bash
set -euo pipefail

PORT="${TEST_PORT:-3001}"
BASE="http://localhost:${PORT}"

echo ">> Prisma generate"
npx prisma generate

echo ">> Starting dev server on port ${PORT}..."
npm run dev -- -p "${PORT}" &
PID=$!
trap "kill $PID 2>/dev/null || true" EXIT

echo ">> Waiting for server..."
for i in {1..30}; do
  if curl -s -o /dev/null -w "%{http_code}" "${BASE}/api/search?q=" 2>/dev/null | grep -q 200; then
    echo ">> Server ready"
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo ">> Server failed to start"
    exit 1
  fi
  sleep 1
done

echo ">> Running smoke checks..."

# login bad payload -> 400 invalid
RES=$(curl -s -w "\n%{http_code}" -X POST "${BASE}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"","password":""}')
BODY=$(echo "$RES" | head -n -1)
CODE=$(echo "$RES" | tail -n 1)
if [ "$CODE" != "400" ]; then
  echo "FAIL: login bad payload expected 400, got $CODE"
  exit 1
fi
if ! echo "$BODY" | grep -q '"error":"invalid"'; then
  echo "FAIL: login bad payload expected error invalid, got: $BODY"
  exit 1
fi
echo "  OK: login bad payload -> 400 invalid"

# register bad phone -> 400 phone_invalid
RES=$(curl -s -w "\n%{http_code}" -X POST "${BASE}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"A","lastName":"B","phone":"123","email":"x@x.com","password":"pass1234","confirmPassword":"pass1234"}')
BODY=$(echo "$RES" | head -n -1)
CODE=$(echo "$RES" | tail -n 1)
if [ "$CODE" != "400" ]; then
  echo "FAIL: register bad phone expected 400, got $CODE"
  exit 1
fi
if ! echo "$BODY" | grep -q '"error":"phone_invalid"'; then
  echo "FAIL: register bad phone expected error phone_invalid, got: $BODY"
  exit 1
fi
echo "  OK: register bad phone -> 400 phone_invalid"

# order empty items -> 400 Empty order
RES=$(curl -s -w "\n%{http_code}" -X POST "${BASE}/api/orders" \
  -H "Content-Type: application/json" \
  -d '{"items":[],"name":"T","phone":"+380501234567","email":"t@t.ua","city":"Kyiv","npBranch":"N1","paymentMethod":"online"}')
BODY=$(echo "$RES" | head -n -1)
CODE=$(echo "$RES" | tail -n 1)
if [ "$CODE" != "400" ]; then
  echo "FAIL: order empty items expected 400, got $CODE"
  exit 1
fi
if ! echo "$BODY" | grep -q "Empty order"; then
  echo "FAIL: order empty items expected Empty order, got: $BODY"
  exit 1
fi
echo "  OK: order empty items -> 400 Empty order"

echo ">> All smoke checks passed"
