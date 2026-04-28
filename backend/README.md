# Purplexity Backend

Phase 2 adds the basic FastAPI backend only.

## Setup

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Run

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## Test

```bash
pytest
```

## Configuration

- `CORS_ORIGINS`: comma-separated allowed frontend origins.

## Endpoints

- `GET /`
- `GET /health`
- `POST /api/search`

The search endpoint returns placeholder data for now. Gemini, Tavily, Firebase auth, and persistence are intentionally not part of Phase 2.
