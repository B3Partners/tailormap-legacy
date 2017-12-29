<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.1" 
xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
	xmlns:xlink="http://www.w3.org/1999/xlink"
	xmlns:fo="http://www.w3.org/1999/XSL/Format" 
	xmlns:fox="http://xmlgraphics.apache.org/fop/extensions"
	xmlns:svg="http://www.w3.org/2000/svg" exclude-result-prefixes="fo">

    <xsl:import href="legend.xsl"/>

    <xsl:output method="xml" version="1.0" omit-xml-declaration="no" indent="yes"/>

    <xsl:param name="versionParam" select="'1.0'"/>

    <xsl:variable name="map-width-px" select="'612'"/>
    <xsl:variable name="map-height-px" select="'457'"/>
    
    <!-- See legend.xsl (does not currently affect size of other elements!) -->
    <xsl:variable name="legend-width-cm" select="6.2"/>
    <!-- See legend.xsl ('none', 'before', 'right') -->
    <xsl:variable name="legend-labels-pos" select="'before'"/>
    <xsl:variable name="legend-scale-images-same-ratio" select="true()"/>
    <xsl:attribute-set name="legend-attributes">
		<xsl:attribute name="font-size">10pt</xsl:attribute>
    </xsl:attribute-set>    

    <!-- formatter -->
    <xsl:decimal-format name="MyFormat" decimal-separator="." grouping-separator=","
    infinity="INFINITY" minus-sign="-" NaN="Not a Number" percent="%" per-mille="m"
    zero-digit="0" digit="#" pattern-separator=";" />

    <!-- includes -->
    <xsl:include href="calc.xsl"/>
    <xsl:include href="styles.xsl"/>

    <!-- master set -->
    <xsl:template name="layout-master-set">
        <fo:layout-master-set>
            <fo:simple-page-master master-name="a4-liggend" page-height="210mm" page-width="297mm" margin-top="0.4cm" margin-bottom="0.4cm" margin-left="0.4cm" margin-right="0.4cm">
                <fo:region-body region-name="body"/>
            </fo:simple-page-master>
        </fo:layout-master-set>
    </xsl:template>

    <!-- root -->
    <xsl:template match="info">
        <fo:root>
            <xsl:call-template name="layout-master-set"/>
            
            <fo:page-sequence master-reference="a4-liggend">
                <fo:flow flow-name="body">
                    <fo:block-container width="28.4cm" height="1.5cm" top="0cm" left="0cm" background-color="#FFFFFF" overflow="hidden" xsl:use-attribute-sets="column-block">
                        <xsl:call-template name="title-block"/>
                    </fo:block-container>

                    <fo:block-container width="6.6cm" height="16.2cm" top="1.6cm" left="0cm" overflow="hidden" xsl:use-attribute-sets="column-block">
                        <xsl:call-template name="info-block"/>
                    </fo:block-container>

                    <fo:block-container width="21.7cm" height="16.2cm" top="1.6cm" left="6.7cm" xsl:use-attribute-sets="column-block-border">
                        <xsl:call-template name="map-block"/>
                    </fo:block-container>

                    <fo:block-container width="22.3cm" height="2.3cm" top="17.9cm" left="0cm" overflow="hidden" xsl:use-attribute-sets="column-block">
                        <xsl:call-template name="disclaimer-block"/>
                    </fo:block-container>

                    <fo:block-container width="6.0cm" height="2.3cm" top="17.9cm" left="22.4cm" overflow="hidden" xsl:use-attribute-sets="column-block">
                        <xsl:call-template name="logo-block"/>
                    </fo:block-container>
                </fo:flow>
            </fo:page-sequence>
        </fo:root>
    </xsl:template>    
    
    <!-- blocks -->
    <xsl:template name="title-block">        
        <fo:block margin-left="0.2cm" margin-top="0.1cm" xsl:use-attribute-sets="title-font">
            <xsl:value-of select="title"/>
        </fo:block>
        <fo:block margin-left="0.2cm" margin-top="0.2cm" xsl:use-attribute-sets="default-font">
            <xsl:value-of select="subtitle"/>
        </fo:block>
    </xsl:template>
    
    <xsl:template name="info-block">
        
        <fo:block-container>
            <fo:block-container margin-left="0.0cm" margin-right="0.0cm" margin-top="0.0cm" height="2.2cm">
                <fo:block text-align="right">
                    <xsl:call-template name="windrose">
                         <xsl:with-param name="angle" select="angle"/>
                         <xsl:with-param name="top" select="'0cm'"/>
                     </xsl:call-template>   
                </fo:block>
                <!-- create scalebar -->
                <fo:block margin-top="1.2cm" text-align="center">
                    <xsl:call-template name="calc-scale">
                        <xsl:with-param name="m-width">
                            <xsl:call-template name="calc-bbox-width-m-corrected">
                                <xsl:with-param name="bbox" select="bbox"/>
                            </xsl:call-template>
                        </xsl:with-param>
                        <xsl:with-param name="px-width" select="$map-width-px"/>
                    </xsl:call-template>
                </fo:block>
            </fo:block-container>
            
            <!-- overzichtskaart
            <fo:block-container margin-left="0.0cm" margin-top="0.2cm">
               <xsl:call-template name="overview-block">
                    <xsl:with-param name="width" select="'170px'"/>
                    <xsl:with-param name="height" select="'120px'"/>
                </xsl:call-template>
            </fo:block-container>
            -->
            <fo:block-container margin-left="0.1cm" margin-right="0.0cm" margin-top="0.0cm" height="13.9cm" overflow="hidden">
                <xsl:call-template name="legend" />
                <fo:block>
                        <xsl:text></xsl:text>
                </fo:block>
            </fo:block-container>
        </fo:block-container>
    
    </xsl:template>

    <!-- create map -->
    <xsl:template name="map-block">
            <xsl:variable name="bbox-corrected">
                <xsl:call-template name="correct-bbox">
                    <xsl:with-param name="bbox" select="bbox"/>
                </xsl:call-template>
            </xsl:variable>
            <xsl:variable name="px-ratio" select="format-number($map-height-px div $map-width-px,'0.##','MyFormat')" />
            <xsl:variable name="map-width-px-corrected" select="quality"/>
            <xsl:variable name="map-height-px-corrected" select="format-number(quality * $px-ratio,'0','MyFormat')"/>
            <xsl:variable name="map">
                <xsl:value-of select="imageUrl"/>
                <xsl:text>&amp;width=</xsl:text>
                <xsl:value-of select="$map-width-px-corrected"/>
                <xsl:text>&amp;height=</xsl:text>
                <xsl:value-of select="$map-height-px-corrected"/>
                <xsl:text>&amp;bbox=</xsl:text>
                <xsl:value-of select="$bbox-corrected"/>
            </xsl:variable>

            <fo:block-container margin-top="0.5cm" height="17cm" xsl:use-attribute-sets="column-block">
                <fo:block margin-left="0.05cm" margin-right="0.05cm">
                    <fo:external-graphic src="{$map}" content-height="scale-to-fit" content-width="scale-to-fit" scaling="uniform" width="{$map-width-px}" height="{$map-height-px}"/>
                </fo:block>
            </fo:block-container>
    </xsl:template>
    
    <xsl:template name="disclaimer-block">
         <fo:block margin-left="0.2cm" margin-top="0.5cm" color="#000000" xsl:use-attribute-sets="default-font">
            <xsl:value-of select="remark"/>
        </fo:block>
       <fo:block margin-left="0.2cm" margin-top="0.2cm" color="#000000" xsl:use-attribute-sets="disclaimer-font">
            <xsl:if test="username"> 
                <xsl:text>Auteur: </xsl:text>                    
                <xsl:value-of select="username"/>
                <xsl:text> - </xsl:text>
            </xsl:if>
            <xsl:text>Datum: </xsl:text>
            <xsl:value-of select="date"/>
            <xsl:text> - </xsl:text>
            <xsl:text>U bekijkt een demo ontwerp. Aan deze kaart kunnen geen rechten worden ontleend.</xsl:text>
        </fo:block>
    </xsl:template>

    <xsl:template name="logo-block">
        <fo:block>
            <fo:external-graphic src="url('b3p_logo.png')" width="231px" height="56px"/>
        </fo:block>
    </xsl:template>    
</xsl:stylesheet>