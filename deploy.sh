#!/bin/bash

# Samuel Homepage Deployment Script

set -e

echo "🚀 Samuel Homepage Deployment Script"
echo "===================================="

# Function to print colored output
print_status() {
    echo -e "\n\033[1;34m$1\033[0m"
}

print_success() {
    echo -e "\033[1;32m✅ $1\033[0m"
}

print_error() {
    echo -e "\033[1;31m❌ $1\033[0m"
}

# Check if Docker and Docker Compose are installed
print_status "Checking dependencies..."

if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

print_success "Docker and Docker Compose are installed"

# Clean any previous builds and build the application
print_status "Building Next.js application..."
rm -rf .next
npm run build
print_success "Next.js build completed"

# Build and start the Docker containers
print_status "Building Docker image..."
docker-compose build --no-cache

print_status "Starting containers..."
docker-compose up -d

# Wait for the container to be healthy
print_status "Waiting for application to be ready..."
sleep 10

# Check if the container is running
if docker-compose ps | grep -q "Up"; then
    print_success "Container is running successfully!"
    echo ""
    echo "🎉 Your portfolio is now available at:"
    echo "   http://localhost:1111"
    echo ""
    echo "📊 To view logs: docker-compose logs -f"
    echo "🛑 To stop: docker-compose down"
    echo "🔄 To restart: docker-compose restart"
else
    print_error "Container failed to start. Check logs with: docker-compose logs"
    exit 1
fi