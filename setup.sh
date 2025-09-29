#!/bin/bash

# 🚀 AI Interview Assistant - Quick Setup Script
# This script sets up the complete development environment

echo "🚀 Setting up AI Interview Assistant..."
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "🔧 Installing PostgreSQL..."
    brew install postgresql@14
fi

# Start PostgreSQL service
echo "📊 Starting PostgreSQL service..."
brew services start postgresql@14

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Setup environment file
if [ ! -f .env ]; then
    echo "🔧 Creating environment file..."
    cp .env.example .env
    echo "✅ Please update .env with your database credentials"
fi

# Create database
echo "🗄️ Creating database..."
createdb ai_interview_db 2>/dev/null || echo "Database already exists"

# Run database migrations
echo "🔄 Running database migrations..."
npx prisma migrate dev --name init

# Seed database
echo "🌱 Seeding database with sample data..."
npm run db:seed

# Go back to root
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start the application:"
echo "1. Frontend: npm run dev (runs on http://localhost:3000)"
echo "2. Backend: cd backend && npm run dev (runs on http://localhost:5001)"
echo ""
echo "🔑 Default login credentials:"
echo "• Admin: admin@demo.com / password123"
echo "• Interviewer: interviewer@demo.com / password123"
echo "• Interviewee: interviewee@demo.com / password123"
echo ""
echo "🎉 Happy coding!"
