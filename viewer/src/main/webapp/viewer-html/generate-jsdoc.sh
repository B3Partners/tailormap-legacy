#!/bin/bash
# $Id$
#
# Script om met jsdoc-toolkit documentatie te genereren. 
# Zie http://code.google.com/p/jsdoc-toolkit/
#
cd $( dirname "$0" )
/opt/jsdoc-toolkit/jsrun.sh -a -r -t=/opt/jsdoc-toolkit/templates/jsdoc -d=jsdoc -v -E="jquery" -E="swfobject" -p -s .

