# Use JDK 21
FROM eclipse-temurin:21-jdk
WORKDIR /app

# Copy source code
COPY . .

# Expose port for Spring Boot
EXPOSE 8080

# Run Spring Boot app in dev mode
CMD ["mvn", "spring-boot:run"]
