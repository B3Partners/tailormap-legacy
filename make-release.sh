#!/bin/bash

FILES=(
	viewer/pom.xml 
	viewer-admin/pom.xml
	solr-commons/pom.xml
	viewer-commons/pom.xml
	viewer-config-persistence/pom.xml
	web-commons/pom.xml
)
function changeVersionInPOMS {
	
	CURVERSION=$VERSION

	if [ ! -z  "$1" ]; then
		CURVERSION=$VERSION-SNAPSHOT
	fi
	echo "Verander versienummers in POMS naar versie" $CURVERSION
	xmlstarlet ed --pf --inplace -u "/_:project/_:version" -v $CURVERSION pom.xml
	for i in ${FILES[@]}; do
		echo "file:"${i}:
		xmlstarlet ed --pf --inplace -u "/_:project/_:parent/_:version" -v $CURVERSION ${i}
	done

	echo "Einde veranderen POMS";
}

ZIP=false;

if [ -z "$1" ]; then
	ZIP=$1
fi

if [ -z "$2" ]; then
	echo "Variabelen niet geset, stopt.	"
	exit 1;
fi
VERSION=$2;
echo "**********************************************************************"
echo ""
echo ""
echo "Release maken voor flamingo, versie "$VERSION


echo "Purge possible previous attempts..."
git checkout master
git branch -d release/v$VERSION
git branch -d v$VERSION
git push origin --delete release/v$VERSION
git push origin --delete v$VERSION
git reset HEAD --hard
rm *.war 
rm *.zip

echo "Start release:"
git checkout master
git pull --rebase

echo "Maak release branch:"
git checkout -b release/v$VERSION
git push origin release/v$VERSION
changeVersionInPOMS
git commit -am "Version number updated"
git push --set-upstream origin release/v$VERSION

echo "Maak release tag:"
git tag -f -a v$VERSION -m "Release for Flamingo 4 Geo-CMS version $VERSION"
git checkout v$VERSION
git push  --set-upstream origin v$VERSION

echo "Update de master met nieuwste versienummers:"
git checkout master
changeVersionInPOMS true
git commit -am "Version number updated"
git push

echo "Checkout release branch en bouw release:"
git checkout release/v$VERSION
mvn clean install
cp viewer/target/*.war viewer.war
cp viewer-admin/target/*.war viewer-admin.war
if [ $ZIP ]; then
	zip flamingo.zip viewer*war
fi

echo "Maak huidige branch de master:"
git checkout master

echo "einde"

