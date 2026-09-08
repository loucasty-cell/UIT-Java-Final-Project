FROM eclipse-temurin:25-jdk AS build

WORKDIR /workspace
COPY . .

RUN chmod +x backend/mvnw && cd backend && ./mvnw -B -DskipTests clean package

FROM eclipse-temurin:25-jre

WORKDIR /app
COPY --from=build /workspace/backend/target/skillbridge-backend-*.jar /app/app.jar

ENV JAVA_OPTS=""
EXPOSE 10000

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
