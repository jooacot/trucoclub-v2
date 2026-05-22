# Etapa 1: Compilar el código usando Maven y Java 21 (LTS)
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Etapa 2: Levantar el servidor con Java 21 (LTS)
FROM eclipse-temurin:21-jdk-jammy
WORKDIR /app
COPY --from=build /app/target/trucoclub-1.0-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]