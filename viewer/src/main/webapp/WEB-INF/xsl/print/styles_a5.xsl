<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.1" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:fo="http://www.w3.org/1999/XSL/Format" exclude-result-prefixes="fo">
    <xsl:output method="xml" version="1.0" omit-xml-declaration="no" indent="yes"/>
	
	<!-- styles -->
	<xsl:attribute-set name="title-font">
                <!--
		<xsl:attribute name="font-size">15pt</xsl:attribute>
		<xsl:attribute name="font-size">12pt</xsl:attribute>
		<xsl:attribute name="font-family">Helvetica</xsl:attribute>
		<xsl:attribute name="font-family">Arial</xsl:attribute>
                -->
		<xsl:attribute name="font-size">6pt</xsl:attribute>
		<xsl:attribute name="font-weight">bold</xsl:attribute>
		<xsl:attribute name="font-family">Helvetica</xsl:attribute>
		<xsl:attribute name="color">#000000</xsl:attribute>
	</xsl:attribute-set>

	<xsl:attribute-set name="default-font">
                <!--
    		<xsl:attribute name="font-size">10pt</xsl:attribute>
                -->
		<xsl:attribute name="font-size">5pt</xsl:attribute>
		<xsl:attribute name="color">#000000</xsl:attribute>
	</xsl:attribute-set>

        <xsl:attribute-set name="mapinfo-font">
		<xsl:attribute name="font-size">7pt</xsl:attribute>
		<xsl:attribute name="color">#000000</xsl:attribute>
	</xsl:attribute-set>
        
	<xsl:attribute-set name="disclaimer-font">
		<xsl:attribute name="font-size">5pt</xsl:attribute>
		<xsl:attribute name="color">#000000</xsl:attribute>
	</xsl:attribute-set>

	<xsl:attribute-set name="simple-border">
		<xsl:attribute name="border-color">#000000</xsl:attribute>
		<xsl:attribute name="border-style">solid</xsl:attribute>
		<xsl:attribute name="border-width">thin</xsl:attribute>
	</xsl:attribute-set>

	<xsl:attribute-set name="column-block">
		<xsl:attribute name="position">absolute</xsl:attribute>
		<xsl:attribute name="top">0cm</xsl:attribute>
		<xsl:attribute name="left">0cm</xsl:attribute>
	</xsl:attribute-set>

	<xsl:attribute-set name="column-block-border" use-attribute-sets="simple-border">
		<xsl:attribute name="position">absolute</xsl:attribute>
		<xsl:attribute name="top">0cm</xsl:attribute>
		<xsl:attribute name="left">0cm</xsl:attribute>
	</xsl:attribute-set>

</xsl:stylesheet>