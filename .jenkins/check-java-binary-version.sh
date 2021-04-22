#!/usr/bin/env bash
# check of class file is java 8 == 52
set _exitCode=0

echo Controleer of alle .class bestanden Java 8 versie zijn...

while IFS= read -r -d '' clazz; do
	file "$clazz" | grep -v 'version 52.0'
	if [[ $? == 0 ]]; then
		_exitCode=1
		_msg=' niet'
	fi
done < <(find . -name "*.class" -print0)

printf "\nControle$_msg succesvol afgerond.\n\n"
exit $_exitCode
