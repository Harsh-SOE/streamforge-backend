#!/bin/bash
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}[ENTRYPOINT - development]${NC} Starting Views service in ${YELLOW}development${NC} mode."
yarn start:dev views
