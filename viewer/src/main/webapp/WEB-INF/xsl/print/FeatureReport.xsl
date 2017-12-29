<?xml version="1.0" encoding="UTF-8"?>
<!--
    Document   : feature report template
    Created on : may 30, 2017
    Author     : mark
    Description:
        based off A4_Portrait
-->
<xsl:stylesheet version="1.1"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                xmlns:fo="http://www.w3.org/1999/XSL/Format" exclude-result-prefixes="fo">

    <xsl:import href="legend.xsl"/>

    <xsl:output method="xml" version="1.0" omit-xml-declaration="no" indent="yes"/>

    <xsl:include href="calc.xsl"/>
    <xsl:include href="styles.xsl"/>

    <xsl:param name="versionParam" select="'1.0'"/>

    <xsl:variable name="map-width-px" select="'368'"/>
    <xsl:variable name="map-height-px" select="'220'"/>

    <!-- See legend.xsl (does not currently affect size of other elements!) -->
    <xsl:variable name="legend-width-cm" select="3.1"/>
    <!-- See legend.xsl ('none', 'before', 'right') -->
    <xsl:variable name="legend-labels-pos" select="'before'"/>
    <xsl:variable name="legend-scale-images-same-ratio" select="true()"/>
    <xsl:attribute-set name="legend-attributes">
        <xsl:attribute name="font-size">9pt</xsl:attribute>
    </xsl:attribute-set>

    <!-- formatter -->
    <xsl:decimal-format name="MyFormat" decimal-separator="." grouping-separator=","
                        infinity="INFINITY" minus-sign="-" NaN="Not a Number" percent="%" per-mille="m"
                        zero-digit="0" digit="#" pattern-separator=";" />

    <xsl:attribute-set name="subtitle-font">
        <xsl:attribute name="font-size">11pt</xsl:attribute>
        <xsl:attribute name="color">#000066</xsl:attribute>
        <xsl:attribute name="margin-top">1mm</xsl:attribute>
    </xsl:attribute-set>

    <!-- master set -->
    <xsl:template name="layout-master-set">
        <fo:layout-master-set>
            <fo:simple-page-master master-name="a4-staand" page-height="297mm" page-width="210mm" margin-top="0.4cm" margin-bottom="0.4cm" margin-left="0.4cm" margin-right="0.4cm">
                <fo:region-body region-name="body"/>
            </fo:simple-page-master>
        </fo:layout-master-set>
    </xsl:template>

    <xsl:template match="info">
        <fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format" xmlns:xlink="http://www.w3.org/1999/xlink">
            <xsl:call-template name="layout-master-set"/>

            <fo:page-sequence master-reference="a4-staand">
                <fo:flow flow-name="body">

                    <fo:block-container width="13.1cm" height="1.5cm" top="0cm" left="0cm" background-color="#FFFFFF" xsl:use-attribute-sets="column-block">
                        <fo:block margin-left="0.2cm" margin-top="0.5cm" xsl:use-attribute-sets="title-font">
                            <xsl:value-of select="title"/>
                        </fo:block>
                    </fo:block-container>
                    

                    <fo:block-container width="13.1cm" height="0.75cm" top="1.6cm" left="0cm" background-color="#FFFFFF" xsl:use-attribute-sets="column-block">
                        <fo:block margin-left="0.2cm" margin-top="0.2cm" xsl:use-attribute-sets="subtitle-font">
                            <xsl:value-of select="subtitle"/>
                        </fo:block>
                    </fo:block-container>

                    <fo:block-container width="6.95cm" height="1.75cm" top="0.5cm" left="13.2cm" background-color="#FFFFFF" overflow="hidden" xsl:use-attribute-sets="column-block">
                         <xsl:call-template name="logo-block"/>
                    </fo:block-container>
                    
                    <fo:block-container width="13.1cm" height="7.9cm" top="2.6cm" margin-top="0cm" margin-left="0cm" left="0cm" xsl:use-attribute-sets="column-block-border">
                        <xsl:call-template name="map-block"/>
                    </fo:block-container>

                    <fo:block-container width="6.95cm" height="13cm" top="2.6cm" left="13.2cm" overflow="hidden" xsl:use-attribute-sets="column-block-border">
                        <xsl:call-template name="info-block"/>
                    </fo:block-container>

                    <!-- attribute tables -->
                    <fo:block-container width="13.1cm" height="5.0cm" top="10.6cm" left="0cm" margin-left="0.1cm" overflow="hidden" xsl:use-attribute-sets="column-block-border">
                        <xsl:for-each select="extra/info[@classname='feature']/root">
                            <fo:block xsl:use-attribute-sets="subtitle-font">Geselecteerd Object</fo:block>
                            <xsl:call-template name="table-2column"/>
                        </xsl:for-each>
                    </fo:block-container>

                        <fo:block-container width="20.15cm" height="12.0cm" top="15.7cm" left="0cm" margin-left="0.1cm" overflow="hidden" xsl:use-attribute-sets="column-block-border">
                            <xsl:for-each select="extra/info[@classname='related']/root">
                                <fo:block xsl:use-attribute-sets="subtitle-font">
                                    <xsl:value-of select="ancestor::info[1]/@componentname" />
                                </fo:block>
                                <xsl:call-template name="table-related" />
                            </xsl:for-each>

                            <xsl:if test="count(//extra/info[@classname='related']) = 0">
                                <fo:block xsl:use-attribute-sets="subtitle-font">
                                    <xsl:text>Geen gerelateerde data gevonden</xsl:text>
                                </fo:block>
                            </xsl:if>
                        </fo:block-container>
                        
                    <fo:block-container width="20.15cm" height="1.0cm" top="27.8cm" left="0cm" margin-left="0.1cm" overflow="hidden" xsl:use-attribute-sets="column-block">
                        <xsl:call-template name="disclaimer-block"/>
                   </fo:block-container>

                </fo:flow>
            </fo:page-sequence>
        </fo:root>
    </xsl:template>


    <xsl:template name="info-block">
        <fo:block-container margin-left="0.2cm">
            <fo:block xsl:use-attribute-sets="default-font">
                <!-- create scalebar -->
                <fo:block margin-top="0.3cm" font-size="9pt">
                    <xsl:text>schaal</xsl:text>
                </fo:block>
	
                <fo:block margin-top="0.2cm">
                    <xsl:call-template name="calc-scale">
                        <xsl:with-param name="m-width">
                            <xsl:call-template name="calc-bbox-width-m-corrected">
                                <xsl:with-param name="bbox" select="bbox"/>
                            </xsl:call-template>
                        </xsl:with-param>
                        <xsl:with-param name="px-width" select="$map-width-px"/>
                    </xsl:call-template>
                </fo:block>
            </fo:block>
			 
            <fo:block-container margin-left="0.0cm" margin-top="0.2cm" width="6.5cm" height="11cm"  overflow="hidden">
                <xsl:call-template name="legend" />
                <fo:block>
                        <xsl:text></xsl:text>
                </fo:block>
            </fo:block-container>
		   
            <!-- overzichtskaart
            <fo:block-container width="4.0cm" height="2.9cm" top="1.6cm" left="13.2cm" margin-left="0cm" xsl:use-attribute-sets="column-block">
                    <xsl:call-template name="overview-block">
                            <xsl:with-param name="width" select="'112'" />
                            <xsl:with-param name="height" select="'80'" />
                            <xsl:with-param name="width" select="'112px'" />
                            <xsl:with-param name="height" select="'80px'" />
                    </xsl:call-template>
            </fo:block-container>
            -->
        </fo:block-container>
    </xsl:template>

    <!-- kaartje -->
    <xsl:template name="map-block">
        <xsl:variable name="bbox-corrected">
            <xsl:call-template name="correct-bbox">
                <xsl:with-param name="bbox" select="bbox" />
            </xsl:call-template>
        </xsl:variable>
        <xsl:variable name="px-ratio" select="format-number($map-height-px div $map-width-px,'0.##','MyFormat')" />
        <xsl:variable name="map-height-px-corrected" select="quality"/>
        <xsl:variable name="map-width-px-corrected" select="format-number(quality div $px-ratio,'0','MyFormat')"/>
        <xsl:variable name="map">
            <xsl:value-of select="imageUrl"/>
            <xsl:text>&amp;width=</xsl:text>
            <xsl:value-of select="$map-width-px-corrected"/>
            <xsl:text>&amp;height=</xsl:text>
            <xsl:value-of select="$map-height-px-corrected"/>
            <xsl:text>&amp;bbox=</xsl:text>
            <xsl:value-of select="$bbox-corrected"/>
        </xsl:variable>

        <fo:block-container margin-top="0cm" height="7cm" width="13cm" xsl:use-attribute-sets="column-block">
            <fo:block margin-left="0.05cm" margin-right="0.05cm">
                <fo:external-graphic src="{$map}" content-height="scale-to-fit" content-width="scale-to-fit" scaling="uniform" width="{$map-width-px}" height="{$map-height-px}"/>
            </fo:block>
        </fo:block-container>
    </xsl:template>

    <xsl:template name="disclaimer-block">
        <fo:block margin-left="0.2cm" margin-top="0.5cm" color="#000000" xsl:use-attribute-sets="disclaimer-font">
            <xsl:if test="username"> 
                <xsl:text>Auteur: </xsl:text>                    
                <xsl:value-of select="username"/>
                <xsl:text> - </xsl:text>
            </xsl:if>
            <xsl:text>Datum: </xsl:text>
            <xsl:value-of select="date"/>
            <xsl:text> - </xsl:text>
            <xsl:text>Aan deze kaart kunnen geen rechten worden ontleend.</xsl:text>
        </fo:block>
    </xsl:template>

    <xsl:template name="logo-block">
        <fo:block>
            <fo:external-graphic src="url('gouda_logo.png')" width="155px" height="55px"/>
        </fo:block>
    </xsl:template>

    <xsl:template name="table-2column">
        <!-- create a simple 2-column table, width can be given in mm for either column, default is 50 -->
        <xsl:param name="tWidthLeft">50</xsl:param>
        <xsl:param name="tWidthRight">50</xsl:param>
        <fo:block font-size="9pt">
            <fo:table table-layout="fixed" width="{$tWidthLeft + $tWidthRight}mm">
                <fo:table-column column-width="{$tWidthLeft}mm" />
                <fo:table-column column-width="{$tWidthRight}mm" />
                <fo:table-body>
                    <xsl:for-each select="*">
                        <xsl:sort select="local-name()" data-type="text"/>
                        <fo:table-row>
                            <fo:table-cell>
                                <fo:block>
                                    <xsl:call-template name="string-remove-underscores">
                                        <xsl:with-param name="text" select="local-name()" />
                                    </xsl:call-template>
                                </fo:block>
                            </fo:table-cell>
                            <fo:table-cell>
                                <fo:block>
                                    <xsl:value-of select="normalize-space(.)" />
                                </fo:block>
                            </fo:table-cell>
                        </fo:table-row>
                    </xsl:for-each>
                </fo:table-body>
            </fo:table>
        </fo:block>
    </xsl:template>

    <xsl:template name="table-related">
        <!-- create a simple multi-column table with auto sizing-->
        <xsl:choose>
            <xsl:when test="features">
                <fo:block font-size="9pt">
                    <xsl:variable name="numOfCols" select="colCount" as="xs:integer"/>
                    <xsl:variable name="numOfrows" select="rowCount" as="xs:integer"/>
					
                    <fo:table table-layout="fixed" inline-progression-dimension="auto">
                        <fo:table-header font-weight="bold">
                            <xsl:comment>header rij</xsl:comment>
                            <fo:table-row>
                                <xsl:for-each select="features/*">
                                    <xsl:if test ="true() and not(../following-sibling::features)">
                                        <fo:table-cell>
                                            <fo:block>
                                                <xsl:call-template name="string-remove-underscores">
                                                    <xsl:with-param name="text" select="local-name()" />
                                                </xsl:call-template>
                                            </fo:block>
                                        </fo:table-cell>
                                    </xsl:if>
                                </xsl:for-each>
                            </fo:table-row>
                        </fo:table-header>
                        <fo:table-body>
                            <xsl:for-each select="features">
                                <fo:table-row>
                                    <xsl:comment>data rij</xsl:comment>
                                    <xsl:for-each select="*">
                                        <fo:table-cell>
                                            <fo:block>
                                                <xsl:value-of select="normalize-space(.)" />
                                            </fo:block>
                                        </fo:table-cell>
                                    </xsl:for-each>
                                </fo:table-row>
                            </xsl:for-each>
                        </fo:table-body>

                    </fo:table>
                </fo:block>
                <fo:block font-size="10pt" font-style="italic">
                    <xsl:value-of select="moreMessage" />
                </fo:block>
            </xsl:when>
            <xsl:otherwise>
                <fo:block font-size="10pt" font-style="italic">
                    <xsl:value-of select="errorMessage" />
                </fo:block>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>


    <!-- strip a prefix like o_ from o_internet and remove any understcores from result -->
    <xsl:template name="string-remove-underscore-prefix">
        <xsl:param name="text" />
        <xsl:choose>
            <xsl:when test="contains(substring($text, 2,1), '_')" >
                <xsl:value-of select="translate(substring($text, 3),'_', ' ')" />
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="translate($text,'_', ' ')" />
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <!-- remove any understcores from result -->
    <xsl:template name="string-remove-underscores">
        <xsl:param name="text" />
        <xsl:value-of select="translate($text,'_', ' ')" />
    </xsl:template>
</xsl:stylesheet>
