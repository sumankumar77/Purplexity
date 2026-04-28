import json
import sqlite3
import uuid
from pathlib import Path

from app.schemas.search import ChatHistoryMessage, ConversationMessage, ConversationSummary, Source


class ConversationStore:
    def __init__(self, database_path: str) -> None:
        self.database_path = Path(database_path)
        self.database_path.parent.mkdir(parents=True, exist_ok=True)
        self._initialize()

    def create_conversation_id(self) -> str:
        return str(uuid.uuid4())

    def get_history(self, conversation_id: str) -> list[ChatHistoryMessage]:
        with self._connect() as connection:
            rows = connection.execute(
                """
                SELECT role, content
                FROM messages
                WHERE conversation_id = ?
                ORDER BY id ASC
                """,
                (conversation_id,),
            ).fetchall()

        return [
            ChatHistoryMessage(role=row["role"], content=row["content"])
            for row in rows
        ]

    def list_conversations(self) -> list[ConversationSummary]:
        with self._connect() as connection:
            rows = connection.execute(
                """
                SELECT
                    conversation_id,
                    MIN(id) AS first_id,
                    MAX(created_at) AS last_created_at
                FROM messages
                GROUP BY conversation_id
                ORDER BY last_created_at DESC
                """
            ).fetchall()

            summaries = []
            for row in rows:
                title_row = connection.execute(
                    """
                    SELECT content
                    FROM messages
                    WHERE conversation_id = ? AND role = 'user'
                    ORDER BY id ASC
                    LIMIT 1
                    """,
                    (row["conversation_id"],),
                ).fetchone()
                title = title_row["content"] if title_row else "New chat"
                summaries.append(
                    ConversationSummary(
                        conversation_id=row["conversation_id"],
                        title=title,
                    )
                )

        return summaries

    def get_conversation_messages(
        self,
        conversation_id: str,
    ) -> list[ConversationMessage]:
        with self._connect() as connection:
            rows = connection.execute(
                """
                SELECT role, content, sources_json, follow_up_questions_json
                FROM messages
                WHERE conversation_id = ?
                ORDER BY id ASC
                """,
                (conversation_id,),
            ).fetchall()

        return [
            ConversationMessage(
                role=row["role"],
                content=row["content"],
                sources=[
                    Source(**source)
                    for source in json.loads(row["sources_json"] or "[]")
                ],
                follow_up_questions=json.loads(
                    row["follow_up_questions_json"] or "[]"
                ),
            )
            for row in rows
        ]

    def add_message(
        self,
        conversation_id: str,
        role: str,
        content: str,
        sources: list[Source] | None = None,
        follow_up_questions: list[str] | None = None,
    ) -> None:
        with self._connect() as connection:
            connection.execute(
                """
                INSERT INTO messages (
                    conversation_id,
                    role,
                    content,
                    sources_json,
                    follow_up_questions_json
                )
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    conversation_id,
                    role,
                    content,
                    json.dumps([source.model_dump() for source in sources or []]),
                    json.dumps(follow_up_questions or []),
                ),
            )

    def _initialize(self) -> None:
        with self._connect() as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    conversation_id TEXT NOT NULL,
                    role TEXT NOT NULL,
                    content TEXT NOT NULL,
                    sources_json TEXT NOT NULL DEFAULT '[]',
                    follow_up_questions_json TEXT NOT NULL DEFAULT '[]',
                    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            connection.execute(
                """
                CREATE INDEX IF NOT EXISTS idx_messages_conversation_id
                ON messages (conversation_id, id)
                """
            )

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.database_path)
        connection.row_factory = sqlite3.Row
        return connection
