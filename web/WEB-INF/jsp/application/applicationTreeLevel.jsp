<%--
Copyright (C) 2011 B3Partners B.V.

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
    </stripes:layout-component>
    <stripes:layout-component name="body">

        <p>
            <stripes:errors/>
            <stripes:messages/>
        <p>
            <stripes:form beanclass="nl.b3p.viewer.admin.stripes.ApplicationTreeLevelActionBean">
                <stripes:hidden name="level" value="${actionBean.level.id}"/>

                <c:if test="${actionBean.context.eventName == 'edit'}">
                <stripes:submit name="save" value="Opslaan" />
                <stripes:submit name="cancel" value="Annuleren"/>
                <br /><br />
                <div id="tabs">
                        <div id="tree-tab" class="x-hide-display">
                            <div id="tree">
                                <div id="servicetree-container"></div>
                            </div>
                            <div id="layerselection-buttons"></div>
                            <div id="layerselection">
                                <div id="selected-layers"></div>
                            </div>
                            <div id="layermove-buttons"></div>
                            <div style="clear: both;"></div>
                            <input type="hidden" id="selectedlayersinput" name="selectedlayers" />
                        </div>

                        <div id="rights-tab" class="x-hide-display">
                            <h1>Rechten:</h1>
                            <c:forEach var="group" items="${actionBean.allGroups}">
                                <stripes:checkbox name="groupsRead" value="${group.name}"/>${group.name}<br>
                            </c:forEach>
                        </div>
                    
                        <div id="documents-tab" class="x-hide-display">
                            Documenten
                        </div>

                        <div id="context-tab" class="x-hide-display">
                            <h1>Context:</h1>
                            <stripes:textarea cols="150" rows="5" name="level.info"/><br>
                            Niveau naam: <stripes:text name="level.name"/>
                        </div>
                </div>
            </c:if>
        <c:if test="${actionBean.context.eventName == 'save'}">
            <script type="text/javascript">
                var frameParent = getParent();
                if(frameParent && frameParent.renameNode && '${actionBean.level.name}' != '') {
                    frameParent.renameNode('n${actionBean.level.id}','${actionBean.level.name}');
                }
            </script>
        </c:if>

        </stripes:form>
        <script type="text/javascript">
            // Definition of URLS and icons... how are we going to do this?
            var treeurl = '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.GeoServiceRegistryActionBean" event="loadCategoryTree"/>';
            var selectedlayersurl = '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.ApplicationTreeActionBean" event="loadSelectedLayers"/>';
            var levelid = '${actionBean.level.id}';
            var layersAllowed = ${actionBean.layersAllowed};
 
            var foldericon = '${contextPath}/resources/images/folder.png';
            var serviceokicon = '${contextPath}/resources/images/serviceok.png';
            var serviceerroricon = '${contextPath}/resources/images/serviceerror.png';
            var layericon = '${contextPath}/resources/images/map.png';
            var movelefticon = '${contextPath}/resources/images/move-left.gif';
            var moverighticon = '${contextPath}/resources/images/move-right.gif';
            var moveupicon = '${contextPath}/resources/images/move-up.gif';
            var movedownicon = '${contextPath}/resources/images/move-down.gif';
            
            var activelink = 'menu_boomstructuur';
        </script>
        <script type="text/javascript" src="${contextPath}/resources/js/application/applicationTreeLevel.js"></script>
    </stripes:layout-component>
</stripes:layout-render>