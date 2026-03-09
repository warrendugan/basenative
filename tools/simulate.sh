#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_HOST="http://localhost:3000"
API_GATEWAY_PID=""
RESULTS=()
PASSED=0
FAILED=0
TOTAL=0

# Function to print test results
print_result() {
  local scenario=$1
  local status=$2
  local message=$3

  TOTAL=$((TOTAL + 1))
  if [ "$status" = "PASS" ]; then
    echo -e "${GREEN}✓ PASS${NC}: $scenario"
    if [ -n "$message" ]; then
      echo "  → $message"
    fi
    RESULTS+=("PASS: $scenario")
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}✗ FAIL${NC}: $scenario"
    if [ -n "$message" ]; then
      echo "  → $message"
    fi
    RESULTS+=("FAIL: $scenario")
    FAILED=$((FAILED + 1))
  fi
}

# Function to cleanup
cleanup() {
  if [ -n "$API_GATEWAY_PID" ]; then
    echo -e "\n${YELLOW}Stopping API Gateway (PID: $API_GATEWAY_PID)...${NC}"
    kill $API_GATEWAY_PID 2>/dev/null
    wait $API_GATEWAY_PID 2>/dev/null
    echo "API Gateway stopped"
  fi
}

# Set trap to cleanup on exit
trap cleanup EXIT

# Start the API Gateway
echo -e "${BLUE}Starting API Gateway...${NC}"
cd /sessions/jolly-eloquent-brahmagupta/mnt/Code/basenative
npm run serve:api-gateway &
API_GATEWAY_PID=$!

# Wait for API Gateway to start
echo -e "${YELLOW}Waiting for API Gateway to be ready...${NC}"
RETRY_COUNT=0
MAX_RETRIES=30

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_HOST/api/health")
  if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo -e "${GREEN}API Gateway is ready!${NC}"
    break
  fi
  RETRY_COUNT=$((RETRY_COUNT + 1))
  sleep 1
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo -e "${RED}API Gateway failed to start${NC}"
  exit 1
fi

echo ""
echo -e "${BLUE}Running API Simulation Tests${NC}"
echo "================================="
echo ""

# Test 1: Health Check
echo -e "${YELLOW}Test 1: Health Check${NC}"
HEALTH_RESPONSE=$(curl -s "$API_HOST/api/health")
if echo "$HEALTH_RESPONSE" | grep -q '"status":"ok"'; then
  print_result "GET /api/health" "PASS" "Health check successful"
else
  print_result "GET /api/health" "FAIL" "Unexpected response: $HEALTH_RESPONSE"
fi
echo ""

# Test 2: Login
echo -e "${YELLOW}Test 2: Authentication${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_HOST/api/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: greenput" \
  -d '{"email":"test@example.com"}')

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
if [ -n "$TOKEN" ] && [ "$TOKEN" != "" ]; then
  print_result "POST /api/auth/login" "PASS" "Token obtained: ${TOKEN:0:20}..."
else
  print_result "POST /api/auth/login" "FAIL" "No token in response: $LOGIN_RESPONSE"
  TOKEN=""
fi
echo ""

# Test 3: Get Leads
echo -e "${YELLOW}Test 3: Greenput Leads${NC}"
if [ -n "$TOKEN" ]; then
  LEADS_RESPONSE=$(curl -s -X GET "$API_HOST/api/leads" \
    -H "Authorization: Bearer $TOKEN" \
    -H "X-Tenant-ID: greenput")

  LEAD_COUNT=$(echo "$LEADS_RESPONSE" | grep -o '"total":[0-9]*' | cut -d':' -f2)
  if [ -n "$LEAD_COUNT" ]; then
    print_result "GET /api/leads" "PASS" "Retrieved $LEAD_COUNT leads"
  else
    print_result "GET /api/leads" "FAIL" "No leads found: $LEADS_RESPONSE"
  fi
else
  print_result "GET /api/leads" "FAIL" "No auth token available"
fi
echo ""

