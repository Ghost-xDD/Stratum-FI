#!/bin/bash
# Run keeper bot test suite

set -e

cd "$(dirname "$0")/.."

echo "🧪 Running Stratum Fi Keeper Bot Tests"
echo "========================================"

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Install test dependencies
pip install -q pytest pytest-cov

# Run tests with coverage
echo ""
echo "Running tests..."
pytest tests/ -v --cov=src --cov-report=term-missing

echo ""
echo "✅ Tests complete!"

