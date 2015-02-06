<%--
Copyright (C) 2011-2013 B3Partners B.V.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
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
        <stripes:errors/>
        <stripes:messages/>
        <stripes:form beanclass="nl.b3p.viewer.admin.stripes.ApplicationTreeLayerActionBean" id="apptreelayerform">
            <stripes:hidden name="applicationLayer" value="${actionBean.applicationLayer.id}"/>
            <stripes:hidden name="attributesJSON" id="attributesJSON" value="${actionBean.attributesJSON}"/>
            <h1>Bewerken kaartlaag</h1>
            <br>
            <stripes:submit name="save" value="Opslaan" />
            <stripes:button onclick="cancelFunction()" name="cancel" class="extlikebutton" value="Annuleren"/>
            <br /><br />
            <div id="tabs">
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
                <div id="attributes-tab" class="tabdiv"><div>
                    <a href="#Attributen_Per_Kaartlaag_Help" title="Help" class="helplink"></a>
                    <c:choose>
                        <c:when test="${!empty actionBean.applicationLayer.attributes}">                                                               
                            <c:forEach var="attribute" items="${actionBean.applicationLayer.attributes}" varStatus="count">   
                                <c:if test="${count.index==0 ||(count.index > 0 && actionBean.applicationLayer.attributes[count.index-1].featureType.id != actionBean.applicationLayer.attributes[count.index].featureType.id)}">
                                    <div style="margin-left: -5px;">
                                        <input type="checkbox" id="featureType_${attribute.featureType.id}" value="featureType_${attribute.featureType.id}" onchange="attributeGroupClick(this)"/>
                                        <b><c:out value="${attribute.featureType.featureSource.name}"/> - <c:out value="${attribute.featureType.typeName}"/> (alles selecteer/deselecteer)</b>
                                    </div>
                                </c:if>
                                <stripes:checkbox class="featureType_${attribute.featureType.id}" name="selectedAttributes" value="${attribute.fullName}"/>
                                <c:set var="name" value="${attribute.attributeName}"/>
                                <c:set var="alias" value="${actionBean.attributeAliases[attribute.fullName]}"/>
                                
                                <c:choose>
                                    <c:when test="${alias == null || alias == name}"><c:out value="${name}"/></c:when>
                                    <c:otherwise><c:out value="${alias} (${name})"/></c:otherwise>
                                </c:choose>
                                <br>
                            </c:forEach>
                        </c:when> 
                        <c:otherwise>
                            Er zijn geen attributen voor deze kaartlaag geconfigureerd.
                        </c:otherwise>
                    </c:choose>
                    </div>
                </div>
                <div id="settings-tab" class="tabdiv">
                    <a href="#Instellingen_Per_Kaartlaag_Help" title="Help" class="helplink"></a>
                    <table class="formtable">
                        <tr>
                            <td>Weergavenaam:</td>
                            <td>
                                <stripes:text id="titleAlias" name="details['titleAlias']" maxlength="255" size="30"/>
                                Laat leeg om de naam uit het gegevensregister te gebruiken.
                            </td>
                        </tr>                        
                        <c:choose>
                            <c:when test="${!empty actionBean.styles}">
                                <script type="text/javascript">
                                    
                                    var stylesTitleJson = ${actionBean.stylesTitleJson};
                                    
                                    var namedLayerTitle = "";
                                    var styleTitle = "";
                                    
                                    function updateStyleTitles() {
                                        var styleId = Ext.get("styleSelect").dom.options[Ext.get("styleSelect").dom.selectedIndex].value
                                    
                                        var titles = stylesTitleJson[styleId];
                                        if(!titles) {
                                            titles = {};
                                        }
                                        namedLayerTitle = titles.namedLayerTitle || "";
                                        styleTitle = titles.styleTitle || "";
                                        
                                        Ext.get("layerTitle").dom.innerHTML = Ext.String.htmlEncode(namedLayerTitle == "" ? "-" : namedLayerTitle);
                                        Ext.get("styleTitle").dom.innerHTML = Ext.String.htmlEncode(styleTitle == "" ? "-" : styleTitle);
                                    }
                                    
                                    Ext.onReady(updateStyleTitles);
                                    
                                    function setTitleAlias(which) {
                                        Ext.get("titleAlias").dom.value = which == "layer" ? namedLayerTitle : styleTitle;
                                    }
                                </script>
                                <tr>
                                    <td style="vertical-align: top">Style/SLD:</td>
                                    <td>
                                        <stripes:select id="styleSelect" name="details['style']" onchange="updateStyleTitles()">
                                            <stripes:options-collection collection="${actionBean.styles}" value="id" label="title"/>
                                        </stripes:select><br>
                                        Titel van laag uit SLD: <a href="#" onclick="setTitleAlias('layer');" id="layerTitle">-</a><br>
                                        Titel van stijl uit SLD: <a href="#"  onclick="setTitleAlias('style');" id="styleTitle">-</a><br>
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
                                                <div id="details_summary_description_container" style="width: 475px; height: 150px;"></div>
                                                <stripes:textarea name="details['summary.description']" rows="5" cols="27" style="display: none;" id="details_summary_description" />
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
                                                <label><stripes:checkbox name="details['summary.nl2br']"/>Regeleindes in attribuutwaarden toestaan</label>
                                            </td>
                                        </tr>
                                    </table>
                                </fieldset>
                            </td>
                        </tr>
                        <tr>
                            <td>Titel voor editing:</td>
                            <td><stripes:text name="details['editfunction.title']" maxlength="255" size="30"/></td>
                        </tr>
                    </table>
                </div>
                <div id="edit-tab" class="tabdiv">
                    <stripes:hidden name="details['editfeature.usernameAttribute']" id="details_editfeature_usernameAttribute"/>
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
                </div>
            </div>
            <script type="text/javascript">
                var attributes = ${actionBean.attributesJSON};
                var getDBValuesUrl = <js:quote><stripes:url beanclass="nl.b3p.viewer.admin.stripes.ApplicationTreeLayerActionBean" event="getUniqueValues"/></js:quote>;
                var editable = ${actionBean.editable};
                var imagesPath = "${contextPath}/resources/images/";
                var applicationLayer = "${actionBean.applicationLayer.id}";
                var actionBeans = { 
                    "imageupload": <js:quote><stripes:url beanclass="nl.b3p.viewer.admin.stripes.ImageUploadActionBean"/></js:quote>,
                    "appTreeLayer": <js:quote><stripes:url beanclass="nl.b3p.viewer.admin.stripes.ApplicationTreeLayerActionBean"/></js:quote>
                };
                
                <c:if test="${!empty actionBean.displayName}">
                    // If layer was renamed, rename node in tree
                    var frameParent = getParent();
                    if(frameParent && frameParent.renameNode) {
                        frameParent.renameNode('s${actionBean.applicationLayer.id}', <js:quote value="${actionBean.displayName}"/>);
                    }
                </c:if>
                
            </script>
            <script type="text/javascript" src="${contextPath}/resources/js/ux/form/HtmlEditorImage.js"></script>
            <script type="text/javascript" src="${contextPath}/resources/js/ux/form/HtmlEditorTable.js"></script>
            <script type="text/javascript" src="${contextPath}/resources/js/application/applicationTreeLayer.js"></script>
        </stripes:form>
    </stripes:layout-component>
</stripes:layout-render>
