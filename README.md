# JEST - A sweet combination of JPA + REST

## How to build
```
mvn clean install
```

## How to run the demo app
```
mvn -f demo.embeddedtc/pom.xml exec:exec
```

This starts an embedded tomcat at `http://localhost:8090/index.html` so please open that URL.

It uses embedded Derby, so no need to start any database.

## Project Layout

```
jest/
  |-- runtime            (JEST runtime library code. No dependency on tomcat here)
  | 
  |-- demo.domain        (JPA domain model with persistence.xml)
  |  
  |-- demo.embeddedtc    (Shows how to launch embedded Tomcat and configure JEST)
```
