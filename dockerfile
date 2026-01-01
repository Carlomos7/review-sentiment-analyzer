FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

WORKDIR /app

# Copy project files
COPY pyproject.toml .
COPY src/ src/
COPY api/ api/
COPY models/ models/

# Install dependencies
RUN uv pip install --system --no-cache .

# Expose port
EXPOSE 8000

# Run the API
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]