<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.1" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:fo="http://www.w3.org/1999/XSL/Format" exclude-result-prefixes="fo">
    <xsl:output method="xml" version="1.0" omit-xml-declaration="no" indent="yes"/>
	
	<!-- styles -->
	<xsl:attribute-set name="title-font">
		<xsl:attribute name="font-size">15pt</xsl:attribute>
		<xsl:attribute name="color">#ffffff</xsl:attribute>
	</xsl:attribute-set>

	<xsl:attribute-set name="default-font">
		<xsl:attribute name="font-size">12pt</xsl:attribute>
		<xsl:attribute name="color">#000000</xsl:attribute>
	</xsl:attribute-set>
	<xsl:attribute-set name="disclaimer-font">
		<xsl:attribute name="font-size">6pt</xsl:attribute>
		<xsl:attribute name="color">#000000</xsl:attribute>
	</xsl:attribute-set>

	<xsl:attribute-set name="simple-border">
                <xsl:attribute name="border-top-color">#000000</xsl:attribute>
		<xsl:attribute name="border-top-style">solid</xsl:attribute>
		<xsl:attribute name="border-top-width">thin</xsl:attribute>
		<xsl:attribute name="border-bottom-color">#000000</xsl:attribute>
		<xsl:attribute name="border-bottom-style">solid</xsl:attribute>
		<xsl:attribute name="border-bottom-width">thin</xsl:attribute>
		<xsl:attribute name="border-left-color">#000000</xsl:attribute>
		<xsl:attribute name="border-left-style">solid</xsl:attribute>
		<xsl:attribute name="border-left-width">thin</xsl:attribute>
                <xsl:attribute name="border-right-color">#000000</xsl:attribute>
		<xsl:attribute name="border-right-style">solid</xsl:attribute>
		<xsl:attribute name="border-right-width">thin</xsl:attribute>
	</xsl:attribute-set>

	<xsl:attribute-set name="column-block">
		<xsl:attribute name="position">absolute</xsl:attribute>
		<xsl:attribute name="top">0cm</xsl:attribute>
		<xsl:attribute name="left">0cm</xsl:attribute>
		<xsl:attribute name="width">100%</xsl:attribute>
	</xsl:attribute-set>

	<xsl:attribute-set name="column-block-border" use-attribute-sets="simple-border">
		<xsl:attribute name="position">absolute</xsl:attribute>
		<xsl:attribute name="top">0cm</xsl:attribute>
		<xsl:attribute name="left">0cm</xsl:attribute>
		<xsl:attribute name="width">100%</xsl:attribute>
	</xsl:attribute-set>

</xsl:stylesheet>