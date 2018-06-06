<%--
Copyright (C) 2011-2013 B3Partners B.V.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@include file="/WEB-INF/jsp/taglibs.jsp"%>

<stripes:layout-render name="/WEB-INF/jsp/templates/ext.jsp">
    <stripes:layout-component name="head">
        <title>Boomstructuur met kaarten</title>
        <link rel="stylesheet" href="${contextPath}/resources/css/HtmlEditorExtensions.css" />
    </stripes:layout-component>
    <stripes:layout-component name="body">
        <stripes:form beanclass="nl.b3p.viewer.admin.stripes.ApplicationTreeLayerActionBean" id="apptreelayerform" class="maximize">
            <stripes:hidden name="applicationLayer" value="${actionBean.applicationLayer.id}"/>
            <stripes:hidden name="attributesJSON" id="attributesJSON" value="${actionBean.attributesJSON}"/>
            <div id="tabs" class="maximize">
                <div id="settings-tab" class="tabdiv">
                    <a href="#Instellingen_Per_Kaartlaag_Help" title="Help" class="helplink"></a>
                    <stripes:errors/>
                    <stripes:messages/>
                    <table class="formtable">
                        <tr>
                            <td>Weergavenaam:</td>
                            <td>
                                <stripes:text id="titleAlias" name="details['titleAlias']" maxlength="255" size="30"/>
                                Laat leeg om de naam uit het gegevensregister te gebruiken.
                            </td>
                        </tr>
                        <tr>
                            <td>Titel voor editing:</td>
                            <td><stripes:text name="details['editfunction.title']" maxlength="255" size="30"/></td>
                        </tr>
                        <c:choose>
                            <c:when test="${!empty actionBean.styles}">
                                <tr>
                                    <td style="vertical-align: top">Style/SLD:</td>
                                    <td>
                                        <stripes:select id="styleSelect" name="details['style']">
                                            <stripes:options-collection collection="${actionBean.styles}" value="id" label="title"/>
                                        </stripes:select><br>
                                        Titel van laag uit SLD: <a href="#" id="layerTitle">-</a><br>
                                        Titel van stijl uit SLD: <a href="#"  id="styleTitle">-</a><br>
                                        <i>Klik op een titel om deze in te vullen bij weergavenaam.</i>
                                    </td>
                                </tr>
                            </c:when>
                            <c:otherwise>
                                <tr>
                                    <td>Style/SLD:</td>
                                    <td>Geen stijlen beschikbaar</td>
                                </tr>
                            </c:otherwise>
                        </c:choose>
                        <tr>
                            <td style="vertical-align: top">Alternatieve legenda afbeelding:</td>
                            <td>
                                <stripes:text name="details['legendImageUrl']" maxlength="255" size="80"/><br>
                                Laat leeg om de standaardafbeelding uit het gegevensregister of de afbeelding
                                zoals deze door de service wordt gegenereerd te gebruiken.
                            </td>
                        </tr>
                        <tr>
                            <td>Transparantie beginwaarde:</td>
                            <td>
                                <stripes:text name="details['transparency']" maxlength="255" size="10" style="display: none;" id="details_transparency" />
                                <div id="details_transparency_slider" style="width: 200px; float: left;"></div>
                                <div style="float: left; margin-left: 15px;" id="transpSliderWarning">Wordt overschreven wanneer een slider wordt toegevoegd aan deze laag</div>
                                <div style="clear: both;"></div>
                            </td>
                        </tr>
                        <tr>
                            <td>Straalinvloedsgebied:</td>
                            <td>
                                <stripes:text name="details['influenceradius']" maxlength="255" size="10"/>
                                Werkt in combinatie met component Invloedsgebied, afstand in meters
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                <fieldset style="border: 1px gray ridge; width: 100%; padding: 2px;">
                                    <legend style="margin-left: 5px; padding: 2px">Samenvatting (maptip, featureinfo)</legend>
                                    <i>Om de waarde van een attribuut te gebruiken, zet de naam van het attribuut in blokhaken, bijvoorbeeld: [naam]. Zie de "Attributen" tab voor de beschikbare attributen.</i>
                                    <table class="formtable">
                                        <tr>
                                            <td>Titel:</td>
                                            <td><stripes:text name="details['summary.title']" maxlength="255" size="30"/></td>
                                        </tr>
                                        <tr>
                                            <td>Afbeelding URL:</td>
                                            <td><stripes:text name="details['summary.image']" maxlength="255" size="30"/></td>
                                        </tr>
                                        <tr>
                                            <td valign="top">Omschrijving:</td>
                                            <td>
                                                <div>
                                                    <stripes:checkbox class="use-plain-text-editor" name="details['summary.texteditor']" value="plain-text-editor" /> Standaard tekst veld gebruiken in plaats van HTML editor
                                                </div>
                                                <div id="details_summary_description_container" style="width: 475px; height: 150px;"></div>
                                                <stripes:textarea name="details['summary.description']" rows="5" cols="27" style="display: none; width: 475px; height: 150px;" id="details_summary_description" />
                                                <a href="#" class="inlinehelp-toggle" data-target="related-features-help">Related features gebruiken?</a>
                                                <div class="inline-help related-features-help" style="display: none;">
                                                    Het is ook mogelijk gebruik te maken van related features. Gebruik hiervoor de "standaard tekst veld" weergave.<br />
                                                    Blokken waarin de related features moeten komen beginnen met een [begin.FEATURETYPE] en eindigen met [end.FEATURETYPE].<br />
                                                    Om de related features weer te geven moet worden begonnen met [begin.repeat.FEATURETYPE] en eindigen met [end.repeat.FEATURETYPE].<br />
                                                    Daarbinnen het is mogelijk om attributen uit de releated featuretype te gebruiken.
                                                    (Waar hierboven FEATURETYPE staat moet de naam van de related featuretype staan.)<br /><br />
                                                    Voorbeeld:
                                                    <pre>Gemeente: [gm_code] - [gm_naam]&lt;br /&gt;
