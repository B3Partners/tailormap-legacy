<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:template match="/">
        <root>
            <featureSources>
                <xsl:for-each select="//featureSource">
                    <featureSource>
                        <id>
                            <xsl:value-of select="id"/>
                        </id>
                        <name>
                            <xsl:value-of select="name"/>
                        </name>
                        <protocol>
                            <xsl:value-of select="protocol"/>
                        </protocol>
                        <url>
                            <xsl:value-of select="url"/>
                        </url>
                        <xsl:for-each select="featuretypes/featureType">
                            <featureType>
                                <id>
                                    <xsl:value-of select="id"/>
                                </id>
                                <name>
                                    <xsl:value-of select="name"/>
                                </name>
                                <description>
                                    <xsl:value-of select="description"/>
                                </description>
                                <xsl:call-template name="find-appLayers">
                                    <xsl:with-param name="featureType" select="."/>
                                </xsl:call-template>
                            </featureType>
                        </xsl:for-each>
                    </featureSource>
                </xsl:for-each>
            </featureSources>
        </root>
    </xsl:template>
    <xsl:template name="find-appLayers">
        <xsl:param name="featureType"/>
        <applications>
            <xsl:for-each select="/root/applications/application[services//featureTypeId=$featureType/id]">
                <xsl:variable name="application" select="."/>
                <application>
                    <id>
                        <xsl:value-of select="id"/>
                    </id>
                    <name>
                        <xsl:value-of select="name"/>
                    </name>
                    <version>
                        <xsl:value-of select="version"/>
                    </version>
                    <layers>
                        <xsl:for-each select="services//layers/*[featureTypeId=$featureType/id]">
                            <layer>
                                <serviceId>
                                    <xsl:value-of select="serviceId"/>
                                </serviceId>
                                <name>
                                    <xsl:value-of select="name"/>
                                </name>
                                <xsl:variable name="layerName">
                                    <xsl:value-of select="name"/>
                                </xsl:variable>
                                <xsl:variable name="serviceId">
                                    <xsl:value-of select="serviceId"/>
                                </xsl:variable>							
                                <applayers>
                                    <xsl:for-each select="$application/appLayers//*[layerName=$layerName and serviceId=$serviceId]">
                                        <applayer>
                                            <id>
                                                <xsl:value-of select="id"/>
                                            </id>
                                            <alias>
                                                <xsl:value-of select="alias"/>
                                            </alias>
                                        </applayer>
                                    </xsl:for-each>
                                </applayers>
                            </layer>
                        </xsl:for-each>
                    </layers>
                </application>
            </xsl:for-each>
        </applications>
    </xsl:template>
</xsl:stylesheet>
