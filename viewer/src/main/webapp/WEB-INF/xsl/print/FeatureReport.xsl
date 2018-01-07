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

    <!-- master set -->
    <xsl:template name="layout-master-set">
        <fo:layout-master-set>
				<fo:simple-page-master master-name="a4-staand" page-height="297mm" page-width="210mm" margin-top="10mm" margin-bottom="10mm" margin-left="10mm" margin-right="10mm">
					<fo:region-body region-name="body" margin-bottom="10mm" margin-top="25mm"/>
					<fo:region-before region-name="before" extent="0mm"/>
					<fo:region-after region-name="after" extent="0mm"/>
				</fo:simple-page-master>
        </fo:layout-master-set>
    </xsl:template>

    <xsl:template match="info">
        <fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format" xmlns:xlink="http://www.w3.org/1999/xlink">
            <xsl:call-template name="layout-master-set"/>

            <fo:page-sequence master-reference="a4-staand">
                  <fo:static-content flow-name="before">
 					<fo:list-block provisional-label-separation="5mm" provisional-distance-between-starts="132mm">
						<fo:list-item wrap-option="no-wrap">
							<fo:list-item-label end-indent="label-end()">
								<fo:block xsl:use-attribute-sets="title-font">
									<xsl:value-of select="title"/>
								</fo:block>
								<fo:block xsl:use-attribute-sets="default-font">
									<xsl:value-of select="subtitle"/>
								</fo:block>
									</fo:list-item-label>
							<fo:list-item-body start-indent="body-start()">
									<xsl:call-template name="logo-block"/>
							</fo:list-item-body>
						</fo:list-item>
					</fo:list-block> 
                </fo:static-content>

                 <fo:static-content flow-name="after">
                    <fo:block-container overflow="hidden">
                        <xsl:call-template name="disclaimer-block"/>
                   </fo:block-container>
               </fo:static-content>
               
               <fo:flow flow-name="body">               
					<fo:list-block provisional-label-separation="5mm" provisional-distance-between-starts="132mm">
						<fo:list-item wrap-option="no-wrap">
							<fo:list-item-label end-indent="label-end()">
									<xsl:call-template name="map-block"/>
			
									<!-- attribute tables  -->
									<xsl:for-each select="extra/info[@classname='feature']/root">
										<fo:block xsl:use-attribute-sets="header-font">Geselecteerd Object</fo:block>
										<xsl:call-template name="table-2column"/>
									</xsl:for-each>
							 
							</fo:list-item-label>
							<fo:list-item-body start-indent="body-start()">
									<xsl:call-template name="info-block"/>
							</fo:list-item-body>
						</fo:list-item>
					</fo:list-block> 
  
					<xsl:for-each select="extra/info[@classname='related']/root">
						<fo:block xsl:use-attribute-sets="header-font">
							<xsl:value-of select="ancestor::info[1]/@componentname" />
						</fo:block>
						<xsl:call-template name="table-related" />
					</xsl:for-each>

					<xsl:if test="count(//extra/info[@classname='related']) = 0">
						<fo:block xsl:use-attribute-sets="default-font">
							<xsl:text>Geen gerelateerde data gevonden</xsl:text>
						</fo:block>
					</xsl:if>
                </fo:flow>
            </fo:page-sequence>
        </fo:root>
    </xsl:template>


    <xsl:template name="info-block">
		<fo:block xsl:use-attribute-sets="default-font">
			<!-- create scalebar -->
			<fo:block>
				<xsl:text>schaal</xsl:text>
			</fo:block>

			<fo:block>
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
		 
		<xsl:call-template name="legend" />
		<fo:block xsl:use-attribute-sets="default-font">
				<xsl:text>legenda</xsl:text>
		</fo:block>
	   
		<!-- overzichtskaart
		<xsl:call-template name="overview-block">
				<xsl:with-param name="width" select="'112'" />
				<xsl:with-param name="height" select="'80'" />
				<xsl:with-param name="width" select="'112px'" />
				<xsl:with-param name="height" select="'80px'" />
		</xsl:call-template>
		-->
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

            <fo:block>
                <fo:external-graphic src="{$map}" content-height="scale-to-fit" content-width="scale-to-fit" scaling="uniform" width="{$map-width-px}" height="{$map-height-px}"/>
            </fo:block>
    </xsl:template>

    <xsl:template name="disclaimer-block">
        <fo:block xsl:use-attribute-sets="disclaimer-font">
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
            <fo:external-graphic src="url('b3p_logo.png')" width="155px" height="55px"/>
        </fo:block>
    </xsl:template>

    <xsl:template name="table-2column">
        <!-- create a simple 2-column table, width can be given in mm for either column, default is 50 -->
        <xsl:param name="tWidthLeft">65</xsl:param>
        <xsl:param name="tWidthRight">65</xsl:param>
        <fo:block xsl:use-attribute-sets="default-font">
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
                <fo:block xsl:use-attribute-sets="default-font">
                    <xsl:variable name="numOfCols" select="colCount" as="xsl:integer"/>
                    <xsl:variable name="numOfrows" select="rowCount" as="xsl:integer"/>
					
                    <fo:table table-layout="fixed" inline-progression-dimension="auto">
                        <fo:table-header xsl:use-attribute-sets="table-header-font">
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
                <fo:block xsl:use-attribute-sets="disclaimer-font">
                    <xsl:value-of select="moreMessage" />
                </fo:block>
            </xsl:when>
            <xsl:otherwise>
                <fo:block xsl:use-attribute-sets="disclaimer-font">
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