Wijken: &lt;br /&gt;
[begin.wijk_2014]
    &lt;table&gt;
        &lt;thead&gt;
            &lt;tr&gt;
                &lt;th&gt;Wijk code&lt;/th&gt;
                &lt;th&gt;Wijk naam&lt;/th&gt;
            &lt;/tr&gt;
        &lt;/thead&gt;
        &lt;tbody&gt;
            &lt;!-- LET OP: tr en td tags om begin-
            veld is nodig ivm HTML editor. --&gt;
            &lt;tr&gt;&lt;td colspan="2"&gt;
              [begin.repeat.wijk_2014]
            &lt;/td&gt;&lt;/tr&gt;
            &lt;tr&gt;
                &lt;td&gt;[wk_code]&lt;/td&gt;
                &lt;td&gt;[wk_naam]&lt;/td&gt;
            &lt;/tr&gt;
            &lt;!-- LET OP: tr en td tags om end-
            veld is nodig ivm HTML editor. --&gt;
            &lt;tr&gt;&lt;td colspan="2"&gt;
            	[end.repeat.wijk_2014]
            &lt;/td&gt;&lt;/tr&gt;
        &lt;/tbody&gt;
    &lt;/table&gt;
[end.wijk_2014]</pre>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Link:</td>
                                            <td><stripes:text name="details['summary.link']" maxlength="255" size="30"/></td>
                                        </tr>
                                        <tr>
                                            <td valign="top">Opties:</td>
                                            <td>
                                                <label><stripes:checkbox name="details['summary.noHtmlEncode']"/>HTML tags in attribuutwaarden toestaan</label><br>
                                                <label><stripes:checkbox name="details['summary.nl2br']"/>Regeleindes in attribuutwaarden toestaan</label><br>
                                                <label><stripes:checkbox name="details['summary.retrieveUploads']"/>Laat uploads zien</label><br>
                                            </td>
                                        </tr>
                                    </table>
                                </fieldset>
                            </td>
                        </tr>
                    </table>
                </div>
                <div id="rights-tab" class="tabdiv">
                    <h1>
                        Rechten:
                        <a href="#Rechten_Op_Kaartlaag_Help" title="Help" class="helplink"></a>
                    </h1>
                    L &nbsp; B <br/>
                    <c:forEach var="group" items="${actionBean.allGroups}">
                        <stripes:checkbox name="groupsRead" value="${group.name}"/>
                        <stripes:checkbox name="groupsWrite" value="${group.name}"/>
                        ${group.name}<br/>
                    </c:forEach>
                </div>
                <div id="edit-tab" class="tabdiv">
                    <stripes:hidden name="details['editfeature.usernameAttribute']" id="details_editfeature_usernameAttribute"/>
                    <stripes:hidden name="details['editfeature.uploadDocument']" id="details_editfeature_uploadDocument"/>
                    <stripes:hidden name="details['editfeature.uploadDocument.types']" id="details_editfeature_uploadDocument_types"/>
                    <a href="#Edit_Per_Kaartlaag_Help" title="Help" class="helplink"></a>
                    <c:choose>
                        <c:when test="${actionBean.editable}">
                            Er zijn geen attributen voor deze kaartlaag geconfigureerd.
                        </c:when>
                        <c:otherwise>
                            De attribuutbron van deze kaartlaag is niet van het type JDBC en is daarom niet editbaar.
                        </c:otherwise>
                    </c:choose>
                </div>
                <div id="filter-tab" class="tabdiv">
                    <a href="#Dataselectie_Filterfunctie_Per_Kaartlaag_Help" title="Help" class="helplink"></a>
                    Er zijn geen attributen voor deze kaartlaag geconfigureerd.
                </div>
                <div id="context-tab" class="tabdiv">
                    <a href="#Context_Info_Per_Kaartlaag_Help" title="Help" class="helplink"></a>
                    <stripes:textarea cols="150" rows="5" name="details['context']" id="context_textarea" style="display: none;" />
                    <div id="contextHtmlEditorContainer" style="width: 475px; height: 400px;"></div>
                    (Metadata)url: <stripes:text name="details['metadataurl']" style="width: 390px;"/>
                </div>
            </div>
            <script type="text/javascript" src="${contextPath}/resources/js/ux/form/HtmlEditorImage.js"></script>
            <script type="text/javascript" src="${contextPath}/resources/js/ux/form/HtmlEditorTable.js"></script>
            <script type="text/javascript" src="${contextPath}/resources/js/application/applicationTreeLayer.js?123"></script>
            <script type="text/javascript" src="${contextPath}/resources/js/application/layer/attributes.js"></script>
            <script type="text/javascript">
                Ext.onReady(function() {
                    Ext.create('vieweradmin.components.ApplicationTreeLayer', {
                        attributes: ${actionBean.attributesConfig},
                        editable: ${actionBean.editable},
                        applicationLayer: "${actionBean.applicationLayer.id}",
                        applicationLayerFeatureType: ${actionBean.appLayerFeatureType != null ? actionBean.appLayerFeatureType : -1},
                        displayName: <js:quote value="${actionBean.displayName}"/>,
                        stylesTitleJson: ${actionBean.stylesTitleJson},
                        imagePath: "${contextPath}/resources/images/",
                        actionBeans: {
                            imageupload: <js:quote><stripes:url beanclass="nl.b3p.viewer.admin.stripes.ImageUploadActionBean"/></js:quote>,
                            appTreeLayer: <js:quote><stripes:url beanclass="nl.b3p.viewer.admin.stripes.ApplicationTreeLayerActionBean"/></js:quote>,
                            featureSourceURL: <js:quote><stripes:url beanclass="nl.b3p.viewer.admin.stripes.AttributeSourceActionBean" event="getGridData"/></js:quote>,
                            featureTypesURL: <js:quote><stripes:url beanclass="nl.b3p.viewer.admin.stripes.AttributeActionBean" event="getFeatureTypes"/></js:quote>,
                            attributesURL: <js:quote><stripes:url beanclass="nl.b3p.viewer.admin.stripes.AttributeActionBean" event="getGridData"/></js:quote>,
                            getDBValuesUrl: <js:quote><stripes:url beanclass="nl.b3p.viewer.admin.stripes.ApplicationTreeLayerActionBean" event="getUniqueValues"/></js:quote>
                        }
                    })
                });
            </script>
        </stripes:form>
    </stripes:layout-component>
</stripes:layout-render>
