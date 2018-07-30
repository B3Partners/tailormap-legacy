#!/bin/bash
# look for "INSERT INTO metadata (id"... in ./viewer-config-persistence/src/test/resources/nl/b3p/viewer/util/testdata.sql
#  to get the current database version to be inserted
#
fladbversion=$(grep 'INSERT INTO metadata (id' ./viewer-config-persistence/src/test/resources/nl/b3p/viewer/util/testdata.sql)"
sqlplus C##JENKINS_FLAMINGO/jenkins_flamingo@192.168.1.11:1521/orcl <<< ${fladbversion}"
