# ===== BUILD STAGE =====
FROM maven:3.9.12-eclipse-temurin-21 AS builder
WORKDIR /app

COPY pom.xml pom.xml

COPY src src

RUN --mount=type=cache,target=/root/.m2 \
    mvn dependency:go-offline

RUN --mount=type=cache,target=/root/.m2 \
    mvn clean package -DskipTests

# ===== RUNTIME STAGE =====
FROM eclipse-temurin:21-jre-alpine-3.23
WORKDIR /app

COPY --from=builder /app/target/gateway-*.jar gateway.jar

EXPOSE 9050

ENTRYPOINT ["java","-jar","/app/gateway.jar"]