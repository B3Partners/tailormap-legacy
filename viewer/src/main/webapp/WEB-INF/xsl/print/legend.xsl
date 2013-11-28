<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:fo="http://www.w3.org/1999/XSL/Format">
	<!-- dependant on global variables:
		legend-width-cm: integer, column block width in cm
        legend-labels-pos: 'none', 'above' or 'right'
		legend-scale-images-same-ratio: true() or false()
	-->
	<xsl:template name="legend">
		<fo:block-container margin-top="0.1cm" width="{concat($legend-width-cm,'cm')}" xsl:use-attribute-sets="legend-attributes">

			<xsl:variable name="max-width">
				<xsl:for-each select="legendUrls/legendUrl/legendParts/legendPart">
					<xsl:sort order="descending" data-type="number" select="width"/>
					<xsl:if test="position() = 1">
						<xsl:value-of select="width"/>
					</xsl:if>
				</xsl:for-each>
			</xsl:variable>
			
			<xsl:for-each select="legendUrls/legendUrl[legendParts/legendPart]">
				<xsl:for-each select="legendParts/legendPart">
					<xsl:if test="$legend-labels-pos = 'before'">
						<fo:block>
							<xsl:value-of select="label"/>
						</fo:block>
					</xsl:if>
					<fo:block margin-left="0.0cm" margin-top="0.0cm" font-size="10pt" text-align-last="justify">
						<fo:external-graphic >
							<xsl:attribute name="src">
								<xsl:value-of select="url"/>
							</xsl:attribute>
							<xsl:if test="$legend-scale-images-same-ratio and width">
								<xsl:variable name="ratio" select="width div $max-width"/>
								<xsl:attribute name="content-width"><xsl:value-of select="$legend-width-cm * $ratio"/>cm</xsl:attribute>
							</xsl:if>
						</fo:external-graphic>
						<xsl:if test="$legend-labels-pos = 'right'">
							<fo:leader leader-pattern="space" />
							<xsl:value-of select="label"/>                        
						</xsl:if>
					</fo:block>
				</xsl:for-each>
			</xsl:for-each>
		</fo:block-container>		
	</xsl:template>
</xsl:stylesheet>
