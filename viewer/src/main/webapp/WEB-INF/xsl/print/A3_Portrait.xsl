<?xml version="1.0" encoding="utf-8" ?>
<xsl:stylesheet version="1.1" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:fo="http://www.w3.org/1999/XSL/Format" xmlns:fox="http://xmlgraphics.apache.org/fop/extensions" xmlns:svg="http://www.w3.org/2000/svg" exclude-result-prefixes="fo">
  <!-- Title Block.-->
  <xsl:template name="dbk_titleBk">
    <xsl:for-each select="extra/info[@componentname='dbk1']">
      <fo:block-container width="13.55cm" height="12.936cm" top="0cm" left="0cm" xsl:use-attribute-sets="column-block-border">
        <fo:block margin-top="0.1cm" margin-left="0.2cm" xsl:use-attribute-sets="title-font">Digitale bereikbaarheidskaart Utrecht</fo:block>
        <fo:block margin-top="0.2cm" margin-left="0.2cm" xsl:use-attribute-sets="default-font">
          <xsl:value-of select="identificatie"></xsl:value-of>
        </fo:block>
        <fo:block margin-top="0.2cm" margin-left="0.2cm" xsl:use-attribute-sets="default-font">Datum afdruk:
          <xsl:value-of select="date"></xsl:value-of>
        </fo:block>
        <fo:block margin-top="0.2cm" margin-left="0.2cm" xsl:use-attribute-sets="default-font">
          <xsl:value-of select="formeleNaam"></xsl:value-of>
        </fo:block>
        <fo:block margin-top="0.2cm" margin-left="0.2cm" xsl:use-attribute-sets="default-font">
          <fo:inline font-style="oblique">
            <xsl:value-of select="informeleNaam"></xsl:value-of>
          </fo:inline>
        </fo:block>
        <!-- Gebouwinformatie.-->
        <fo:block margin-top="0.2cm" margin-left="0.2cm" xsl:use-attribute-sets="title-font">Gebouwinformatie</fo:block>
        <fo:block margin-top="0cm" margin-left="0.2cm" xsl:use-attribute-sets="default-font">Bouwlaag:
          <xsl:value-of select="verdiepingen/bouwlaag"></xsl:value-of>
        </fo:block>
        <fo:block margin-top="0cm" margin-left="0.2cm" xsl:use-attribute-sets="default-font">Hoogste bouwlaag:
          <xsl:value-of select="hoogsteBouwlaag"></xsl:value-of>
        </fo:block>
        <!-- Adres.-->
        <fo:block margin-top="0.2cm" margin-left="0.2cm" xsl:use-attribute-sets="title-font">Adres</fo:block>
        <fo:block margin-left="0.2cm" xsl:use-attribute-sets="default-font">
          <xsl:value-of select="adres/openbareRuimteNaam"></xsl:value-of>
          <xsl:text>&#160;</xsl:text>
          <xsl:value-of select="adres/huisnummer"></xsl:value-of>
          <xsl:value-of select="adres/huisletter"></xsl:value-of>
          <xsl:text>&#160;</xsl:text>
          <xsl:value-of select="adres/huisnummertoevoeging"></xsl:value-of>
        </fo:block>
        <fo:block margin-left="0.2cm" xsl:use-attribute-sets="default-font">
          <xsl:value-of select="adres/adres/postcode"></xsl:value-of>
          <xsl:value-of select="adres/woonplaatsNaam"></xsl:value-of>
        </fo:block>
        <!-- Contact.-->
        <fo:block margin-top="0.2cm" margin-left="0.2cm" xsl:use-attribute-sets="title-font">Contact</fo:block>
        <fo:block margin-top="0.05cm" margin-left="0.2cm" xsl:use-attribute-sets="default-font">
          <fo:table table-layout="fixed" width="13.15cm">
            <fo:table-column column-width="3.945cm" border-width="thin" border-right-style="solid"></fo:table-column>
            <fo:table-column column-width="5.26cm" border-width="thin" border-right-style="solid"></fo:table-column>
            <fo:table-column column-width="3.945cm"></fo:table-column>
            <fo:table-body>
              <!-- Header.-->
              <fo:table-row>
                <fo:table-cell margin-left="0.05cm">
                  <fo:block>Functie</fo:block>
                </fo:table-cell>
                <fo:table-cell margin-left="0.05cm">
                  <fo:block>Naam</fo:block>
                </fo:table-cell>
                <fo:table-cell margin-left="0.05cm">
                  <fo:block>Telefoonnr.</fo:block>
                </fo:table-cell>
              </fo:table-row>
              <!-- Body.-->
              <xsl:choose>
                <xsl:when test="contact">
                  <xsl:for-each select="contact">
                    <fo:table-row border-width="thin" border-top-style="solid">
                      <fo:table-cell margin-left="0.05cm">
                        <fo:block>
                          <xsl:value-of select="functie"></xsl:value-of>
                        </fo:block>
                      </fo:table-cell>
                      <fo:table-cell margin-left="0.05cm">
                        <fo:block>
                          <xsl:value-of select="naam"></xsl:value-of>
                        </fo:block>
                      </fo:table-cell>
                      <fo:table-cell margin-left="0.05cm">
                        <fo:block>
                          <xsl:value-of select="telefoonnummer"></xsl:value-of>
                        </fo:block>
                      </fo:table-cell>
                    </fo:table-row>
                  </xsl:for-each>
                </xsl:when>
                <xsl:otherwise>
                  <fo:table-row border-width="thin" border-top-style="solid">
                    <fo:table-cell margin-left="0.05cm">
                      <fo:block>-</fo:block>
                    </fo:table-cell>
                    <fo:table-cell margin-left="0.05cm">
                      <fo:block>-</fo:block>
                    </fo:table-cell>
                    <fo:table-cell margin-left="0.05cm">
                      <fo:block>-</fo:block>
                    </fo:table-cell>
                  </fo:table-row>
                </xsl:otherwise>
              </xsl:choose>
            </fo:table-body>
          </fo:table>
        </fo:block>
      </fo:block-container>
    </xsl:for-each>
  </xsl:template>
  <!-- Special Block.-->
  <xsl:template name="dbk_specialBk">
    <xsl:for-each select="extra/info[@componentname='dbk1']">
      <fo:block-container width="13.55cm" height="12.936cm" top="0cm" left="13.75cm" xsl:use-attribute-sets="column-block-border">
        <!-- Bijzonderheden.-->
        <fo:block margin-top="0.1cm" margin-left="0.2cm" xsl:use-attribute-sets="title-font">Bijzonderheden</fo:block>
        <fo:block margin-top="0.2cm" margin-left="0.2cm" xsl:use-attribute-sets="default-font">
          <fo:table table-layout="fixed" width="13.15cm">
            <fo:table-column column-width="3.945cm" border-width="thin" border-right-style="solid"></fo:table-column>
            <fo:table-column column-width="9.205cm"></fo:table-column>
            <fo:table-body>
              <fo:table-row>
                <fo:table-cell margin-left="0.05cm">
                  <fo:block>Soort</fo:block>
                </fo:table-cell>
                <fo:table-cell margin-left="0.05cm">
                  <fo:block>Informatie</fo:block>
                </fo:table-cell>
              </fo:table-row>
              <xsl:choose>
                <xsl:when test="bijzonderheid">
                  <xsl:for-each select="bijzonderheid">
                    <fo:table-row border-width="thin" border-top-style="solid">
                      <fo:table-cell margin-left="0.05cm">
                        <fo:block>
                          <xsl:value-of select="soort"></xsl:value-of>
                        </fo:block>
                      </fo:table-cell>
                      <fo:table-cell margin-left="0.05cm">
                        <fo:block>
                          <xsl:value-of select="tekst"></xsl:value-of>
                        </fo:block>
                      </fo:table-cell>
                    </fo:table-row>
                  </xsl:for-each>
                </xsl:when>
                <xsl:otherwise>
                  <fo:table-row border-width="thin" border-top-style="solid">
                    <fo:table-cell margin-left="0.05cm">
                      <fo:block>-</fo:block>
                    </fo:table-cell>
                    <fo:table-cell margin-left="0.05cm">
                      <fo:block>-</fo:block>
                    </fo:table-cell>
                  </fo:table-row>
                </xsl:otherwise>
              </xsl:choose>
            </fo:table-body>
          </fo:table>
        </fo:block>
        <!-- Verblijf.-->
        <fo:block margin-top="0.2cm" margin-left="0.2cm" xsl:use-attribute-sets="title-font">Verblijf</fo:block>
        <fo:block margin-top="0.2cm" margin-left="0.2cm" xsl:use-attribute-sets="default-font">
          <fo:table table-layout="fixed" width="13.15cm">
            <fo:table-column column-width="5.26cm" border-width="thin" border-right-style="solid"></fo:table-column>
            <fo:table-column column-width="1.315cm" border-width="thin" border-right-style="solid"></fo:table-column>
            <fo:table-column column-width="2.63cm" border-width="thin" border-right-style="solid"></fo:table-column>
            <fo:table-column column-width="2.63cm" border-width="thin" border-right-style="solid"></fo:table-column>
            <fo:table-column column-width="1.315cm"></fo:table-column>
            <fo:table-body>
              <fo:table-row>
                <fo:table-cell margin-left="0.05cm">
                  <fo:block>Groep</fo:block>
                </fo:table-cell>
                <fo:table-cell margin-left="0.05cm" text-align="center">
                  <fo:block>#</fo:block>
                </fo:table-cell>
                <fo:table-cell margin-left="0.05cm" text-align="center">
                  <fo:block>Van</fo:block>
                </fo:table-cell>
                <fo:table-cell margin-left="0.05cm" text-align="center">
                  <fo:block>Tot</fo:block>
                </fo:table-cell>
                <fo:table-cell margin-left="0.05cm" text-align="center">
                  <fo:block>NZR</fo:block>
                </fo:table-cell>
              </fo:table-row>
              <xsl:choose>
                <xsl:when test="verblijf">
                  <xsl:for-each select="verblijf">
                    <fo:table-row border-width="thin" border-top-style="solid">
                      <fo:table-cell margin-left="0.05cm">
                        <fo:block>
                          <xsl:value-of select="typeAanwezigheidsgroep"></xsl:value-of>
                        </fo:block>
                      </fo:table-cell>
                      <fo:table-cell margin-left="0.05cm" text-align="center">
                        <fo:block>
                          <xsl:value-of select="aantal"></xsl:value-of>
                        </fo:block>
                      </fo:table-cell>
                      <fo:table-cell margin-left="0.05cm" text-align="center">
                        <fo:block>
                          <xsl:value-of select="tijdvakBegintijd"></xsl:value-of>
                        </fo:block>
                      </fo:table-cell>
                      <fo:table-cell margin-left="0.05cm" text-align="center">
                        <fo:block>
                          <xsl:value-of select="tijdvakEindtijd"></xsl:value-of>
                        </fo:block>
                      </fo:table-cell>
                      <fo:table-cell margin-left="0.05cm" text-align="center">
                        <fo:block>
                          <xsl:value-of select="aantalNietZelfredzaam"></xsl:value-of>
                        </fo:block>
                      </fo:table-cell>
                    </fo:table-row>
                  </xsl:for-each>
                </xsl:when>
                <xsl:otherwise>
                  <fo:table-row border-width="thin" border-top-style="solid">
                    <fo:table-cell margin-left="0.05cm">
                      <fo:block>-</fo:block>
                    </fo:table-cell>
                    <fo:table-cell margin-left="0.05cm" text-align="center">
                      <fo:block>-</fo:block>
                    </fo:table-cell>
                    <fo:table-cell margin-left="0.05cm" text-align="center">
                      <fo:block>-</fo:block>
                    </fo:table-cell>
                    <fo:table-cell margin-left="0.05cm" text-align="center">
                      <fo:block>-</fo:block>
                    </fo:table-cell>
                    <fo:table-cell margin-left="0.05cm" text-align="center">
                      <fo:block>-</fo:block>
                    </fo:table-cell>
                  </fo:table-row>
                </xsl:otherwise>
              </xsl:choose>
            </fo:table-body>
          </fo:table>
        </fo:block>
      </fo:block-container>
    </xsl:for-each>
  </xsl:template>
  <!-- Photo1 Block.-->
  <xsl:template name="dbk_photo1Bk">
    <xsl:for-each select="extra/info[@componentname='dbk1']">
      <xsl:for-each select="foto">
        <xsl:if test="position()=1">
          <fo:block-container width="13.55cm" height="12.936cm" top="13.136cm" left="0cm" xsl:use-attribute-sets="column-block-border">
            <fo:block margin="0.05cm">
              <xsl:variable name="photoUrl" select="URL"></xsl:variable>
              <fo:external-graphic src="{$photoUrl}" width="100%" height="100%" content-width="scale-to-fit"></fo:external-graphic>
            </fo:block>
          </fo:block-container>
        </xsl:if>
      </xsl:for-each>
    </xsl:for-each>
  </xsl:template>
  <!-- Photo2 Block.-->
  <xsl:template name="dbk_photo2Bk">
    <xsl:for-each select="extra/info[@componentname='dbk1']">
      <xsl:for-each select="foto">
        <xsl:if test="position()=2">
          <fo:block-container width="13.55cm" height="12.936cm" top="13.136cm" left="13.75cm" xsl:use-attribute-sets="column-block-border">
            <fo:block margin="0.05cm">
              <xsl:variable name="photoUrl" select="URL"></xsl:variable>
              <fo:external-graphic src="{$photoUrl}" width="100%" height="100%" content-width="scale-to-fit"></fo:external-graphic>
            </fo:block>
          </fo:block-container>
        </xsl:if>
      </xsl:for-each>
    </xsl:for-each>
  </xsl:template>
  <!-- Dangerous substances Block.-->
  <xsl:template name="dbk_dangerousSubstBk">
    <xsl:for-each select="extra/info[@componentname='dbk1']">
      <fo:block-container width="27.3cm" height="12.936cm" top="26.272cm" left="0cm" xsl:use-attribute-sets="column-block-border">
        <fo:block margin-top="0.1cm" margin-left="0.2cm" xsl:use-attribute-sets="title-font">Gevaarlijke stoffen</fo:block>
        <fo:block margin-top="0.2cm" margin-left="0.2cm" xsl:use-attribute-sets="default-font">
          <fo:table table-layout="fixed" width="26.9cm">
            <fo:table-column column-width="4.465cm" border-width="thin" border-right-style="solid"></fo:table-column>
            <fo:table-column column-width="4.465cm" border-width="thin" border-right-style="solid"></fo:table-column>
            <fo:table-column column-width="4.465cm" border-width="thin" border-right-style="solid"></fo:table-column>
            <fo:table-column column-width="4.465cm" border-width="thin" border-right-style="solid"></fo:table-column>
            <fo:table-column column-width="4.465cm" border-width="thin" border-right-style="solid"></fo:table-column>
            <fo:table-column column-width="4.465cm"></fo:table-column>
            <fo:table-body>
              <!-- Header.-->
              <fo:table-row>
                <fo:table-cell margin-left="0.05cm">
                  <fo:block>Stof</fo:block>
                </fo:table-cell>
                <fo:table-cell margin-left="0.05cm" text-align="center">
                  <fo:block>Gevaarsindicatienr.</fo:block>
                </fo:table-cell>
                <fo:table-cell margin-left="0.05cm" text-align="center">
                  <fo:block>UN nummer</fo:block>
                </fo:table-cell>
                <fo:table-cell margin-left="0.05cm" text-align="center">
                  <fo:block>Hoeveelheid</fo:block>
                </fo:table-cell>
                <fo:table-cell margin-left="0.05cm" text-align="center">
                  <fo:block>Symboolcode</fo:block>
                </fo:table-cell>
                <fo:table-cell margin-left="0.05cm">
                  <fo:block>Informatie</fo:block>
                </fo:table-cell>
              </fo:table-row>
              <!-- Body.-->
              <xsl:choose>
                <xsl:when test="gevaarlijkestof">
                  <xsl:for-each select="gevaarlijkestof">
                    <fo:table-row border-width="thin" border-top-style="solid">
                      <fo:table-cell margin-left="0.05cm">
                        <fo:block>
                          <xsl:value-of select="naamStof"></xsl:value-of>
                        </fo:block>
                      </fo:table-cell>
                      <fo:table-cell margin-left="0.05cm" text-align="center">
                        <fo:block>
                          <xsl:value-of select="gevaarsindicatienummer"></xsl:value-of>
                        </fo:block>
                      </fo:table-cell>
                      <fo:table-cell margin-left="0.05cm" text-align="center">
                        <fo:block>
                          <xsl:value-of select="UNnummer"></xsl:value-of>
                        </fo:block>
                      </fo:table-cell>
                      <fo:table-cell margin-left="0.05cm" text-align="center">
                        <fo:block>
                          <xsl:value-of select="hoeveelheid"></xsl:value-of>
                        </fo:block>
                      </fo:table-cell>
                      <fo:table-cell margin-left="0.05cm" text-align="center">
                        <fo:block>
                          <xsl:value-of select="symboolCode"></xsl:value-of>
                        </fo:block>
                      </fo:table-cell>
                      <fo:table-cell margin-left="0.05cm">
                        <fo:block>
                          <xsl:value-of select="aanvullendeInformatie"></xsl:value-of>
                        </fo:block>
                      </fo:table-cell>
                    </fo:table-row>
                  </xsl:for-each>
                </xsl:when>
                <xsl:otherwise>
                  <fo:table-row border-width="thin" border-top-style="solid">
                    <fo:table-cell margin-left="0.05cm">
                      <fo:block>-</fo:block>
                    </fo:table-cell>
                    <fo:table-cell margin-left="0.05cm" text-align="center">
                      <fo:block>-</fo:block>
                    </fo:table-cell>
                    <fo:table-cell margin-left="0.05cm" text-align="center">
                      <fo:block>-</fo:block>
                    </fo:table-cell>
                    <fo:table-cell margin-left="0.05cm" text-align="center">
                      <fo:block>-</fo:block>
                    </fo:table-cell>
                    <fo:table-cell margin-left="0.05cm" text-align="center">
                      <fo:block>-</fo:block>
                    </fo:table-cell>
                    <fo:table-cell margin-left="0.05cm">
                      <fo:block>-</fo:block>
                    </fo:table-cell>
                  </fo:table-row>
                </xsl:otherwise>
              </xsl:choose>
            </fo:table-body>
          </fo:table>
        </fo:block>
      </fo:block-container>
    </xsl:for-each>
  </xsl:template>
  <!-- Map Block.-->
  <xsl:template name="dbk_mapBk">
    <fo:block page-break-before="always"> </fo:block>
    <fo:block-container width="27.3cm" height="39.6cm" top="0cm" left="0cm" xsl:use-attribute-sets="column-block">
      <fo:block margin-left="0.05cm" margin-right="0.05cm">
        <xsl:variable name="bbox-corrected">
          <xsl:call-template name="correct-bbox">
            <xsl:with-param name="bbox" select="bbox"></xsl:with-param>
          </xsl:call-template>
        </xsl:variable>
        <xsl:variable name="px-ratio" select="format-number($map-height-px div $map-width-px,'0.##','MyFormat')"></xsl:variable>
        <xsl:variable name="map-width-px-corrected" select="quality"></xsl:variable>
        <xsl:variable name="map-height-px-corrected" select="format-number(quality * $px-ratio,'0','MyFormat')"></xsl:variable>
        <xsl:variable name="map">
          <xsl:value-of select="imageUrl"></xsl:value-of>
          <xsl:text>&amp;width=</xsl:text>
          <xsl:value-of select="$map-width-px-corrected"></xsl:value-of>
          <xsl:text>&amp;height=</xsl:text>
          <xsl:value-of select="$map-height-px-corrected"></xsl:value-of>
          <xsl:text>&amp;bbox=</xsl:text>
          <xsl:value-of select="$bbox-corrected"></xsl:value-of>
        </xsl:variable>
        <fo:external-graphic src="{$map}" content-height="scale-to-fit" content-width="scale-to-fit" scaling="uniform" width="{$map-width-px}" height="{$map-height-px}"></fo:external-graphic>
      </fo:block>
    </fo:block-container>
  </xsl:template>
  <!-- Overview Map Block.-->
  <xsl:template name="dbk_overviewMapBk">
    <xsl:if test="overviewUrl">
      <fo:block-container width="27.3cm" height="39.6cm" top="0cm" left="0cm" xsl:use-attribute-sets="column-block">
        <fo:block margin="0cm">
          <xsl:variable name="bbox-corrected">
            <xsl:call-template name="correct-bbox">
              <xsl:with-param name="bbox" select="bbox"></xsl:with-param>
            </xsl:call-template>
          </xsl:variable>
          <xsl:variable name="overviewSrc">
            <xsl:value-of select="overviewUrl"></xsl:value-of>
            <xsl:text>&amp;geom=</xsl:text>
            <xsl:value-of select="$bbox-corrected"></xsl:value-of>
          </xsl:variable>
          <fo:external-graphic src="url({$overviewSrc})" content-width="100%" content-height="auto" scaling="uniform" width="256px" height="256px"></fo:external-graphic>
        </fo:block>
      </fo:block-container>
    </xsl:if>
  </xsl:template>
  <!-- Map Info Block.-->
  <xsl:template name="dbk_mapInfoBk">
    <fo:block-container width="8cm" height="3.6cm" top="36cm" left="19.3cm" xsl:use-attribute-sets="column-block">
      <!-- Map Info Graphics Block.-->
      <fo:block-container width="2.695cm" height="3.4cm" top="0.1cm" left="0.1cm" xsl:use-attribute-sets="column-block">
        <!-- Map North Arrow Block.-->
        <fo:block-container width="2.695cm" height="2.756cm" top="0cm" left="0cm" background-color="white" xsl:use-attribute-sets="column-block">
          <xsl:call-template name="windrose">
            <xsl:with-param name="angle" select="angle"></xsl:with-param>
            <xsl:with-param name="width" select="'2.494cm'"></xsl:with-param>
            <xsl:with-param name="height" select="'2.555cm'"></xsl:with-param>
            <xsl:with-param name="top" select="'0.1cm'"></xsl:with-param>
            <xsl:with-param name="left" select="'0.1cm'"></xsl:with-param>
          </xsl:call-template>
        </fo:block-container>
        <!-- Map Scale Block.-->
        <fo:block-container width="2.695cm" height="0.544cm" top="2.856cm" left="0cm" background-color="white" xsl:use-attribute-sets="column-block">
          <fo:block margin-left="0.05cm" margin-top="0.0cm">
            <xsl:call-template name="calc-scale">
              <xsl:with-param name="m-width">
                <xsl:call-template name="calc-bbox-width-m-corrected">
                  <xsl:with-param name="bbox" select="bbox"></xsl:with-param>
                </xsl:call-template>
              </xsl:with-param>
              <xsl:with-param name="px-width" select="$map-width-px"></xsl:with-param>
            </xsl:call-template>
          </fo:block>
        </fo:block-container>
      </fo:block-container>
      <!-- Map Info Text Block.-->
      <fo:block-container width="5.005cm" height="3.4cm" top="0.1cm" left="2.895cm" xsl:use-attribute-sets="column-block">
        <!-- Map Info Text Header Block.-->
        <fo:block-container width="5.005cm" height="0.823cm" top="0cm" left="0cm" background-color="white" xsl:use-attribute-sets="column-block">
          <fo:block margin-top="0.15cm" margin-left="0.2cm" xsl:use-attribute-sets="mapinfo-font">
            <fo:inline font-family="Helvetica" font-weight="bold">Digitale bereikbaarheidskaart Utrecht</fo:inline>
          </fo:block>
          <fo:block margin-top="0.15cm" margin-left="0.2cm" xsl:use-attribute-sets="mapinfo-font">
            <xsl:value-of select="extra/info[@componentname='dbk1']/identificatie"></xsl:value-of>
          </fo:block>
        </fo:block-container>
        <fo:block-container width="5.005cm" height="0.544cm" top="0.923cm" left="0cm" background-color="white" xsl:use-attribute-sets="column-block">
          <fo:block margin-top="0.15cm" margin-left="0.2cm" xsl:use-attribute-sets="mapinfo-font">
            <xsl:value-of select="extra/info[@componentname='dbk1']/verdiepingen/bouwlaag"></xsl:value-of>
          </fo:block>
        </fo:block-container>
        <fo:block-container width="5.005cm" height="0.544cm" top="1.568cm" left="0cm" background-color="white" xsl:use-attribute-sets="column-block">
          <fo:block margin-top="0.15cm" margin-left="0.2cm" xsl:use-attribute-sets="mapinfo-font">
            <xsl:value-of select="extra/info[@componentname='dbk1']/formeleNaam"></xsl:value-of>
          </fo:block>
        </fo:block-container>
        <fo:block-container width="5.005cm" height="0.544cm" top="2.212cm" left="0cm" background-color="white" xsl:use-attribute-sets="column-block">
          <fo:block margin-top="0.15cm" margin-left="0.2cm" xsl:use-attribute-sets="mapinfo-font">
            <fo:inline font-style="oblique">
              <xsl:value-of select="extra/info[@componentname='dbk1']/informeleNaam"></xsl:value-of>
            </fo:inline>
          </fo:block>
        </fo:block-container>
        <fo:block-container width="5.005cm" height="0.544cm" top="2.856cm" left="0cm" background-color="white" xsl:use-attribute-sets="column-block">
          <fo:block margin-top="0.15cm" margin-left="0.2cm" xsl:use-attribute-sets="mapinfo-font">Datum afdruk:
            <xsl:value-of select="date"></xsl:value-of>
          </fo:block>
        </fo:block-container>
      </fo:block-container>
    </fo:block-container>
  </xsl:template>
  <!-- Output settings.-->
  <xsl:output method="xml" version="1.0" omit-xml-declaration="no" indent="yes"></xsl:output>
  <!-- Imports.-->
  <xsl:import href="legend.xsl"></xsl:import>
  <!-- Includes.-->
  <xsl:include href="calc.xsl"></xsl:include>
  <xsl:include href="styles_a3.xsl"></xsl:include>
  <!-- Parameters.-->
  <xsl:param name="versionParam" select="'1.0'"></xsl:param>
  <xsl:variable name="map-width-px" select="'773'"></xsl:variable>
  <xsl:variable name="map-height-px" select="'1122'"></xsl:variable>
  <!-- Formatter.-->
  <xsl:decimal-format name="MyFormat" decimal-separator="." grouping-separator="," infinity="INFINITY" minus-sign="-" nan="Not a Number" percent="%" per-mille="m" zero-digit="0" digit="#" pattern-separator=";"></xsl:decimal-format>
  <!-- Master set.-->
  <xsl:template name="layout-master-set">
    <fo:layout-master-set>
      <fo:simple-page-master master-name="dbk_page" page-height="42cm" page-width="29.7cm" margin-top="1.2cm" margin-bottom="1.2cm" margin-left="1.2cm" margin-right="1.2cm">
        <fo:region-body region-name="body"></fo:region-body>
      </fo:simple-page-master>
    </fo:layout-master-set>
  </xsl:template>
  <!-- Template - Root - Info.-->
  <xsl:template match="info">
    <fo:root>
      <xsl:call-template name="layout-master-set"></xsl:call-template>
      <fo:page-sequence master-reference="dbk_page">
        <fo:flow flow-name="body">
          <xsl:call-template name="dbk_titleBk"></xsl:call-template>
          <xsl:call-template name="dbk_specialBk"></xsl:call-template>
          <xsl:call-template name="dbk_photo1Bk"></xsl:call-template>
          <xsl:call-template name="dbk_photo2Bk"></xsl:call-template>
          <xsl:call-template name="dbk_dangerousSubstBk"></xsl:call-template>
          <xsl:call-template name="dbk_mapBk"></xsl:call-template>
          <xsl:call-template name="dbk_overviewMapBk"></xsl:call-template>
          <xsl:call-template name="dbk_mapInfoBk"></xsl:call-template>
        </fo:flow>
      </fo:page-sequence>
    </fo:root>
  </xsl:template>
</xsl:stylesheet>