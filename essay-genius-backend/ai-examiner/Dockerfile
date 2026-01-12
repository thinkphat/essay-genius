# ===== BUILD STAGE =====
FROM python:3.13.1 AS builder

WORKDIR /app
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    pip wheel -r requirements.txt

# ===== RUNTIME STAGE =====
FROM python:3.11-slim
WORKDIR /app

COPY --from=builder /wheels /wheels
RUN pip install --no-cache-dir /wheels/*

COPY application application
COPY protobuf protobuf
COPY toxicchecker toxicchecker
COPY app.py checker.py instruction.txt ./

CMD ["python", "app.py"]