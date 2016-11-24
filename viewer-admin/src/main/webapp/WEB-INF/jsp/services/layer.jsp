<%--
Copyright (C) 2011-2015 B3Partners B.V.

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
        <title>Bewerk layer</title>
    </stripes:layout-component>
    <stripes:layout-component name="body">
        <div id="formcontent">
            <stripes:errors/>
            <stripes:messages/>
            <stripes:form beanclass="nl.b3p.viewer.admin.stripes.LayerActionBean">

                <h1 id="headertext">Layer bewerken</h1>
                <stripes:hidden name="layer" value="${actionBean.layer.id}"/>

                <table class="formtable">
                    <tr>
                        <td>Naam van layer bij service:</td>
                        <td><stripes:text name="layer.name" disabled="true" size="30"/></td>
                    </tr>
                    <tr>     
                        <td>Titel:</td> 
                        <td><stripes:text name="layer.title" disabled="true" maxlength="255" size="30"/></td>
                    </tr>
                    <tr>
                        <td>Alternatieve titel: 
                        <td><stripes:text name="layer.titleAlias" maxlength="255" size="30"/></td>
                    </tr>
                    <tr>     
                        <td valign="top">Alternatieve legenda afbeelding:</td> 
                        <td>
                            <stripes:text name="details[alternateLegendImageUrl]" maxlength="255" size="70"/><br>
                            <c:choose>
                                <c:when test="${!empty actionBean.layer.legendImageUrl}">
                                    Legenda afbeelding van server:<br>
                                    <a href="${actionBean.layer.legendImageUrl}" target="_blank"><img src="${actionBean.layer.legendImageUrl}"/></a>
                                </c:when>
                                <c:when test="${actionBean.layer.service.protocol == 'wms'}">
                                    De service heeft geen legenda URL beschikbaar. 
                                </c:when>
                            </c:choose>
                        </td>
                    </tr>
                    <tr>     
                        <td>Metadata stylesheet:</td> <%-- XXX wordt in TOC niet zo gebruikt, moet metadata.url zijn? --%>
                        <td><stripes:text name="details['metadata.stylesheet']" maxlength="255" size="30"/></td>
                    </tr>
                    <tr>     
                        <td>Downloadlink:</td> 
                        <td><stripes:text name="details['download.url']" maxlength="255" size="30"/></td>
                    </tr>
                    <tr>
                        <td valign="top">Naamsvermelding:</td>
                        <td><stripes:text name="details['attribution']" maxlength="255" size="60"/><br/>
                            <a href="#" onclick="document.getElementById('voorbeelden').style.display = 'table-row'">Toon voorbeelden</a>
                        </td>
                    </tr>
                    <tr id="voorbeelden" style="display: none;">
                        <td colspan="2" style="border: 1px solid #43a4b1">
                            <i>Voorbeeld OpenStreetMap of Openbasiskaart:</i><br/>
                            <span style="font-family: monospace">&amp;copy; &lt;a href="http://www.openstreetmap.nl" target="_blank"&gt;OpenStreetMap contributors&lt;/a&gt;</span><br/>
                            <i>Voorbeeld BGT, PDOK, etc:</i></br>
                            <span style="font-family: monospace">&amp;copy; &lt;a href="http://www.kadaster.nl" target="_blank"&gt;Kadaster&lt;/a&gt;</span><br/>
                        </td>
                    </tr>
                    <tr>
                        <td>Attribuutbron:</td>
                        <td>
                            <stripes:select name="featureSourceId" id="featureSourceId">
                                <stripes:option value="-1">Kies..</stripes:option>
                                <c:forEach var="source" items="${actionBean.featureSources}">
                                    <stripes:option value="${source.id}">${source.protocol} #${source.id} <c:out value="${source.name}"/></stripes:option>
                                </c:forEach>
                            </stripes:select>
                        </td>
                    </tr>
                    <tr>
                        <td>Attribuutlijst:</td>
                        <td>
                            <select name="simpleFeatureType" id="simpleFeatureTypeId">
                                <option value="-1">Maak uw keuze..</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td style="width:300px">Kan de kaartlaag gefilterd worden met OGC SLD filtering (indien aangevinkt en het wordt niet ondersteund, wordt de kaart wit):</td>
                        <td>
                            <stripes:checkbox name="details['filterable']"/>
                        </td>
                    </tr>
                    <tr>
                        <td valign="top">
                            <h1>Groepen:</h1>                           
                            <table summary="Groepen">
                                <thead>
                                    <tr>
                                        <th scope="col" title="Lezen">L</th>
                                        <th scope="col" title="Bewerken">B</th>
                                        <th scope="col" title="Geometrie NIET Bewerken">G!B</th>
                                        <th scope="col" style="text-align:left">groep</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <c:forEach var="group" items="${actionBean.allGroups}">     
                                        <tr>
                                            <td><stripes:checkbox name="groupsRead" value="${group.name}"/></td>
                                            <td><stripes:checkbox name="groupsWrite" value="${group.name}"/></td>
                                            <td><stripes:checkbox name="groupsPreventGeomEdit" value="${group.name}"/></td>
                                            <th scope="row" style="text-align:left">${group.name}</th>
                                        </tr>
                                    </c:forEach>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                    <c:if test="${not empty actionBean.applicationsUsedIn}">
                    <tr>
                        <td>
                            <h1>Kaartlaag wordt gebruikt in de volgende applicaties:</h1>
                            <c:forEach var="name" items="${actionBean.applicationsUsedIn}">
                                <c:out value="${name}"/><br />
                            </c:forEach>
                        </td>
                    </tr>
                    </c:if>
                </table>

                <div class="submitbuttons">
                    <stripes:submit name="save" value="Kaartlaag opslaan"/>
                    <stripes:reset name="cancel" class="extlikebutton" onclick="setTimeout(changeFeatureSource,10)" value="Annuleren"/>
                </div>
                <script type="text/javascript">
                    
                    Ext.onReady(function() {
                        appendPanel('headertext', 'formcontent');
                        var featureSourceId = Ext.get('featureSourceId');
                        var simpleFeatureTypeId = Ext.get('simpleFeatureTypeId');
                        featureSourceId.on('change', function() {
                            featureSourceChange(featureSourceId);
                        });
                        
                        // Init with change, because a certain select value can be preselected
                        featureSourceChange(featureSourceId);
                    });
                    function getOption(value, text, selected) {
                            var option = document.createElement('option');
                            option.value = value;
                            option.innerHTML = text;
                            if(selected) {
                                option.selected = true;
                            }
                            return option;
                        }
                        function removeChilds(el) {
                            if (el.hasChildNodes()) {
                                while (el.childNodes.length >= 1) {
                                    el.removeChild(el.firstChild);       
                                } 
                            }
                        }
                    function featureSourceChange(featureSourceId) {
                        var selectedValue = parseInt(featureSourceId.getValue());

                        var simpleFeatureTypeId = document.getElementById('simpleFeatureTypeId');
                        // We are now emptying dom and adding options manully, don't know if this is optimal
                        removeChilds(simpleFeatureTypeId);
                        simpleFeatureTypeId.appendChild(getOption(-1, 'Kies...', false));

                            if(selectedValue != -1) {
                            Ext.Ajax.request({ 
                                url: '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.AttributeActionBean" event="getFeatureTypes"/>', 
                                params: { 
                                    featureSourceId: selectedValue
                                }, 
                                success: function ( result, request ) {
                                    result = Ext.JSON.decode(result.responseText);
                                    Ext.Array.each(result, function(item) {
                                        var selected = false;
                                        if(item.id == '${actionBean.simpleFeatureType.id}') selected = true;
                                        simpleFeatureTypeId.appendChild(getOption(item.id, item.name, selected));
                                    });                              
                                },
                                failure: function() {
                                    Ext.MessageBox.alert("Foutmelding", "Er is een onbekende fout opgetreden");
                                }
                            });
                        }
                        
                    }
                    function changeFeatureSource(){
                        var featureSourceId = Ext.get('featureSourceId');
                        featureSourceChange(featureSourceId);
                    }
                </script>
                
        </stripes:form>

        <c:if test="${actionBean.context.eventName == 'save'}">
            <script type="text/javascript">
                var frameParent = getParent();
                if(frameParent && frameParent.renameNode ) {
                    frameParent.renameNode('l${actionBean.layer.id}','${actionBean.layer.titleAlias}' != '' ? '${actionBean.layer.titleAlias}' : '${actionBean.layer.title}');
                }
            </script>
        </c:if>
        </div>
    </stripes:layout-component>
</stripes:layout-render>