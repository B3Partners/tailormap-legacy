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
        <title>Geo service</title>
    </stripes:layout-component>
    <stripes:layout-component name="body">

<div id="formcontent">
<stripes:errors/>
<stripes:messages/>

<stripes:form beanclass="nl.b3p.viewer.admin.stripes.GeoServiceActionBean">

<script type="text/javascript">
    var frameParent = getParent();

    <c:if test="${actionBean.serviceDeleted}">
        if(frameParent && frameParent.removeTreeNode && '${actionBean.service.id}' != '') {
            frameParent.removeTreeNode('s${actionBean.service.id}');
        }
    </c:if>
    <c:if test="${actionBean.newService != null}">
        if(frameParent && frameParent.addServiceNode && '${actionBean.service.id}' != '') {
            frameParent.addServiceNode(${actionBean.newService});
        }
    </c:if>
    <c:if test="${actionBean.context.eventName == 'save'}">
        if(frameParent && frameParent.renameNode && '${actionBean.service.name}' != '') {
            frameParent.renameNode('s${actionBean.service.id}','${actionBean.service.name}');
        }
    </c:if>
    <c:if test="${actionBean.updatedService != null}">
        if(frameParent && frameParent.updateServiceNode && '${actionBean.service.id}' != '') {
            frameParent.updateServiceNode(${actionBean.updatedService});
        }
    </c:if>    
</script>

