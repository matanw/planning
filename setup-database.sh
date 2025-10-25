#!/bin/bash

# Personal Hierarchical Task Management System - Database Setup Script
# This script sets up PostgreSQL database for the task management system

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Personal Hierarchical Task Management System - Database Setup${NC}"
echo "=================================================================="

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}PostgreSQL is not installed. Please install PostgreSQL first.${NC}"
    echo "On macOS with Homebrew: brew install postgresql"
    echo "On Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib"
    echo "On CentOS/RHEL: sudo yum install postgresql postgresql-server"
    exit 1
fi

# Check if PostgreSQL service is running
if ! pg_isready &> /dev/null; then
    echo -e "${YELLOW}PostgreSQL service is not running. Starting PostgreSQL...${NC}"
    
    # Try to start PostgreSQL service
    if command -v brew &> /dev/null; then
        # macOS with Homebrew
        brew services start postgresql
    elif command -v systemctl &> /dev/null; then
        # Linux with systemd
        sudo systemctl start postgresql
    elif command -v service &> /dev/null; then
        # Linux with service command
        sudo service postgresql start
    else
        echo -e "${RED}Cannot start PostgreSQL service automatically. Please start it manually.${NC}"
        exit 1
    fi
    
    # Wait a moment for the service to start
    sleep 3
    
    if ! pg_isready &> /dev/null; then
        echo -e "${RED}Failed to start PostgreSQL service. Please start it manually.${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}PostgreSQL is running!${NC}"

# Database configuration
DB_NAME="task_management"
DB_USER="postgres"
DB_PASSWORD="password"

# Create database if it doesn't exist
echo -e "${YELLOW}Creating database '${DB_NAME}'...${NC}"
createdb $DB_NAME 2>/dev/null || echo "Database already exists or creation failed"

# Create user if it doesn't exist (optional, using default postgres user)
echo -e "${YELLOW}Setting up database user...${NC}"

# Run the schema
echo -e "${YELLOW}Running database schema...${NC}"
psql -d $DB_NAME -f database/schema.sql

echo -e "${GREEN}Database setup completed successfully!${NC}"
echo ""
echo "Database Configuration:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Password: $DB_PASSWORD"
echo ""
echo "You can now start the application with:"
echo "  bun dev"
echo ""
echo -e "${YELLOW}Note: Make sure to update the database configuration in src/App.tsx if needed.${NC}"
