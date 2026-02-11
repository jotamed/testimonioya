#!/bin/bash
# Pre-deploy test script for TestimonioYa
# Run before every deploy: bash scripts/pre-deploy-test.sh

set -e
BASE_URL="https://testimonioya.com"
SUPABASE_URL="https://wnmfanhejnrtfccemlai.supabase.co"
PASS=0
FAIL=0

check() {
  local name="$1"
  local url="$2"
  local expected="${3:-200}"
  local code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
  if [ "$code" = "$expected" ]; then
    echo "  ✅ $name ($code)"
    PASS=$((PASS+1))
  else
    echo "  ❌ $name (got $code, expected $expected)"
    FAIL=$((FAIL+1))
  fi
}

check_contains() {
  local name="$1"
  local url="$2"
  local needle="$3"
  local body=$(curl -s "$url" 2>/dev/null)
  if echo "$body" | grep -q "$needle"; then
    echo "  ✅ $name (contains '$needle')"
    PASS=$((PASS+1))
  else
    echo "  ❌ $name (missing '$needle')"
    FAIL=$((FAIL+1))
  fi
}

echo "🧪 TestimonioYa Pre-Deploy Tests"
echo "================================="
echo ""

echo "📄 Pages (HTTP 200):"
check "Landing" "$BASE_URL/"
check "Login" "$BASE_URL/login"
check "Register" "$BASE_URL/register"
check "Forgot Password" "$BASE_URL/forgot-password"
check "Blog" "$BASE_URL/blog"
check "Legal" "$BASE_URL/legal"

echo ""
echo "📋 Public Forms:"
# Get slugs from DB
ACCESS_TOKEN=$(cat ~/.supabase/access-token 2>/dev/null)
if [ -n "$ACCESS_TOKEN" ]; then
  # Collection links
  SLUGS=$(curl -s -X POST "https://api.supabase.com/v1/projects/wnmfanhejnrtfccemlai/database/query" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"query": "SELECT slug FROM collection_links WHERE is_active = true LIMIT 3;"}' 2>/dev/null | python3 -c "import sys,json; [print(r['slug']) for r in json.load(sys.stdin)]" 2>/dev/null)
  
  for slug in $SLUGS; do
    check "Testimonial form /t/$slug" "$BASE_URL/t/$slug"
  done

  # Unified links
  USLUGS=$(curl -s -X POST "https://api.supabase.com/v1/projects/wnmfanhejnrtfccemlai/database/query" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"query": "SELECT slug FROM unified_links WHERE is_active = true LIMIT 3;"}' 2>/dev/null | python3 -c "import sys,json; [print(r['slug']) for r in json.load(sys.stdin)]" 2>/dev/null)
  
  for slug in $USLUGS; do
    check "Unified form /r/$slug" "$BASE_URL/r/$slug"
  done

  # NPS forms
  BSLUGS=$(curl -s -X POST "https://api.supabase.com/v1/projects/wnmfanhejnrtfccemlai/database/query" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"query": "SELECT slug FROM businesses LIMIT 3;"}' 2>/dev/null | python3 -c "import sys,json; [print(r['slug']) for r in json.load(sys.stdin)]" 2>/dev/null)
  
  for slug in $BSLUGS; do
    check "NPS form /nps/$slug" "$BASE_URL/nps/$slug"
  done
fi

echo ""
echo "⚡ Edge Functions (reachable — 401/400 = exists, 404 = missing):"
check_edge() {
  local name="$1"
  local url="$2"
  local code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
  if [ "$code" != "404" ] && [ "$code" != "000" ]; then
    echo "  ✅ $name (reachable, $code)"
    PASS=$((PASS+1))
  else
    echo "  ❌ $name (not found, $code)"
    FAIL=$((FAIL+1))
  fi
}
check_edge "send-email" "$SUPABASE_URL/functions/v1/send-email"
check_edge "recovery-reply" "$SUPABASE_URL/functions/v1/recovery-reply"
check_edge "recovery-customer-reply" "$SUPABASE_URL/functions/v1/recovery-customer-reply"
check_edge "create-checkout" "$SUPABASE_URL/functions/v1/create-checkout"
check_edge "stripe-webhook" "$SUPABASE_URL/functions/v1/stripe-webhook"

echo ""
echo "🔍 Content Checks:"
check_contains "Widget.js exists" "$BASE_URL/widget.js" "testimonioya"

echo ""
echo "📊 Build Check:"
cd "$(dirname "$0")/.."
if npm run build 2>&1 | grep -q "error TS"; then
  echo "  ❌ TypeScript build has errors"
  FAIL=$((FAIL+1))
else
  echo "  ✅ Build passes"
  PASS=$((PASS+1))
fi

echo ""
echo "================================="
echo "Results: ✅ $PASS passed, ❌ $FAIL failed"
if [ $FAIL -gt 0 ]; then
  echo "⛔ DO NOT DEPLOY — fix failures first"
  exit 1
else
  echo "🚀 All tests passed — safe to deploy"
  exit 0
fi
