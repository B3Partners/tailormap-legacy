#!/usr/bin/env bash
# check of class file is java 8 == 52
set -eE
set _exitCode=0
for clazz in 'viewer-audit/target/classes/ nl.b3p.viewer.audit.AuditMessageObject' \
            'viewer/target/classes/ nl.b3p.viewer.util.FlamingoCQL' \
            'viewer-commons/target/classes/ nl.b3p.i18n.LocalizableActionBean' \
            'web-commons/target/classes/ nl.b3p.web.stripes.ErrorMessageResolution' \
            'viewer-admin/target/classes/ nl.b3p.viewer.admin.stripes.ApplicationActionBean'
do
  testvalues=($clazz)
  printf "\nControleer classfile versie van ${testvalues[1]} in ${testvalues[0]}."
  if [ $(javap -verbose -cp ${testvalues[0]} ${testvalues[1]} | grep -c 'major version: 52') == 1 ]; then
    printf "\nOK: ${testvalues[1]} is een Java 8 classfile.\n"
  else
    printf "\nFAILED: ${testvalues[1]} is geen Java 8 classfile.\n"
    _exitCode=1
    _msg=' niet'
  fi
done

printf "\nControle$_msg succesvol afgerond.\n\n"
exit $_exitCode
