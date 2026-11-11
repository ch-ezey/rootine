# Builds the API from source, so `docker compose up --build` needs nothing pre-built.

# ─── Build stage: compile the jar with the Maven wrapper ─────────────────────────
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

# Dependencies first: this layer is cached until pom.xml changes
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
# Strip Windows line endings in case the checkout converted them
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw && ./mvnw -B -q dependency:go-offline

COPY src/ src/
# Tests run separately (./mvnw test); they start their own embedded Postgres
RUN ./mvnw -B -q package -DskipTests

# ─── Runtime stage: just a JRE and the jar ───────────────────────────────────────
FROM eclipse-temurin:17-jre
WORKDIR /app

# Don't run as root
RUN useradd --system --uid 1001 --no-create-home spring
COPY --from=build /app/target/*.jar app.jar
USER spring

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
