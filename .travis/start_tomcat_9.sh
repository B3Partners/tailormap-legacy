#!/usr/bin/env bash
VERSION=$(grep "<version>.*<.version>" -m1 pom.xml | sed -e "s/^.*<postgresql.version/<postgresql.version/" | cut -f2 -d">"| cut -f1 -d"<")
PGVERSION=$(grep "<postgresql.version>.*<.postgresql.version>" -m1 pom.xml | sed -e "s/^.*<postgresql.version/<postgresql.version/" | cut -f2 -d">"| cut -f1 -d"<")

docker run -d --name tomcat9 -it --rm --network=host -p 9090:8080 \
  -v $PWD/viewer/target/viewer-$VERSION.war:/usr/local/tomcat/webapps/viewer.war \
  -v $PWD/viewer-admin/target/viewer-admin-$VERSION.war:/usr/local/tomcat/webapps/viewer-admin.war \
  -v $PWD/tomcat-lib/target/lib/postgresql-$PGVERSION.jar:/usr/local/tomcat/lib/postgresql.jar \
  tomcat:9-jre8 catalina.sh run
