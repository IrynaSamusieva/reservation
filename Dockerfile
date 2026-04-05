FROM maven:3.9-amazoncorretto-21 AS build
WORKDIR /src
COPY pom.xml .
COPY src ./src
RUN mvn install -DskipTests

# 2. Runtime stage with Tomcat
FROM tomcat:11.0-jdk21
RUN rm -rf /usr/local/tomcat/webapps/*
COPY --from=build /src/target/*.war /usr/local/tomcat/webapps/ROOT.war

