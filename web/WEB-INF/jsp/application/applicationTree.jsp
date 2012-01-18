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

    <stripes:layout-component name="header">
        <jsp:include page="/WEB-INF/jsp/header.jsp"/>
    </stripes:layout-component>
        
    <stripes:layout-component name="body">
        <div id="content">
            <h1>Boomstructuur met kaarten</h1>

            <div id="tree-container"></div>
            <div id="form-container" class="services">
                <iframe src="<stripes:url beanclass="nl.b3p.viewer.admin.stripes.ApplicationTreeLevelActionBean" event="view"/>" id="editFrame" frameborder="0"></iframe>
            </div>
        </div>
        
        <script type="text/javascript">
            // Definition of URLS and icons... how are we going to do this?
            var treeurl = '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.ApplicationTreeActionBean" event="loadApplicationTree"/>';
            var addlevelurl = '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.ApplicationTreeActionBean" event="addLevel"/>';
            var levelurl = '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.ApplicationTreeLevelActionBean" event="view"/>';
            var layerurl = '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.ApplicationTreeLayerActionBean" event="view"/>';
 
            var foldericon = '${contextPath}/resources/images/folder.png';
            var layericon = '${contextPath}/resources/images/map.png';
            var addicon = '${contextPath}/resources/images/add.png';
            
            // 
            var rootid = '${actionBean.rootlevel.id}';
            
            var activelink = 'menu_boomstructuur';
        </script>
        <script type="text/javascript" src="${contextPath}/resources/js/application/applicationTree.js"></script>
    </stripes:layout-component>
        
</stripes:layout-render>
