#!/usr/bin/env bash
# check of class file is java 8 == 52
set -eE
set _exitCode=0

# van iedere module 1 classfile testen
for clazz in 'form/target/classes/ nl.b3p.gbi.converter.Formulier' \
            'solr-commons/target/classes/ nl.b3p.viewer.solr.SolrUpdateJob' \
            'viewer/target/classes/ nl.b3p.viewer.util.FlamingoCQL' \
            'viewer-admin/target/classes/ nl.b3p.viewer.admin.stripes.ApplicationActionBean' \
            'viewer-audit/target/classes/ nl.b3p.viewer.audit.LoggingServiceFactory' \
            'viewer-commons/target/classes/ nl.b3p.i18n.LocalizableActionBean' \
            'viewer-config-persistence/target/classes/ nl.b3p.viewer.config.security.User' \
            'web-commons/target/classes/ nl.b3p.web.stripes.ErrorMessageResolution'

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