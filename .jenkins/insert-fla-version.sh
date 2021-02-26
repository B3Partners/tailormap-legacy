#!/bin/bash
# look for "INSERT INTO metadata (id"... in ./viewer-config-persistence/src/test/resources/nl/b3p/viewer/util/testdata.sql
#  to get the current database version to be inserted
#
fladbversion=$(grep 'INSERT INTO metadata (id' ./viewer-config-persistence/src/test/resources/nl/b3p/viewer/util/testdata.sql)"
sqlplus JENKINS_FLAMINGO/jenkins_flamingo@127.0.0.1:15211/XE <<< ${fladbversion}"
