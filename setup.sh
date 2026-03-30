#!/bin/bash

# Quick Start Script for Internship & Job Portal
# This script helps you set up and run the project quickly

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║   🚀 Internship & Job Portal - Quick Start               ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js first:"
    echo "  brew install node"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Check if MySQL is running
if ! command -v mysql &> /dev/null; then
    echo "⚠️  MySQL command not found. Please ensure MySQL is installed."
else
    echo "✅ MySQL is installed"
fi

echo ""
echo "📦 Setting up Backend..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd backend

# Install backend dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
else
    echo "Backend dependencies already installed ✓"
fi

# Generate Prisma Client
echo "Generating Prisma Client..."
npm run prisma:generate

echo ""
echo "📦 Setting up Frontend..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd ../frontend

# Install frontend dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
else
    echo "Frontend dependencies already installed ✓"
fi

cd ..

echo ""
echo "✅ Setup Complete!"
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║   📝 Next Steps:                                          ║"
echo "║                                                           ║"
echo "║   1. Ensure MySQL is running                              ║"
echo "║   2. Run database migrations:                             ║"
echo "║      cd backend && npm run prisma:migrate                 ║"
echo "║                                                           ║"
echo "║   3. Start Backend (Terminal 1):                          ║"
echo "║      cd backend && npm run dev                            ║"
echo "║                                                           ║"
echo "║   4. Start Frontend (Terminal 2):                         ║"
echo "║      cd frontend && npm start                             ║"
echo "║                                                           ║"
echo "║   🌐 URLs:                                                ║"
echo "║      Backend:  http://localhost:5000                      ║"
echo "║      Frontend: http://localhost:3000                      ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
