FROM python:3.12-slim
WORKDIR /app
COPY requirements.lock.txt pyproject.toml README.md ./
COPY src ./src
COPY artifacts ./artifacts
COPY alembic.ini ./
COPY alembic ./alembic
RUN pip install --no-cache-dir -r requirements.lock.txt
ENV PYTHONPATH=/app/src
EXPOSE 8000
CMD ["python", "-m", "uvicorn", "training_continuity.asgi:app", "--host", "0.0.0.0", "--port", "8000"]
