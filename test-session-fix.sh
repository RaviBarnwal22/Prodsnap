#!/bin/bash

echo "🧪 Testing Session Fix on Vercel"
echo "=================================="
echo ""

# Test 1: Check if login page loads
echo "✓ Test 1: Login page accessibility"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://prodsnap-gamma.vercel.app/login)
if [ "$STATUS" -eq 200 ]; then
    echo "  ✅ Login page loads (HTTP $STATUS)"
else
    echo "  ❌ Login page failed (HTTP $STATUS)"
fi
echo ""

# Test 2: Check if home redirects to login when not authenticated
echo "✓ Test 2: Protected route redirect"
REDIRECT=$(curl -s -I https://prodsnap-gamma.vercel.app/ | grep -i location | cut -d' ' -f2 | tr -d '\r')
if [[ "$REDIRECT" == *"/login"* ]]; then
    echo "  ✅ Home page redirects to login when not authenticated"
else
    echo "  ❌ Unexpected redirect: $REDIRECT"
fi
echo ""

# Test 3: Check if practice page redirects to login when not authenticated
echo "✓ Test 3: Practice page protection"
REDIRECT=$(curl -s -I https://prodsnap-gamma.vercel.app/practice | grep -i location | cut -d' ' -f2 | tr -d '\r')
if [[ "$REDIRECT" == *"/login"* ]]; then
    echo "  ✅ Practice page redirects to login when not authenticated"
else
    echo "  ❌ Unexpected redirect: $REDIRECT"
fi
echo ""

# Test 4: Check diagnostic endpoint
echo "✓ Test 4: Diagnostic endpoint"
DIAG=$(curl -s https://prodsnap-gamma.vercel.app/api/debug-env)
if [[ "$DIAG" == *"production"* ]]; then
    echo "  ✅ Diagnostic endpoint working"
    echo "  Environment: production"
    echo "  Supabase: configured"
else
    echo "  ❌ Diagnostic endpoint failed"
fi
echo ""

echo "=================================="
echo "📋 Manual Testing Required:"
echo "=================================="
echo ""
echo "1. Open: https://prodsnap-gamma.vercel.app/login"
echo "2. Login with: ravibarnwal89@gmail.com / Test@0987"
echo "3. After redirect, click 'Practice'"
echo "4. Verify you stay logged in (not redirected to login)"
echo "5. Try navigating to other pages"
echo "6. Refresh the page"
echo ""
echo "Expected: Session should persist across all navigation ✅"
echo ""
