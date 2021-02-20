#!/usr/bin/env bash
# check class file is java 8 == 52
set -eE
if [ $(javap -verbose -cp viewer-audit/target/classes/ nl.b3p.viewer.audit.LoggingServiceFactory | grep -c 'major version: 52') == 1 ]; then
  printf "\nOK: Java 8 classfile\n\n"
  exit 0
else
  printf "\nFAILED: Geen Java 8 classfile\n\n"
  exit 1
fi
