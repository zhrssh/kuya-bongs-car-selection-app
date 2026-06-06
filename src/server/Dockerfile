FROM python:3.12-alpine AS builder

# Install uv directly from the official container image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Set crucial environment variables for optimal docker build performance
ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_PREFERENCE=only-system

WORKDIR /app

# Cached layer: Install dependencies first without copying application source code
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --frozen --no-dev



FROM python:3.12-alpine AS runtime

# Create a non-privileged system user for security compliance
RUN addgroup -g 1001 appgroup \
    && adduser -D -u 1001 -G appgroup appuser

WORKDIR /app

# Copy the isolated virtual environment from the builder stage
COPY --chown=appuser:appgroup --from=builder /app/.venv /app/.venv

# Copy your actual application source files
COPY --chown=appuser:appgroup flaskr ./flaskr

# Prepend the virtual environment binaries to the system PATH
ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONUNBUFFERED=1

# Initialize database
ENV FLASK_APP=flaskr
ENV FLASK_ENV=production
COPY .env .

# Switch to the non-root execution user
USER appuser

EXPOSE 5000
CMD ["gunicorn", "-b", "0.0.0.0:5000", "flaskr:create_app()"]
