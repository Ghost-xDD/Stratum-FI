.PHONY: help install run test docker-build docker-up docker-down clean

help:
	@echo "Stratum Fi Keeper Bot - Makefile Commands"
	@echo "=========================================="
	@echo ""
	@echo "Setup:"
	@echo "  make install      Install dependencies in virtual environment"
	@echo "  make config       Copy .env.example to .env"
	@echo ""
	@echo "Run:"
	@echo "  make run          Run keeper bot locally"
	@echo "  make dry-run      Run in test mode (no real transactions)"
	@echo ""
	@echo "Test:"
	@echo "  make test         Run test suite with coverage"
	@echo "  make lint         Run linters (black, flake8, mypy)"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-build Build Docker image"
	@echo "  make docker-up    Start Docker containers"
	@echo "  make docker-down  Stop Docker containers"
	@echo "  make docker-logs  View Docker logs"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean        Remove logs, cache, and artifacts"
	@echo "  make format       Format code with black"

install:
	python3 -m venv venv
	. venv/bin/activate && pip install -r requirements.txt
	@echo "✅ Dependencies installed. Activate with: source venv/bin/activate"

config:
	cp .env.example .env
	@echo "✅ Created .env file. Please edit with your configuration."

run:
	@if [ ! -f .env ]; then echo "❌ .env not found. Run 'make config' first."; exit 1; fi
	. venv/bin/activate && python main.py

dry-run:
	@if [ ! -f .env ]; then echo "❌ .env not found. Run 'make config' first."; exit 1; fi
	. venv/bin/activate && DRY_RUN=true python main.py

test:
	. venv/bin/activate && bash scripts/run-tests.sh

lint:
	. venv/bin/activate && black src/ tests/ --check
	. venv/bin/activate && flake8 src/ tests/
	. venv/bin/activate && mypy src/

format:
	. venv/bin/activate && black src/ tests/

docker-build:
	cd scripts && docker-compose build

docker-up:
	cd scripts && docker-compose up -d
	@echo "✅ Keeper bot running in Docker"
	@echo "View logs: make docker-logs"

docker-down:
	cd scripts && docker-compose down

docker-logs:
	cd scripts && docker-compose logs -f keeper

clean:
	rm -rf logs/*.log
	rm -rf __pycache__ src/__pycache__ tests/__pycache__
	rm -rf .pytest_cache .coverage htmlcov
	rm -rf *.egg-info dist build
	@echo "✅ Cleaned up logs and artifacts"

