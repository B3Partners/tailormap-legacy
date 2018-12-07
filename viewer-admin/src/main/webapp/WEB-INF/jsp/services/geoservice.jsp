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
        <title><fmt:message key="viewer_admin.geoservice.0" /></title>
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

    <c:if test="${!edit}"><h1 id="headertext"><fmt:message key="viewer_admin.geoservice.1" /> <c:out value="${actionBean.category.name}"/></h1></c:if>
    <c:if test="${edit}"><h1 id="headertext"><fmt:message key="viewer_admin.geoservice.2" /> <c:out value="${actionBean.service.name}"/> </h1></c:if>

    <p>
    <script type="text/javascript">
        function checkProtocol() {
            var protocol = Ext.query("select[name='protocol']")[0].value;
            var tilingProtocol = Ext.query("select[name='tilingProtocol']")[0].value;
            Ext.fly('agsVersion').setVisibilityMode(Ext.Element.DISPLAY).setVisible(protocol === "arcgis");
            Ext.fly('useUrlTr').setVisibilityMode(Ext.Element.DISPLAY).setVisible(protocol === "wms");
            Ext.fly('useWFSTr').setVisibilityMode(Ext.Element.DISPLAY).setVisible(protocol === "wms");
            Ext.fly('wmsExcTr').setVisibilityMode(Ext.Element.DISPLAY).setVisible(protocol === "wms");
            Ext.fly('serviceNameTr').setVisibilityMode(Ext.Element.DISPLAY).setVisible(protocol === "arcims" || protocol === "tiled" &&  tilingProtocol !== "WMTS");
            Ext.fly('tileSizeTr').setVisibilityMode(Ext.Element.DISPLAY).setVisible(protocol === "tiled" &&  tilingProtocol !== "WMTS");
            Ext.fly('resolutionsTr').setVisibilityMode(Ext.Element.DISPLAY).setVisible(protocol === "tiled" &&  tilingProtocol !== "WMTS");
            Ext.fly('tilingProtocolTr').setVisibilityMode(Ext.Element.DISPLAY).setVisible(protocol === "tiled" );
            Ext.fly('serviceBboxTr').setVisibilityMode(Ext.Element.DISPLAY).setVisible(protocol === "tiled" &&  tilingProtocol !== "WMTS");
            Ext.fly('extensionTr').setVisibilityMode(Ext.Element.DISPLAY).setVisible(protocol === "tiled" &&  tilingProtocol !== "WMTS");
            Ext.fly('crsTr').setVisibilityMode(Ext.Element.DISPLAY).setVisible(protocol === "tiled" &&  tilingProtocol !== "WMTS");
            Ext.fly('useProxy').setVisibilityMode(Ext.Element.DISPLAY).setVisible(protocol === "wms"|| (protocol === "tiled" &&  tilingProtocol === "WMTS"));
        };
        Ext.onReady(function() {
            appendPanel('headertext', 'formcontent');
        });
        Ext.onReady(checkProtocol);
    </script>
    <table class="formtable">
        <tr>
            <td><fmt:message key="viewer_admin.geoservice.3" /> *:</td>
            <td><stripes:text name="url" onchange="urlChanged();" maxlength="255" size="80"/></td>
        </tr>
        <tr><td><fmt:message key="viewer_admin.geoservice.4" /> *:</td>
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
                <fmt:message key="viewer_admin.geoservice.5" />:
            </td>
            <td>
                <stripes:select name="agsVersion" disabled="${edit}" onchange="checkProtocol()" onkeyup="checkProtocol()">
                    <stripes:option value=""><fmt:message key="viewer_admin.geoservice.6" /></stripes:option>
                    <stripes:option value="10.x">10.x</stripes:option>
                    <stripes:option value="9.x">9.x</stripes:option>
                </stripes:select>
                <fmt:message key="viewer_admin.geoservice.7" />
            </td>
        </tr>
        <tr id="useUrlTr">
            <td colspan="2">
                <label>
                    <stripes:checkbox name="overrideUrl"/> <fmt:message key="viewer_admin.geoservice.8" />
                </label>
            </td>
        </tr>
        <tr id="useWFSTr">
            <td colspan="2">
                <label>
                    <stripes:checkbox name="skipDiscoverWFS"/> <fmt:message key="viewer_admin.geoservice.9" />
                </label>
            </td>
        </tr>
        <tr id="wmsExcTr">
            <td><fmt:message key="viewer_admin.geoservice.10" />:</td>
            <td>
                <stripes:select value="Inimage" name="exception_type" id="exception_type">
                    <stripes:option value="-1"><fmt:message key="viewer_admin.geoservice.11" /></stripes:option>
                    <stripes:options-enumeration enum="nl.b3p.viewer.config.services.WMSExceptionType"  />
                </stripes:select>
            </td>
        </tr>
        <tr id="serviceNameTr">
            <td><fmt:message key="viewer_admin.geoservice.12" /> *:</td>
            <td>
            <label>
                <stripes:text name="serviceName" maxlength="255" size="30" disabled="${edit}"/>
            </label>
            </td>
        </tr>
        <tr id="tileSizeTr">
            <td><fmt:message key="viewer_admin.geoservice.13" />:</td>
            <td>
            <label>
                <stripes:text name="tileSize"/>
            </label>
            </td>
        </tr>
        <tr id="resolutionsTr">
            <td><fmt:message key="viewer_admin.geoservice.14" />:</td>
            <td>
            <label>
                <stripes:text name="resolutions" size="80"/>
            </label>
            </td>
        </tr>
        <tr id="tilingProtocolTr">
            <td><fmt:message key="viewer_admin.geoservice.15" />:</td>
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
            <td><fmt:message key="viewer_admin.geoservice.16" />:</td>
            <td>
            <label>
                <stripes:text name="serviceBbox" size="80"/>
            </label>
            </td>
        </tr>
        <tr id="crsTr">
            <td><fmt:message key="viewer_admin.geoservice.17" />:</td>
            <td>
            <label>
                <stripes:text name="crs"/>
            </label>
            </td>
        </tr>
        <tr id="extensionTr">
            <td><fmt:message key="viewer_admin.geoservice.18" />:</td>
            <td>
            <label>
                <stripes:text name="imageExtension"/>
            </label>
            </td>
        </tr>
        <tr>
            <td><fmt:message key="viewer_admin.geoservice.19" />:</td>
            <td><stripes:text name="name" maxlength="255" size="30"/></td>
        </tr>
        <tr>
            <td><fmt:message key="viewer_admin.geoservice.20" />:</td>
            <td><stripes-dynattr:text name="username" maxlength="255" size="30">${username}</stripes-dynattr:text></td>
        </tr>
        <tr>
            <td><fmt:message key="viewer_admin.geoservice.21" />:</td>
            <td><stripes-dynattr:password name="password" autocomplete="new-password" maxlength="255" size="30"/></td>
        </tr>
        <tr>
            <td colspan="2">
                <stripes:checkbox name="useIntersect"/> <fmt:message key="viewer_admin.geoservice.22" />
            </td>
        </tr>
        <tr id="useProxy">
            <td colspan="2">
                <stripes:checkbox name="useProxy"/> <fmt:message key="viewer_admin.geoservice.23" />
            </td>
        </tr>
        <tr>
            <td valign="top">
                <h1><fmt:message key="viewer_admin.geoservice.24" />:</h1>                           
                <table summary="Groepen">
                    <thead>
                        <tr>
                            <th scope="col" style="text-align:center" title="<fmt:message key="viewer_admin.geoservice.25" />"><fmt:message key="viewer_admin.geoservice.26" /></th>
                            <th scope="col" style="text-align:left"><fmt:message key="viewer_admin.geoservice.27" /></th>
                        </tr>
                    </thead>
                    <tbody>
                        <c:forEach var="group" items="${actionBean.allGroups}">     
                            <tr>
                                <td><stripes:checkbox name="groupsRead" value="${group.name}"/></td>
                                <th scope="row" style="text-align:left">${group.name}</th>
                            </tr>
                        </c:forEach>
                    </tbody>
                </table>
            </td>
        </tr>
        <c:if test="${!edit}">
            <tr>
                <td colspan="2"><i><fmt:message key="viewer_admin.geoservice.28" /></i>
                </td>
            </tr>
        </c:if>
        <c:if test="${not empty actionBean.layersInApplications}">
            <tr>
                <td colspan="2">
                    <h1><fmt:message key="viewer_admin.geoservice.29" />:</h1>
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
                <fmt:message key="viewer_admin.geoservice.30" var="geoservice30" />
                <stripes:submit name="add" value="${geoservice30}"/>
                <fmt:message key="viewer_admin.geoservice.31" var="geoservice31" />
                <stripes:reset name="cancel" onclick="setTimeout(checkProtocol,10)"  class="extlikebutton" value="${geoservice31}"/>
                <script>function urlChanged(){}</script>
            </c:when>
            <c:otherwise>
                <fmt:message key="viewer_admin.geoservice.32" var="geoservice32" />
                <stripes:submit name="save" value="${geoservice32}" onclick="return saveConfirm()" />
                <fmt:message key="viewer_admin.geoservice.33" var="geoservice33" />
                <stripes:submit name="delete" onclick="return deleteServiceConfirm();" value="${geoservice33}"/>
                <fmt:message key="viewer_admin.geoservice.34" var="geoservice34" />
                <stripes:submit name="update" onclick="return updateConfirm();" value="${geoservice34}"/>
                <fmt:message key="viewer_admin.geoservice.35" var="geoservice35" />
                <stripes:reset name="cancel" class="extlikebutton" value="${geoservice35}"/>
                <script type="text/javascript">
                    function deleteServiceConfirm() {
                        return confirm('<fmt:message key="viewer_admin.geoservice.36" />');
                    }
                    function updateConfirm() {
                        <c:if test="${!actionBean.updatable}">
                            alert('<fmt:message key="viewer_admin.geoservice.37" />');
                            return false;
                        </c:if>
                        <c:if test="${actionBean.updatable}">
                            return confirm('<fmt:message key="viewer_admin.geoservice.38" />');
                        </c:if>
                    }
                    var isUrlChanged = false;
                    function urlChanged(){
                        isUrlChanged = true;
                    }
                    
                    function saveConfirm(){
                        if(isUrlChanged){
                            return confirm('<fmt:message key="viewer_admin.geoservice.39" />');
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
                panel.updateLayout();
            });                
            panel.updateLayout();
        });
    </script>
    <div id="sldcontent" class="insidePanel" style="margin: 5px">
                    
        <c:choose>
            <c:when test="${empty actionBean.service.styleLibraries}">
                <fmt:message key="viewer_admin.geoservice.40" />
            </c:when>
            <c:otherwise>
                    
                <table>
                    <tr>
                        <td style="padding: 2px"><b><fmt:message key="viewer_admin.geoservice.41" /></b></td>
                        <td style="padding: 2px"><b><fmt:message key="viewer_admin.geoservice.42" /></b></td>
                        <td style="padding: 2px"><b><fmt:message key="viewer_admin.geoservice.43" /></b></td>
                        <td style="padding: 2px"><b><fmt:message key="viewer_admin.geoservice.44" /></b></td>
                    </tr>
                    <c:forEach var="sld" items="${actionBean.service.styleLibraries}">
                        <tr>
                            <td style="padding: 2px"><c:out value="${sld.title}"/></td>
                            <td style="padding: 2px"><c:out value="${sld.defaultStyle ? 'Ja' : 'Nee'}"/></td>
                            <td style="padding: 2px">
                                <c:if test="${sld.externalUrl != null}">
                                    <fmt:message key="viewer_admin.geoservice.45" /> <stripes:link href="${sld.externalUrl}" target="_blank"><c:out value="${sld.externalUrl}"/></stripes:link>
                                </c:if>
                                <c:if test="${sld.externalUrl == null}">
                                    <fmt:message key="viewer_admin.geoservice.46" />
                                </c:if>
                            </td>
                            <td style="padding: 2px">
                                <stripes:link beanclass="nl.b3p.viewer.admin.stripes.GeoServiceActionBean" event="editSld">
                                    <stripes:param name="service" value="${actionBean.service.id}"/>
                                    <stripes:param name="sld" value="${sld.id}"/>
                                    <fmt:message key="viewer_admin.geoservice.47" />
                                </stripes:link>
                                <fmt:message key="viewer_admin.geoservice.48" var="geoservice48" />
                                <stripes:link beanclass="nl.b3p.viewer.admin.stripes.GeoServiceActionBean" event="deleteSld" onclick="return confirm('${geoservice48}')">
                                    <stripes:param name="service" value="${actionBean.service.id}"/>
                                    <stripes:param name="sld" value="${sld.id}"/>
                                    <fmt:message key="viewer_admin.geoservice.49" />
                                </stripes:link>
                                
                            </td>
                    </c:forEach>
                </table>
            </c:otherwise>
        </c:choose>
        <br>
        <stripes:form beanclass="nl.b3p.viewer.admin.stripes.GeoServiceActionBean">
            <stripes:hidden name="service"/>
            <fmt:message key="viewer_admin.geoservice.50" var="geoservice50" />
            <stripes:submit name="addSld" value="${geoservice50}"/>
        </stripes:form>            
    </div>
</c:if>

    </stripes:layout-component>
</stripes:layout-render>
