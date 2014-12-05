#!/bin/bash
ZIP=false;
if [ -z "$1" ]; then
	ZIP=$1
fi

rm *.war 
rm *.zip
mvn clean install
cp viewer/target/*.war viewer.war
cp viewer-admin/target/*.war viewer-admin.war
if [ $ZIP ]; then
	zip flamingo.zip viewer*war
fi
