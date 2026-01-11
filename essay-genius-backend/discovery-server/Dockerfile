# ===== BUILD STAGE =====
FROM maven:3.9.12-eclipse-temurin-21 AS builder
WORKDIR /app

# Copy pom.xml trước để Maven có project
COPY pom.xml pom.xml

# Copy source code
COPY src src

# Cache Maven dependencies
RUN --mount=type=cache,target=/root/.m2 \
    mvn dependency:go-offline

# Build executable JAR
RUN --mount=type=cache,target=/root/.m2 \
    mvn clean package -DskipTests

# ===== RUNTIME STAGE =====
FROM eclipse-temurin:21-jre-alpine-3.23
WORKDIR /run

# Copy JAR từ builder
COPY --from=builder /app/target/discovery-server-*.jar discovery-server.jar

EXPOSE 8761

ENTRYPOINT ["java","-jar","/run/discovery-server.jar"]
