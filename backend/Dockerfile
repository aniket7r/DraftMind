FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY draftmind/ draftmind/
COPY data/processed/ data/processed/

EXPOSE 8000

CMD ["uvicorn", "draftmind.main:app", "--host", "0.0.0.0", "--port", "8000"]