<c:if test="${!actionBean.serviceDeleted}">
    <c:set var="edit" value="${!empty actionBean.service.id}"/>
    <c:set var="isTiling" value="${actionBean.protocol=='tiled'}"/>
    
    <stripes:hidden name="category"/>
    <stripes:hidden name="service"/>

    <c:if test="${!edit}"><h1 id="headertext">Nieuwe service toevoegen aan <c:out value="${actionBean.category.name}"/></h1></c:if>
    <c:if test="${edit}"><h1 id="headertext">Service <c:out value="${actionBean.service.name}"/> bewerken</h1></c:if>

    <p>
    <script type="text/javascript">
        function checkProtocol() {
            var protocol = Ext.query("select[name='protocol']")[0].value;
            var tilingProtocol = Ext.query("select[name='tilingProtocol']")[0].value;
            Ext.fly('agsVersion').setVisibilityMode(Ext.Element.DISPLAY).setVisible(protocol === "arcgis");
            Ext.fly('useUrlTr').setVisibilityMode(Ext.Element.DISPLAY).setVisible(protocol === "wms" || tilingProtocol === "WMTS");
            Ext.fly('serviceNameTr').setVisibilityMode(Ext.Element.DISPLAY).setVisible(protocol === "arcims" || protocol === "tiled" &&  tilingProtocol !== "WMTS");
            Ext.fly('tileSizeTr').setVisibilityMode(Ext.Element.DISPLAY).setVisible(protocol === "tiled" &&  tilingProtocol !== "WMTS");
            Ext.fly('resolutionsTr').setVisibilityMode(Ext.Element.DISPLAY).setVisible(protocol === "tiled" &&  tilingProtocol !== "WMTS");
            Ext.fly('tilingProtocolTr').setVisibilityMode(Ext.Element.DISPLAY).setVisible(protocol === "tiled" &&  tilingProtocol !== "WMTS");
            Ext.fly('serviceBboxTr').setVisibilityMode(Ext.Element.DISPLAY).setVisible(protocol === "tiled" &&  tilingProtocol !== "WMTS");
            Ext.fly('extensionTr').setVisibilityMode(Ext.Element.DISPLAY).setVisible(protocol === "tiled" &&  tilingProtocol !== "WMTS");
            Ext.fly('crsTr').setVisibilityMode(Ext.Element.DISPLAY).setVisible(protocol === "tiled" &&  tilingProtocol !== "WMTS");
            Ext.fly('useProxy').setVisibilityMode(Ext.Element.DISPLAY).setVisible(protocol === "wms");
        }
        Ext.onReady(function() {
            appendPanel('headertext', 'formcontent');
        });
        Ext.onReady(checkProtocol);
    </script>
    <table class="formtable">
        <tr>
            <td>URL van de service *:</td>
            <td><stripes:text name="url" onchange="urlChanged();" maxlength="255" size="80"/></td>
        </tr>
        <tr><td>Protocol *:</td>
            <td>
                <stripes:select name="protocol" disabled="${edit}" onchange="checkProtocol()" onkeyup="checkProtocol()">
                    <stripes:option value="wms">WMS</stripes:option>
                    <stripes:option value="arcgis">ArcGIS MapServer (REST)</stripes:option>
                    <stripes:option value="arcims">ArcIMS</stripes:option>
                    <stripes:option value="tiled">Tiled</stripes:option>
                </stripes:select>
            </td>
        </tr>
        <tr id="agsVersion">
            <td>
                ArcGIS server versie:
            </td>
            <td>
                <stripes:select name="agsVersion" disabled="${edit}" onchange="checkProtocol()" onkeyup="checkProtocol()">
                    <stripes:option value="">Automatisch</stripes:option>
                    <stripes:option value="10.x">10.x</stripes:option>
                    <stripes:option value="9.x">9.x</stripes:option>
                </stripes:select>
                Selecteer een versie indien <i>http://server/ArcGIS/rest/services?f=json</i> is afgeschermd maar de service zelf niet.
            </td>
        </tr>
        <tr id="useUrlTr">
            <td colspan="2">
                <label>
                    <stripes:checkbox name="overrideUrl"/> Gebruik altijd ingevulde URL in plaats van URLs in GetCapabilities
                </label>
            </td>
        </tr>
        <tr id="useUrlTr">     
            <td>Exceptiontype:</td>
            <td>
                <stripes:select value="Inimage" name="exception_type" id="exception_type">
                    <stripes:option value="-1">Kies..</stripes:option>
                    <stripes:options-enumeration enum="nl.b3p.viewer.config.services.WMSExceptionType"  />
                </stripes:select>
            </td>
        </tr>
        <tr id="serviceNameTr">
            <td>Service name *:</td>
            <td>
            <label>
                <stripes:text name="serviceName" maxlength="255" size="30" disabled="${edit}"/>
            </label>
            </td>
        </tr>
        <tr id="tileSizeTr">
            <td>Tile size:</td>
            <td>
            <label>
                <stripes:text name="tileSize"/>
            </label>
            </td>
        </tr>
        <tr id="resolutionsTr">
            <td>Resolutions:</td>
            <td>
            <label>
                <stripes:text name="resolutions" size="80"/>
            </label>
            </td>
        </tr>
        <tr id="tilingProtocolTr">
            <td>Tiling Protocol:</td>
            <td>
            <label>
                <stripes:select name="tilingProtocol" onchange="checkProtocol()" onkeyup="checkProtocol()">
                    <stripes:option value="TMS">TMS</stripes:option>
                    <stripes:option value="WMTS">WMTS</stripes:option>
                    <stripes:option value="WMSc">WMSc</stripes:option>
                    <stripes:option value="OSM">OSM</stripes:option>
                    <stripes:option value="ArcGisRest">ArcGisRest Map Cache</stripes:option>
                </stripes:select>
            </label>
            </td>
        </tr>
        <tr id="serviceBboxTr">
            <td>Service Bounding Box</td>
            <td>
            <label>
                <stripes:text name="serviceBbox" size="80"/>
            </label>
            </td>
        </tr>
        <tr id="crsTr">
            <td>Coordinate Reference System</td>
            <td>
            <label>
                <stripes:text name="crs"/>
            </label>
            </td>
        </tr>
        <tr id="extensionTr">
            <td>Image extension</td>
            <td>
            <label>
                <stripes:text name="imageExtension"/>
            </label>
            </td>
        </tr>
        <tr>
            <td>Weergavenaam:</td>
            <td><stripes:text name="name" maxlength="255" size="30"/></td>
        </tr>
        <tr>
            <td>Gebruikersnaam:</td>
            <td><stripes-dynattr:text name="username" maxlength="255" size="30">${username}</stripes-dynattr:text></td>
        </tr>
        <tr>
            <td>Wachtwoord:</td>
            <td><stripes-dynattr:password name="password" autocomplete="new-password" maxlength="255" size="30"/></td>
        </tr>
        <tr>
            <td colspan="2">
                <stripes:checkbox name="useIntersect"/> Gebruik 'intersect' filter (in plaats van 'DWithin') om data op te halen.
            </td>
        </tr>
        <tr id="useProxy">
            <td colspan="2">
                <stripes:checkbox name="useProxy"/> Gebruik proxy om kaarten op te halen.
            </td>
        </tr>
        <c:if test="${!edit}">
            <tr>
                <td colspan="2"><i>De weergavenaam wordt bij het inladen van de service
                        automatisch bepaald. Bovenstaand kan optioneel een alternatieve weergavenaam
                        worden ingevuld.</i>
                </td>
            </tr>
        </c:if>
        <c:if test="${not empty actionBean.layersInApplications}">
            <tr>
                <td colspan="2">
                    <h1>Service wordt gebruikt in de volgende applicaties:</h1>
                    <div class="geoservice-tree-container"></div>
                </td>
            </tr>
        </c:if>
    </table>

    <c:if test="${not empty actionBean.layersInApplications}">
        <script type="text/javascript" src="${contextPath}/resources/js/services/geoservice.js"></script>
        <script type="text/javascript">
            Ext.onReady(function() {
                Ext.create('vieweradmin.components.Geoservice', {
                    imagesPath: "${contextPath}/resources/images/",
                    layers: ${actionBean.layersInApplications}
                });
            });
        </script>
    </c:if>
    
    <div class="submitbuttons">
        <c:choose>
            <c:when test="${!edit}">
                <stripes:submit name="add" value="Service inladen"/>
                <stripes:reset name="cancel" onclick="setTimeout(checkProtocol,10)"  class="extlikebutton" value="Annuleren"/>
            </c:when>
            <c:otherwise>
                <stripes:submit name="save" value="Opslaan" onclick="return saveConfirm();"/>
                <stripes:submit name="delete" onclick="return deleteServiceConfirm();" value="Verwijder service"/>
                <stripes:submit name="update" onclick="return updateConfirm();" value="Update"/>
                <stripes:reset name="cancel" class="extlikebutton" value="Annuleren"/>
                <script type="text/javascript">
                    function deleteServiceConfirm() {
                        return confirm('Weet u zeker dat u deze service wilt verwijderen?');
                    }
                    function updateConfirm() {
                        <c:if test="${!actionBean.updatable}">
                            alert('Deze service kan niet worden geupdate!');
                            return false;
                        </c:if>
                        <c:if test="${actionBean.updatable}">
                            return confirm('Weet u zeker dat u deze service wilt updaten? Lagen die de server niet meer aanbiedt worden verwijderd.');
                        </c:if>
                    }
                    var isUrlChanged = false;
                    function urlChanged(){
                        isUrlChanged = true;
                    }
                    
                    function saveConfirm(){
                        if(isUrlChanged){
                            return confirm('U heeft de url naar de service aangepast. Dit kan onvoorziene consequenties hebben. Weet u zeker dat u deze service wilt opslaan?');
                        }
                    }
                </script>
            </c:otherwise>
        </c:choose>
    </div>        

