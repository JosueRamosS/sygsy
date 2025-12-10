# Build Stage
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Skip tests to speed up build and avoid environment dependency issues
RUN mvn clean package -DskipTests

# Run Stage
FROM eclipse-temurin:17-jdk-alpine
VOLUME /tmp
COPY --from=build /app/target/*.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
