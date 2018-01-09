<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.1"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                xmlns:fo="http://www.w3.org/1999/XSL/Format" exclude-result-prefixes="fo">

    <xsl:import href="legend.xsl"/>

    <xsl:output method="xml" version="1.0" omit-xml-declaration="no" indent="yes"/>

    <xsl:include href="calc.xsl"/>
    <xsl:include href="styles.xsl"/>

    <xsl:param name="versionParam" select="'1.0'"/>

    <xsl:variable name="map-width-px" select="'940'"/>
    <xsl:variable name="map-height-px" select="'660'"/>

    <!-- See legend.xsl (does not currently affect size of other elements!) -->
    <xsl:variable name="legend-width-cm" select="5.6"/>
    <!-- See legend.xsl ('none', 'before', 'right') -->
    <xsl:variable name="legend-labels-pos" select="'before'"/>
    <xsl:variable name="legend-scale-images-same-ratio" select="true()"/>
 
    <!-- formatter -->
    <xsl:decimal-format name="MyFormat" decimal-separator="." grouping-separator=","
                        infinity="INFINITY" minus-sign="-" NaN="Not a Number" percent="%" per-mille="m"
                        zero-digit="0" digit="#" pattern-separator=";" />

    <!-- master set -->
    <xsl:template name="layout-master-set">
        <fo:layout-master-set>
        <fo:simple-page-master master-name="a3-liggend" page-height="297mm" page-width="420mm" margin-top="10mm" margin-bottom="10mm" margin-left="10mm" margin-right="10mm">
					<fo:region-body region-name="body" margin-bottom="10mm" margin-top="25mm"/>
					<fo:region-before region-name="before" extent="0mm"/>
					<fo:region-after region-name="after" extent="15mm"/>
				</fo:simple-page-master>
        </fo:layout-master-set>
    </xsl:template>

    <xsl:template match="info">
        <fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format" xmlns:xlink="http://www.w3.org/1999/xlink">
            <xsl:call-template name="layout-master-set"/>

            <fo:page-sequence master-reference="a3-liggend">
                  <fo:static-content flow-name="before">
 					<fo:list-block provisional-label-separation="5mm" provisional-distance-between-starts="340mm">
						<fo:list-item>
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
					<fo:list-block provisional-label-separation="5mm" provisional-distance-between-starts="60mm">
						<fo:list-item wrap-option="no-wrap">
							<fo:list-item-label end-indent="label-end()">
									<xsl:call-template name="info-block"/>
							</fo:list-item-label>
							<fo:list-item-body start-indent="body-start()">
									<xsl:call-template name="map-block"/>
							</fo:list-item-body>
						</fo:list-item>
					</fo:list-block> 
  
                </fo:flow>
            </fo:page-sequence>
        </fo:root>
    </xsl:template>


    <xsl:template name="info-block">
		<fo:block xsl:use-attribute-sets="default-font">
    	<fo:block>
          <xsl:call-template name="windrose">
               <xsl:with-param name="angle" select="angle"/>
               <xsl:with-param name="top" select="'0cm'"/>
               <xsl:with-param name="left" select="'4.0cm'"/>		
           </xsl:call-template>   
      </fo:block>
			<!-- create scalebar -->
 			<fo:block margin-top="5mm">
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
		 
		<fo:block xsl:use-attribute-sets="header-font">
				<xsl:text>legenda</xsl:text>
		</fo:block>
		<xsl:call-template name="legend" />
	   
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
                <fo:external-graphic src="{$map}" content-height="scale-to-fit" content-width="scale-to-fit" scaling="uniform" width="{$map-width-px}" height="{$map-height-px}" xsl:use-attribute-sets="simple-border"/>
            </fo:block>
    </xsl:template>

    <xsl:template name="disclaimer-block">
        <fo:block xsl:use-attribute-sets="disclaimer-font">
	         <fo:block>
	            <xsl:value-of select="remark"/>
	        </fo:block>
 	         <fo:block>
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
        </fo:block>
    </xsl:template>

    <xsl:template name="logo-block">
        <fo:block>
            <fo:external-graphic src="url('logo.png')" width="155px" height="55px"/>
        </fo:block>
    </xsl:template>

</xsl:stylesheet>
