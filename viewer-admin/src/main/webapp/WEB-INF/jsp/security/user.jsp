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
        <title><fmt:message key="viewer_admin.user.0" /></title>
    </stripes:layout-component>
    <stripes:layout-component name="header">
        <jsp:include page="/WEB-INF/jsp/header.jsp"/>
    </stripes:layout-component>
    <stripes:layout-component name="body">
        <div id="content">
            <stripes:errors/>
            <stripes:messages/>
            <h1><fmt:message key="viewer_admin.user.1" /> <a href="#Gebruikers_Help" title="<fmt:message key="viewer_admin.user.2" />" class="helplink"></a></h1>
            <div id="grid-container" class="user">

            </div>
            <div id="form-container" class="user">
                <iframe src="<stripes:url beanclass="nl.b3p.viewer.admin.stripes.UserActionBean" event="cancel"/>" id="editFrame" frameborder="0"></iframe>
            </div>

            <script type="text/javascript" src="${contextPath}/resources/js/security/user.js"></script>
            <script type="text/javascript">
                Ext.onReady(function() {
                    // Expose vieweradmin_components_User to global scope to be able to access the component from the iframe
                    window.vieweradmin_components_User = Ext.create('vieweradmin.components.User', {
                        gridurl: '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.UserActionBean" event="getGridData"/>',
                        editurl: '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.UserActionBean" event="edit"/>',
                        deleteurl: '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.UserActionBean" event="delete"/>'
                    });
                });
            </script>
        </div>
    </stripes:layout-component>
</stripes:layout-render>

