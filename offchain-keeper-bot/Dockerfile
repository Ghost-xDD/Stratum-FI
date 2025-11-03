FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY config.py .
COPY logger.py .
COPY metrics.py .
COPY contracts.py .
COPY keeper.py .
COPY health_check.py .

# Create logs directory
RUN mkdir -p /app/logs

# Expose Prometheus metrics port
EXPOSE 8000

# Expose health check port
EXPOSE 8080

# Set environment variables (override with docker run -e or docker-compose)
ENV PYTHONUNBUFFERED=1
ENV LOG_LEVEL=INFO

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8080/health')"

# Run keeper bot
CMD ["python", "-u", "keeper.py"]

