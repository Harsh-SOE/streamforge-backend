#!/bin/bash
set -e

echo "[BOOTSTRAP - development] Waiting for OpenFGA..."
until curl -s http://openfga:8080/healthz > /dev/null; do
  sleep 1
done
echo "[BOOTSTRAP - development] OpenFGA ready."

apps/authz/scripts/openfga.dev.bash

STORE_ID=$(jq -r '.storeId' openfga.json)
MODEL_ID=$(jq -r '.modelId' openfga.json)

export FGA_STORE_ID=$STORE_ID
export FGA_MODEL_ID=$MODEL_ID

echo "[BOOTSTRAP - development] storeId=$STORE_ID"
echo "[BOOTSTRAP - development] modelId=$MODEL_ID"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}[ENTRYPOINT - development]${NC} Starting Authz service in ${YELLOW}development${NC} mode."
yarn start:dev authz