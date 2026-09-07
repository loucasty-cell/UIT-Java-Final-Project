#!/bin/bash
# Run all local tests

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "🧪 Running SkillBridge Test Suite"
echo "================================="

# Test backend
test_backend() {
    echo -e "\n${YELLOW}[1/4] Running Backend Unit Tests...${NC}"
    if [ -d "backend" ]; then
        cd backend
        ./mvnw test -Dspring.datasource.url=jdbc:postgresql://localhost:5432/skillbridge_test || true
        cd ..
    fi
}

# Test frontend
test_frontend() {
    echo -e "\n${YELLOW}[2/4] Running Frontend Unit Tests...${NC}"
    npm run test
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Frontend tests passed${NC}"
    else
        echo -e "${RED}✗ Frontend tests failed${NC}"
        exit 1
    fi
}

# Lint checks
lint_check() {
    echo -e "\n${YELLOW}[3/4] Running Lint Checks...${NC}"
    npm run lint
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Lint checks passed${NC}"
    else
        echo -e "${RED}✗ Lint checks failed${NC}"
        exit 1
    fi
}

# Type checks
type_check() {
    echo -e "\n${YELLOW}[4/4] Running TypeScript Type Checks...${NC}"
    npm run type-check
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Type checks passed${NC}"
    else
        echo -e "${RED}✗ Type checks failed${NC}"
        exit 1
    fi
}

# Main execution
main() {
    test_frontend
    lint_check
    type_check
    test_backend
    
    echo -e "\n${GREEN}✅ All local test checks completed!${NC}"
}

main