</c:if>

</stripes:form>

</div>

<c:if test="${actionBean.protocol == 'wms'}">
    <script type="text/javascript">
        Ext.onReady(function() {
            var panel = Ext.create('Ext.panel.Panel', {
                width: '100%',
                renderTo: Ext.getBody(),
                title: 'Styled layer descriptors',
                padding: '10 0 0 0',
                contentEl: Ext.getDom('sldcontent')
            });
            Ext.on('resize', function () {
                panel.doLayout();
            });                
            panel.doLayout();
        });
    </script>
    <div id="sldcontent" class="insidePanel" style="margin: 5px">
                    
        <c:choose>
            <c:when test="${empty actionBean.service.styleLibraries}">
                Voor deze service zijn geen styled layer descriptors ingesteld.
            </c:when>
            <c:otherwise>
                    
                <table>
                    <tr>
                        <td style="padding: 2px"><b>Naam</b></td>
                        <td style="padding: 2px"><b>Standaard voor kaartlagen</b></td>
                        <td style="padding: 2px"><b>Omschrijving</b></td>
                        <td style="padding: 2px"><b>Actie</b></td>
                    </tr>
                    <c:forEach var="sld" items="${actionBean.service.styleLibraries}">
                        <tr>
                            <td style="padding: 2px"><c:out value="${sld.title}"/></td>
                            <td style="padding: 2px"><c:out value="${sld.defaultStyle ? 'Ja' : 'Nee'}"/></td>
                            <td style="padding: 2px">
                                <c:if test="${sld.externalUrl != null}">
                                    Externe SLD op <stripes:link href="${sld.externalUrl}" target="_blank"><c:out value="${sld.externalUrl}"/></stripes:link>
                                </c:if>
                                <c:if test="${sld.externalUrl == null}">
                                    Opgeslagen SLD
                                </c:if>
                            </td>
                            <td style="padding: 2px">
                                <stripes:link beanclass="nl.b3p.viewer.admin.stripes.GeoServiceActionBean" event="editSld">
                                    <stripes:param name="service" value="${actionBean.service.id}"/>
                                    <stripes:param name="sld" value="${sld.id}"/>
                                    Bewerken
                                </stripes:link>
                                <stripes:link beanclass="nl.b3p.viewer.admin.stripes.GeoServiceActionBean" event="deleteSld" onclick="return confirm('Weet u zeker dat u deze SLD wilt verwijderen?')">
                                    <stripes:param name="service" value="${actionBean.service.id}"/>
                                    <stripes:param name="sld" value="${sld.id}"/>
                                    Verwijderen
                                </stripes:link>
                                
                            </td>
                    </c:forEach>
                </table>
            </c:otherwise>
        </c:choose>
        <br>
        <stripes:form beanclass="nl.b3p.viewer.admin.stripes.GeoServiceActionBean">
            <stripes:hidden name="service"/>
            <stripes:submit name="addSld" value="Toevoegen"/>
        </stripes:form>            
    </div>
</c:if>

    </stripes:layout-component>
</stripes:layout-render>