# Test 4: Create Lead
echo -e "${YELLOW}Test 4: Create Lead${NC}"
if [ -n "$TOKEN" ]; then
  CREATE_LEAD_RESPONSE=$(curl -s -X POST "$API_HOST/api/leads" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -H "X-Tenant-ID: greenput" \
    -d '{
      "name":"Test Lead",
      "email":"testlead@example.com",
      "phone":"555-9999",
      "company":"Test Company",
      "status":"new"
    }')

  NEW_LEAD_ID=$(echo "$CREATE_LEAD_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
  if [ -n "$NEW_LEAD_ID" ]; then
    print_result "POST /api/leads" "PASS" "Created lead with ID: $NEW_LEAD_ID"
  else
    print_result "POST /api/leads" "FAIL" "Failed to create lead: $CREATE_LEAD_RESPONSE"
  fi
else
  print_result "POST /api/leads" "FAIL" "No auth token available"
fi
echo ""

# Test 5: Get Deals
echo -e "${YELLOW}Test 5: Greenput Deals${NC}"
DEALS_RESPONSE=$(curl -s -X GET "$API_HOST/api/deals" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Tenant-ID: greenput")

DEAL_COUNT=$(echo "$DEALS_RESPONSE" | grep -o '"total":[0-9]*' | cut -d':' -f2)
if [ -n "$DEAL_COUNT" ]; then
  print_result "GET /api/deals" "PASS" "Retrieved $DEAL_COUNT deals"
else
  print_result "GET /api/deals" "FAIL" "Failed to get deals: $DEALS_RESPONSE"
fi
echo ""

# Test 6: Create Deal
echo -e "${YELLOW}Test 6: Create Deal${NC}"
if [ -n "$TOKEN" ]; then
  CREATE_DEAL_RESPONSE=$(curl -s -X POST "$API_HOST/api/deals" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -H "X-Tenant-ID: greenput" \
    -d '{
      "title":"New Test Deal",
      "description":"Test deal for simulation",
      "stage":"prospecting",
      "value":50000,
      "currency":"USD",
      "clientName":"Simulation Test Corp",
      "contactEmail":"contact@test.com",
      "notes":"Created during API simulation test"
    }')

  NEW_DEAL_ID=$(echo "$CREATE_DEAL_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
  if [ -n "$NEW_DEAL_ID" ]; then
    print_result "POST /api/deals" "PASS" "Created deal with ID: $NEW_DEAL_ID"
  else
    print_result "POST /api/deals" "FAIL" "Failed to create deal: $CREATE_DEAL_RESPONSE"
  fi
else
  print_result "POST /api/deals" "FAIL" "No auth token available"
fi
echo ""

# Test 7: Update Deal Stage
echo -e "${YELLOW}Test 7: Update Deal Stage${NC}"
if [ -n "$TOKEN" ] && [ -n "$NEW_DEAL_ID" ]; then
  UPDATE_DEAL_RESPONSE=$(curl -s -X PATCH "$API_HOST/api/deals/$NEW_DEAL_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -H "X-Tenant-ID: greenput" \
    -d '{
      "stage":"qualification",
      "notes":"Stage updated during simulation test"
    }')

  UPDATED_STAGE=$(echo "$UPDATE_DEAL_RESPONSE" | grep -o '"stage":"[^"]*' | cut -d'"' -f4)
  if [ "$UPDATED_STAGE" = "qualification" ]; then
    print_result "PATCH /api/deals/:id" "PASS" "Deal stage updated to: $UPDATED_STAGE"
  else
    print_result "PATCH /api/deals/:id" "FAIL" "Stage not updated: $UPDATE_DEAL_RESPONSE"
  fi
else
  print_result "PATCH /api/deals/:id" "FAIL" "Missing token or deal ID"
fi
echo ""

# Test 8: Get Treasury Summary
echo -e "${YELLOW}Test 8: Treasury Summary${NC}"
SUMMARY_RESPONSE=$(curl -s -X GET "$API_HOST/api/treasury/summary" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Tenant-ID: greenput")

TOTAL_BALANCE=$(echo "$SUMMARY_RESPONSE" | grep -o '"totalBalance":[0-9]*' | cut -d':' -f2)
if [ -n "$TOTAL_BALANCE" ]; then
  print_result "GET /api/treasury/summary" "PASS" "Treasury balance: \$$TOTAL_BALANCE"
else
  print_result "GET /api/treasury/summary" "FAIL" "Failed to get summary: $SUMMARY_RESPONSE"
fi
echo ""

# Test 9: Get Treasury Accounts
echo -e "${YELLOW}Test 9: Treasury Accounts${NC}"
if [ -n "$TOKEN" ]; then
  ACCOUNTS_RESPONSE=$(curl -s -X GET "$API_HOST/api/treasury/accounts" \
    -H "Authorization: Bearer $TOKEN" \
    -H "X-Tenant-ID: greenput")

  ACCOUNT_COUNT=$(echo "$ACCOUNTS_RESPONSE" | grep -o '"total":[0-9]*' | cut -d':' -f2)
  if [ -n "$ACCOUNT_COUNT" ]; then
    print_result "GET /api/treasury/accounts" "PASS" "Retrieved $ACCOUNT_COUNT accounts"
  else
    print_result "GET /api/treasury/accounts" "FAIL" "Failed to get accounts: $ACCOUNTS_RESPONSE"
  fi
else
  print_result "GET /api/treasury/accounts" "FAIL" "No auth token available"
fi
echo ""

# Test 10: Get Documents
echo -e "${YELLOW}Test 10: Greenput Documents${NC}"
if [ -n "$TOKEN" ]; then
  DOCUMENTS_RESPONSE=$(curl -s -X GET "$API_HOST/api/documents" \
    -H "Authorization: Bearer $TOKEN" \
    -H "X-Tenant-ID: greenput")

  DOCUMENT_COUNT=$(echo "$DOCUMENTS_RESPONSE" | grep -o '"total":[0-9]*' | cut -d':' -f2)
  if [ -n "$DOCUMENT_COUNT" ]; then
    print_result "GET /api/documents" "PASS" "Retrieved $DOCUMENT_COUNT documents"
  else
    print_result "GET /api/documents" "FAIL" "Failed to get documents: $DOCUMENTS_RESPONSE"
  fi
else
  print_result "GET /api/documents" "FAIL" "No auth token available"
fi
echo ""

# Print Summary
echo "================================="
echo -e "${BLUE}Test Summary${NC}"
echo "================================="
echo -e "Total Tests:  $TOTAL"
echo -e "${GREEN}Passed:       $PASSED${NC}"
echo -e "${RED}Failed:       $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}Some tests failed!${NC}"
  exit 1
fi
