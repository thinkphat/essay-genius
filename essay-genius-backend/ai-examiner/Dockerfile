# ===== BUILD STAGE =====
FROM python:3.13.1 AS builder

WORKDIR /app
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    pip wheel -r requirements.txt

# ===== RUNTIME STAGE =====
FROM python:3.13.1-slim

WORKDIR /app
COPY --from=builder /app /wheels
RUN pip install --no-cache /wheels/*

COPY . .

CMD ["python", "app.py"]