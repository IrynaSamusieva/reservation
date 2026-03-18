FROM maven:3.9-amazoncorretto-17 AS build
WORKDIR /src
COPY pom.xml .
COPY src ./src
RUN mvn install

# 2. Runtime stage with Tomcat
FROM tomcat:10.0-jdk17
RUN rm -rf /usr/local/tomcat/webapps/*
COPY --from=build /src/target/*.war /usr/local/tomcat/webapps/ROOT.war

