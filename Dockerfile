# ── Stage 1: Build frontend ──────────────────────────────────
FROM node:20-slim AS frontend-build

WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ── Stage 2: Python backend + built frontend ─────────────────
FROM python:3.12-slim

WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ ./

# Copy built frontend into backend/static (served by FastAPI)
COPY --from=frontend-build /app/frontend/dist ./static

# Cloud Run uses PORT env var (default 8080)
ENV PORT=8080
EXPOSE ${PORT}

CMD uvicorn draftmind.main:app --host 0.0.0.0 --port ${PORT}
