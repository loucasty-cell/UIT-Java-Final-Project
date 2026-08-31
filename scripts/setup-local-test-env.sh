#!/bin/bash
# Local testing environment setup script (No Docker)

set -e

echo "🚀 SkillBridge Local Testing Environment Setup"
echo "=============================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if PostgreSQL is running locally
check_postgres() {
    echo -e "\n${YELLOW}Checking PostgreSQL installation...${NC}"
    
    if command -v psql &> /dev/null; then
        echo -e "${GREEN}✓ PostgreSQL is installed${NC}"
        
        # Check if PostgreSQL is running
        if pg_isready -q 2>/dev/null; then
            echo -e "${GREEN}✓ PostgreSQL is running${NC}"
        else
            echo -e "${RED}✗ PostgreSQL is not running. Please start it:${NC}"
            echo "  macOS: brew services start postgresql@16"
            echo "  Linux: sudo systemctl start postgresql"
            echo "  Windows: Start PostgreSQL service from Services"
            exit 1
        fi
    else
        echo -e "${RED}✗ PostgreSQL is not installed${NC}"
        echo "Please install PostgreSQL 16: https://www.postgresql.org/download/"
        exit 1
    fi
}

# Create test database
create_test_db() {
    echo -e "\n${YELLOW}Creating test database...${NC}"
    
    # Drop and recreate database
    psql -U postgres -c "DROP DATABASE IF EXISTS skillbridge_test;" 2>/dev/null || true
    psql -U postgres -c "CREATE DATABASE skillbridge_test;"
    psql -U postgres -c "CREATE USER skillbridge WITH PASSWORD 'test_password';" 2>/dev/null || true
    psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE skillbridge_test TO skillbridge;"
    
    echo -e "${GREEN}✓ Test database created${NC}"
}

# Setup backend
setup_backend() {
    echo -e "\n${YELLOW}Setting up backend...${NC}"
    
    cd backend
    
    # Check Java version
    if command -v java &> /dev/null; then
        JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d'.' -f1)
        if [ "$JAVA_VERSION" -ge 17 ] 2>/dev/null || [ "$JAVA_VERSION" = "25" ] 2>/dev/null; then
            echo -e "${GREEN}✓ Java $JAVA_VERSION is installed${NC}"
        else
            echo -e "${RED}✗ Java 17+ is required (found Java $JAVA_VERSION)${NC}"
            exit 1
        fi
    else
        echo -e "${RED}✗ Java is not installed${NC}"
        exit 1
    fi
    
    # Run Flyway migrations
    echo -e "${YELLOW}Running database migrations...${NC}"
    ./mvnw flyway:migrate \
        -Dflyway.url=jdbc:postgresql://localhost:5432/skillbridge_test \
        -Dflyway.user=skillbridge \
        -Dflyway.password=test_password
    
    echo -e "${GREEN}✓ Backend setup complete${NC}"
    cd ..
}

# Setup frontend
setup_frontend() {
    echo -e "\n${YELLOW}Setting up frontend...${NC}"
    
    # Check Node.js version
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -ge 18 ]; then
            echo -e "${GREEN}✓ Node.js $NODE_VERSION is installed${NC}"
        else
            echo -e "${RED}✗ Node.js 18+ is required (found Node.js $NODE_VERSION)${NC}"
            exit 1
        fi
    else
        echo -e "${RED}✗ Node.js is not installed${NC}"
        exit 1
    fi
    
    # Install dependencies
    echo -e "${YELLOW}Installing npm dependencies...${NC}"
    npm install
    
    echo -e "${GREEN}✓ Frontend setup complete${NC}"
}

# Main execution
main() {
    check_postgres
    create_test_db
    setup_backend
    setup_frontend
    
    echo -e "\n${GREEN}✅ Local testing environment is ready!${NC}"
    echo -e "\nTo run tests:"
    echo "  Backend:  cd backend && ./mvnw test"
    echo "  Frontend: npm run test"
    echo "  E2E:      npm run test:e2e"
}

main
