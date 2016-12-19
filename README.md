# JEST - A sweet combination of JPA + REST

## How to build

There is no special instruction needed. 
Run the following command at the top level of source tree (typically jest unless you cloned differently):

```
mvn clean install
```

## How to run the demo app
After you have built, execute the following command at the top level:

```
mvn -f demo.embeddedtc/pom.xml exec:exec
```

The above command is equivalent to:
`(cd demo.embeddedtc; mvn exec:exec)`

The demo starts an embedded tomcat at http://localhost:8090 .
So please open that URL to proceed further.

It uses embedded Derby, so no need to start any database. It also means all yourchanges will be lost when the process terminates!

## Project Layout

There are following subdirectories:
- runtime => This is the JEST library code. No dependency on tomcat here. Only depends on Servlet, JPA & JSON.
- demo.domain => JPA domain model with persistence.xml. Only depends on JPA. It also configures appropriate JDBC driver & JPA provider. This does *not* depend on JEST.
- demo.embeddedtc => Shows how to launch embedded Tomcat and configure JEST with demo.domain model.



