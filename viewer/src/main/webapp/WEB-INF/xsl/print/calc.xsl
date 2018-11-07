<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.1" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:fo="http://www.w3.org/1999/XSL/Format" 
	xmlns:fox="http://xmlgraphics.apache.org/fop/extensions"
	xmlns:svg="http://www.w3.org/2000/svg" exclude-result-prefixes="fo">
    <xsl:output method="xml" version="1.0" omit-xml-declaration="no" indent="yes"/>

    <!-- berekent de bepaalt van de kaart indien opgegeven bij kaart, globaal opgegeven bij template
		of raadt de schaal op basis van quality (werkt alleen indien niet aangepast -->
    <xsl:template name="calc-local-scale">
         <xsl:param name="bbox"/>
        <xsl:param name="scale"/>
        <xsl:param name="quality"/>
			<xsl:choose>
				<xsl:when test="$scale"><xsl:value-of select="$scale"/></xsl:when>
				<xsl:when test="$global-scale"><xsl:value-of select="$global-scale"/></xsl:when>
				<xsl:otherwise>
					<xsl:call-template name="guess-scale">
						<xsl:with-param name="bbox" select="$bbox" />
						<xsl:with-param name="quality" select="$quality" />
					</xsl:call-template>
				</xsl:otherwise>
			</xsl:choose>
    </xsl:template>

    <xsl:template name="guess-scale">
        <xsl:param name="bbox"/>
        <xsl:param name="quality"/>
        <xsl:variable name="xmin" select="substring-before($bbox, ',')"/>
        <xsl:variable name="bbox1" select="substring-after($bbox, ',')"/>
        <xsl:variable name="bbox2" select="substring-after($bbox1, ',')"/>
        <xsl:variable name="xmax" select="substring-before($bbox2, ',')"/>
        <xsl:variable name="bbox-width-m" select="$xmax -$xmin"/>
        <!-- omrekening van pixels naar mm -->
        <xsl:variable name="screen-width-mm" select="$quality div $ppm"/>
		 		<xsl:value-of select="$bbox-width-m * 1000 div $screen-width-mm"/>
	</xsl:template>

    <!-- berekent nieuwe bbox indien verhouding hoogte/breedte van kaart op scherm
    anders is dan verhouding van kaart in template, probeert schaal gelijk te houden -->
    <xsl:template name="correct-bbox">
        <xsl:param name="bbox"/>
        <xsl:param name="scale"/>

        <xsl:variable name="xmin" select="substring-before($bbox, ',')"/>
        <xsl:variable name="bbox1" select="substring-after($bbox, ',')"/>
        <xsl:variable name="ymin" select="substring-before($bbox1, ',')"/>
        <xsl:variable name="bbox2" select="substring-after($bbox1, ',')"/>
        <xsl:variable name="xmax" select="substring-before($bbox2, ',')"/>
        <xsl:variable name="ymax" select="substring-after($bbox2, ',')"/>
		<xsl:call-template name="create-bbox">
			<xsl:with-param name="xmin" select="$xmin"/>
			<xsl:with-param name="ymin" select="$ymin"/>
			<xsl:with-param name="xmax" select="$xmax"/>
			<xsl:with-param name="ymax" select="$ymax"/>
			<xsl:with-param name="bbox-width-m-corrected" select="($map-width-px div $ppm) * ($scale div 1000)"/>
			<xsl:with-param name="bbox-height-m-corrected" select="($map-height-px div $ppm) * ($scale div 1000)"/>
		</xsl:call-template>
    </xsl:template>
    
    <xsl:template name="create-bbox">
        <xsl:param name="xmin"/>
        <xsl:param name="ymin"/>
        <xsl:param name="xmax"/>
        <xsl:param name="ymax"/>
		<xsl:param name="bbox-width-m-corrected"/>
		<xsl:param name="bbox-height-m-corrected"/>
        <xsl:variable name="xmid" select="($xmin + $xmax) div 2"/>
        <xsl:variable name="ymid" select="($ymin + $ymax) div 2"/>
		<xsl:value-of select="$xmid - ($bbox-width-m-corrected div 2)"/>
		<xsl:text>,</xsl:text>
		<xsl:value-of select="$ymid - ($bbox-height-m-corrected div 2)"/>
		<xsl:text>,</xsl:text>
		<xsl:value-of select="$xmid + ($bbox-width-m-corrected div 2)"/>
		<xsl:text>,</xsl:text>
		<xsl:value-of select="$ymid + ($bbox-height-m-corrected div 2)"/>
    </xsl:template>
    	
<!-- berekent en tekent de schaalstok, houdt rekening met echte schaal op kaart -->
    <xsl:template name="calc-scale">
        <xsl:param name="m-width"/>
        <xsl:param name="px-width"/>
        <xsl:variable name="scale-label">
            <xsl:call-template name="calc-scale-m">
                <xsl:with-param name="width-m" select="$m-width"/>
                <xsl:with-param name="width-px" select="$px-width"/>
            </xsl:call-template>
        </xsl:variable>
        <xsl:variable name="scale-width">
            <xsl:call-template name="calc-scale-px">
                <xsl:with-param name="width-m" select="$m-width"/>
                <xsl:with-param name="width-px" select="$px-width"/>
            </xsl:call-template>
        </xsl:variable>
        <xsl:variable name="scale-unit">
            <xsl:choose>
                <xsl:when test="$scale-label &gt;= 1000">
                    <xsl:text>km</xsl:text>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:text>m</xsl:text>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="scale-label-corrected">
            <xsl:choose>
                <xsl:when test="$scale-label &gt;= 1000">
                    <xsl:value-of select="format-number($scale-label div 1000,'0','MyFormat')"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="format-number($scale-label,'0','MyFormat')"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:call-template name="create-scale">
            <xsl:with-param name="width" select="$scale-width"/>
            <xsl:with-param name="label" select="$scale-label-corrected"/>
            <xsl:with-param name="unit" select="$scale-unit"/>
        </xsl:call-template>
    </xsl:template>

<!-- verkleint iteratief waarde door delen met 10 naar waarde tussen 0 en 1 -->
    <xsl:template name="strip-zeros">
        <xsl:param name="value"/>
        <xsl:choose>
            <xsl:when test="$value >= 10">
                <xsl:call-template name="strip-zeros">
                    <xsl:with-param name="value" select="$value div 10"/>
                </xsl:call-template>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="$value"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

<!-- berekent de lengte van een segment van de schaalbalk in meters -->
    <xsl:template name="calc-scale-m">
        <xsl:param name="width-m" select="'100000'"/>
        <xsl:param name="width-px" select="'700'"/>
        <xsl:variable name="screen-scale" select="$width-px div $width-m"/>
        <xsl:variable name="tmp-length-guess" select="20 div $screen-scale"/>
        <xsl:variable name="scale-length-guess" select="$tmp-length-guess"/>
        <xsl:variable name="tmp-length">
            <xsl:call-template name="strip-zeros">
                <xsl:with-param name="value" select="$tmp-length-guess"/>
            </xsl:call-template>
        </xsl:variable>

    <!-- lengte van schaalbalk in meters -->
        <xsl:variable name="tmp-length-rounded" select="format-number($tmp-length,'0','MyFormat')"/>
        <xsl:choose>
            <xsl:when test="$tmp-length-rounded > $tmp-length">
                <xsl:value-of select="$scale-length-guess * $tmp-length-rounded div $tmp-length"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="$scale-length-guess * ($tmp-length-rounded + 1) div $tmp-length"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

<!-- berekent de lengte van een segment van de schaalbalk in pixels -->
    <xsl:template name="calc-scale-px">
        <xsl:param name="width-m"/>
        <xsl:param name="width-px"/>
        <xsl:variable name="screen-scale" select="$width-px div $width-m"/>
        <xsl:variable name="scale-length">
            <xsl:call-template name="calc-scale-m">
                <xsl:with-param name="width-m" select="$width-m"/>
                <xsl:with-param name="width-px" select="$width-px"/>
            </xsl:call-template>
        </xsl:variable>

    <!-- lengte in pixels van schaalbalk -->
        <xsl:value-of select="$scale-length*$screen-scale"/>
    </xsl:template>

<!-- tekent schaalstok dmv svg -->
    <xsl:template name="create-scale">
        <xsl:param name="width"/>
        <xsl:param name="label"/>
        <xsl:param name="unit"/>
        <xsl:variable name="text-height" select="'6'"/>
        <xsl:variable name="text-offset" select="'2'"/>
        <xsl:variable name="scale-top" select="'4'"/>
        <xsl:variable name="scale-left" select="'0'"/>
        <xsl:variable name="scale-height" select="'3'"/>
        <xsl:variable name="scale-segment-width" select="$width"/>
        <xsl:variable name="dash-height" select="'2'"/>
        <xsl:variable name="scale-1">
            <xsl:value-of select="$text-offset +$scale-left"/>
            <xsl:text>,</xsl:text>
            <xsl:value-of select="$text-height + $scale-top"/>
            <xsl:text> </xsl:text>
            <xsl:value-of select="$text-offset +$scale-left + $scale-segment-width"/>
            <xsl:text>,</xsl:text>
            <xsl:value-of select="$text-height + $scale-top"/>
            <xsl:text> </xsl:text>
            <xsl:value-of select="$text-offset +$scale-left + $scale-segment-width"/>
            <xsl:text>,</xsl:text>
            <xsl:value-of select="$text-height + $scale-top + $scale-height"/>
            <xsl:text> </xsl:text>
            <xsl:value-of select="$text-offset +$scale-left"/>
            <xsl:text>,</xsl:text>
            <xsl:value-of select="$text-height + $scale-top + $scale-height"/>
            <xsl:text> </xsl:text>
            <xsl:value-of select="$text-offset +$scale-left"/>
            <xsl:text>,</xsl:text>
            <xsl:value-of select="$text-height + $scale-top"/>
            <xsl:text> </xsl:text>
        </xsl:variable>
        <xsl:variable name="scale-2">
            <xsl:value-of select="$text-offset +$scale-left + $scale-segment-width"/>
            <xsl:text>,</xsl:text>
            <xsl:value-of select="$text-height + $scale-top"/>
            <xsl:text> </xsl:text>
            <xsl:value-of select="$text-offset +$scale-left + 2*$scale-segment-width"/>
            <xsl:text>,</xsl:text>
            <xsl:value-of select="$text-height + $scale-top"/>
            <xsl:text> </xsl:text>
            <xsl:value-of select="$text-offset +$scale-left + 2*$scale-segment-width"/>
            <xsl:text>,</xsl:text>
            <xsl:value-of select="$text-height + $scale-top + $scale-height"/>
            <xsl:text> </xsl:text>
            <xsl:value-of select="$text-offset +$scale-left + $scale-segment-width"/>
            <xsl:text>,</xsl:text>
            <xsl:value-of select="$text-height + $scale-top + $scale-height"/>
            <xsl:text> </xsl:text>
            <xsl:value-of select="$text-offset +$scale-left + $scale-segment-width"/>
            <xsl:text>,</xsl:text>
            <xsl:value-of select="$text-height + $scale-top"/>
            <xsl:text> </xsl:text>
        </xsl:variable>
        <xsl:variable name="scale-3">
            <xsl:value-of select="$text-offset +$scale-left + 2*$scale-segment-width"/>
            <xsl:text>,</xsl:text>
            <xsl:value-of select="$text-height + $scale-top"/>
            <xsl:text> </xsl:text>
            <xsl:value-of select="$text-offset +$scale-left + 3*$scale-segment-width"/>
            <xsl:text>,</xsl:text>
            <xsl:value-of select="$text-height + $scale-top"/>
            <xsl:text> </xsl:text>
            <xsl:value-of select="$text-offset +$scale-left + 3*$scale-segment-width"/>
            <xsl:text>,</xsl:text>
            <xsl:value-of select="$text-height + $scale-top + $scale-height"/>
            <xsl:text> </xsl:text>
            <xsl:value-of select="$text-offset +$scale-left + 2*$scale-segment-width"/>
            <xsl:text>,</xsl:text>
            <xsl:value-of select="$text-height + $scale-top + $scale-height"/>
            <xsl:text> </xsl:text>
            <xsl:value-of select="$text-offset +$scale-left + 2*$scale-segment-width"/>
            <xsl:text>,</xsl:text>
            <xsl:value-of select="$text-height + $scale-top"/>
            <xsl:text> </xsl:text>
        </xsl:variable>

        <fo:instream-foreign-object>
            <svg xmlns="http://www.w3.org/2000/svg" width="5.0cm" height="0.6cm" preserveAspectRatio="xMaxYMax meet">
                <g font-size="8pt">
                    <polygon points="{$scale-1}" fill="black" stroke="black" stroke-width="0.5"/>
                    <polygon points="{$scale-2}" fill="white" stroke="black" stroke-width="0.5"/>
                    <polygon points="{$scale-3}" fill="black" stroke="black" stroke-width="0.5"/>
                    <line x1="{$text-offset +$scale-left}" y1="{$text-height + $scale-top - $dash-height}" x2="{$text-offset +$scale-left}" y2="{$text-height + $scale-top}" stroke="black" stroke-width="0.5"/>
                    <line x1="{$text-offset +$scale-left + $scale-segment-width}" y1="{$text-height + $scale-top - $dash-height}" x2="{$text-offset +$scale-left + $scale-segment-width}" y2="{$text-height + $scale-top}" stroke="black" stroke-width="0.5"/>
                    <line x1="{$text-offset +$scale-left + 2*$scale-segment-width}" y1="{$text-height + $scale-top - $dash-height}" x2="{$text-offset +$scale-left + 2*$scale-segment-width}" y2="{$text-height + $scale-top}" stroke="black" stroke-width="0.5"/>
                    <line x1="{$text-offset +$scale-left + 3*$scale-segment-width}" y1="{$text-height + $scale-top - $dash-height}" x2="{$text-offset +$scale-left + 3*$scale-segment-width}" y2="{$text-height + $scale-top}" stroke="black" stroke-width="0.5"/>
                    <text x="{$scale-left}" y="{$text-height}">0</text>
                    <text x="{$scale-left + $scale-segment-width}" y="{$text-height}">
                        <xsl:value-of select="$label"/>
                    </text>
                    <text x="{$scale-left + 2*$scale-segment-width}" y="{$text-height}">
                        <xsl:value-of select="2*$label"/>
                    </text>
                    <text x="{$scale-left + 3*$scale-segment-width}" y="{$text-height}">
                        <xsl:value-of select="3*$label"/>
                        <xsl:value-of select="$unit"/>
                    </text>
                </g>
            </svg>
        </fo:instream-foreign-object>
    </xsl:template>
    <!-- wind rose template -->
    <xsl:template name="windrose">
        <xsl:param name="angle" select="0"/>
        <xsl:param name="width" select="'1.8cm'"/>
        <xsl:param name="height" select="'1.8cm'"/>
        <xsl:param name="top" select="'0cm'"/>
        <xsl:param name="left" select="'0cm'"/>		
        <xsl:param name="millipoints" select="58000"/>
        <fo:block-container fox:transform="translate({$millipoints},{$millipoints}) rotate({$angle}) translate(-{$millipoints}, -{$millipoints})" absolute-position="absolute" top="{$top}" left="{$left}" width="{$width}" height="{$height}">
            <fo:block >
                <fo:external-graphic width="{$width}" height="{$height}" content-height="scale-to-fit" content-width="scale-to-fit" src="NorthArrow_02.svg"/>
            </fo:block>
        </fo:block-container>
    </xsl:template>
    
    
    <xsl:template name="overview-block">
        <xsl:param name="width" select="'4cm'"/>
        <xsl:param name="height" select="'4cm'"/>
        <xsl:variable name="bbox-corrected">
            <xsl:call-template name="correct-bbox">
                <xsl:with-param name="bbox" select="bbox"/>
            </xsl:call-template>
        </xsl:variable>
        
        <xsl:if test="overviewUrl">
            <fo:block margin-left="0cm" margin-right="0cm">
                <xsl:variable name="overviewSrc">
                    <xsl:value-of select="overviewUrl"/>
                    <xsl:text>&amp;geom=</xsl:text>
                    <xsl:value-of select="$bbox-corrected"/>
                    <xsl:text>&amp;width=</xsl:text>
                    <xsl:value-of select="translate($width,'px', '')"/>
                    <xsl:text>&amp;height=</xsl:text>
                    <xsl:value-of select="translate($height,'px', '')"/>
                </xsl:variable>
                <fo:external-graphic src="url({$overviewSrc})" content-height="scale-to-fit" content-width="scale-to-fit" scaling="uniform" width="{$width}" height="{$height}"/>
            </fo:block>
        </xsl:if>
            
    </xsl:template>
</xsl:stylesheet>