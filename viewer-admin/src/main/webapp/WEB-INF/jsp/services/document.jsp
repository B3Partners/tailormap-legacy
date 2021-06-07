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
        <title><fmt:message key="viewer_admin.document.0" /></title>
    </stripes:layout-component>
    <stripes:layout-component name="header">
        <jsp:include page="/WEB-INF/jsp/header.jsp"/>
    </stripes:layout-component>
    <stripes:layout-component name="body">
        <div id="content">
            <stripes:errors/>
            <stripes:messages/>
            <h1><fmt:message key="viewer_admin.document.1" /><a href="#Documenten_Beheren_help" title="<fmt:message key="viewer_admin.document.2" />" class="helplink"></a></h1>
            <div id="grid-container" class="documenten"></div>
            <div id="form-container" class="documenten">
                <iframe src="<stripes:url beanclass="nl.tailormap.viewer.admin.stripes.DocumentActionBean" event="cancel"/>" id="editFrame" frameborder="0"></iframe>
            </div>
            <script type="text/javascript" src="${contextPath}/resources/js/services/document.js"></script>
            <script type="text/javascript">
                Ext.onReady(function() {
                    // Expose vieweradmin_components_Document to global scope to be able to access the component from the iframe
                    window.vieweradmin_components_Document = Ext.create('vieweradmin.components.Document', {
                        gridurl: '<stripes:url beanclass="nl.tailormap.viewer.admin.stripes.DocumentActionBean" event="getGridData"/>',
                        editurl: '<stripes:url beanclass="nl.tailormap.viewer.admin.stripes.DocumentActionBean" event="edit"/>',
                        deleteurl: '<stripes:url beanclass="nl.tailormap.viewer.admin.stripes.DocumentActionBean" event="delete"/>'
                    });
                });
            </script>
        </div>
    </stripes:layout-component>
</stripes:layout-render>