# Purplexity Backend

Phase 3 adds Gemini answer generation to the FastAPI backend.

## Setup

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create a backend environment file or set these variables in your shell:

```bash
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.5-flash
TAVILY_API_KEY=your_tavily_api_key_here
TAVILY_MAX_RESULTS=5
DATABASE_PATH=backend/data/purplexity.sqlite3
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
- `GEMINI_API_KEY`: API key used by the Gemini backend integration.
- `GEMINI_MODEL`: Gemini model name. Defaults to `gemini-2.5-flash`.
- `TAVILY_API_KEY`: API key used by the Tavily web search integration.
- `TAVILY_MAX_RESULTS`: number of Tavily results sent to Gemini. Defaults to `5`.
- `DATABASE_PATH`: SQLite database path for conversation history.

## Endpoints

- `GET /`
- `GET /health`
- `POST /api/search`
- `POST /api/search/stream`

The search endpoints store chat turns in SQLite by `conversation_id`.
Follow-up questions reuse the saved conversation history, Tavily provides the
latest source context, and Gemini receives both before answering. The stream
endpoint returns newline-delimited JSON events for metadata, sources, answer
chunks, and completion follow-up questions.

Firebase auth is not part of this phase.
