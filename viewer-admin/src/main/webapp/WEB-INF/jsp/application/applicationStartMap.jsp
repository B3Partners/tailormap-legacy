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
        <title><fmt:message key="viewer_admin.applicationstartmap.0" /></title>
    </stripes:layout-component>
    <stripes:layout-component name="header">
        <jsp:include page="/WEB-INF/jsp/header.jsp"/>
    </stripes:layout-component>
    <stripes:layout-component name="body">
        <div id="content">
            <stripes:errors/>
            <stripes:messages/>
            <h1>
                <fmt:message key="viewer_admin.applicationstartmap.1" />: <c:out value="${actionBean.application.name}"/> <c:if test="${!empty actionBean.application.version}">(v${actionBean.application.version})</c:if>
                <a href="#Startkaartbeeld_Help" title="<fmt:message key="viewer_admin.applicationstartmap.2" />" class="helplink"></a>
            </h1>

                <stripes:form beanclass="nl.b3p.viewer.admin.stripes.ApplicationStartMapActionBean" id="startmapform">

                    <div id="tree" class="tree-selection-tree">
                        <div id="servicetree-container"></div>
                    </div>
                    <div id="layerselection-buttons" class="tree-selection-buttons"></div>
                    <div id="layerselection" class="tree-selection-tree">
                        <div id="selected-layers"></div>
                    </div>
                    <div id="layermove-buttons" class="tree-selection-buttons"></div>
                    <div style="clear: both;"></div>
                    <stripes:hidden id="selectedlayersinput" name="selectedContent" />
                    <stripes:hidden id="readdedLayersinput" name="readdedLayersString" />
                    <stripes:hidden id="checkedlayersinput" name="checkedLayersString" />
                    <stripes:hidden id="removedrecordsinput" name="removedRecordsString" />

                    <fmt:message key="viewer_admin.applicationstartmap.3" var="applicationstartmap3" />
                    <stripes:submit name="save" value="${applicationstartmap3}"/>
                    <fmt:message key="viewer_admin.applicationstartmap.4" var="applicationstartmap4" />
                    <stripes:submit name="default" value="${applicationstartmap4}"/>

                </stripes:form>
            </div>
            <script type="text/javascript">
                // Definition of URLS and icons... how are we going to do this?
                var treeurl = '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.ApplicationStartMapActionBean" event="loadApplicationTree"/>';
                var selectedlayersurl = '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.ApplicationStartMapActionBean" event="loadSelectedLayers"/>';
                var backendCheckUrl = '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.ApplicationStartMapActionBean" event="canContentBeSelected"/>';
 
                var rootid = 'n${actionBean.rootlevel.id}';
                var levelid = 'n${actionBean.rootlevel.id}';
                var checkedLayers = ${actionBean.allCheckedLayers};
 
                var foldericon = '${contextPath}/resources/images/folder.png';
                //var serviceokicon = '${contextPath}/resources/images/serviceok.png';
                //var serviceerroricon = '${contextPath}/resources/images/serviceerror.png';
                var layericon = '${contextPath}/resources/images/map.png';
                //var documenticon = '${contextPath}/resources/images/document.png';
                var movelefticon = '${contextPath}/resources/images/move-left.gif';
                var moverighticon = '${contextPath}/resources/images/move-right.gif';
                var moveupicon = '${contextPath}/resources/images/move-up.gif';
                var movedownicon = '${contextPath}/resources/images/move-down.gif';
                var removeicon = '${contextPath}/resources/images/bin_empty.png';
                var unremoveicon = '${contextPath}/resources/images/bin.png';
            
            </script>
            <script type="text/javascript" src="${contextPath}/resources/js/ux/b3p/TreeSelection.js"></script>
            <script type="text/javascript" src="${contextPath}/resources/js/application/applicationStartMap.js"></script>

    <script type="text/javascript">
        vieweradmin.components.Menu.setActiveLink('menu_startkaartbeeld');
    </script>
</stripes:layout-component>
</stripes:layout-render>
