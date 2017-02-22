#!/bin/bash
# look for "INSERT INTO metadata (id"... in ./viewer-config-persistence/src/test/resources/nl/b3p/viewer/util/testdata.sql
#  to get the current database version to be inserted
#
fladbversion=$(grep 'INSERT INTO metadata (id' ./viewer-config-persistence/src/test/resources/nl/b3p/viewer/util/testdata.sql)"
sqlplus jenkins_flamingo/jenkins_flamingo@192.168.1.41:1521/DB01 <<< ${fladbversion}"
