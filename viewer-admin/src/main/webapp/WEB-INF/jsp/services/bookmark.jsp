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
        <title>Beheer bookmarks</title>
    </stripes:layout-component>
    <stripes:layout-component name="header">
        <jsp:include page="/WEB-INF/jsp/header.jsp"/>
    </stripes:layout-component>
    <stripes:layout-component name="body">
        <div id="content">
            <stripes:errors/>
            <stripes:messages/>
            <h1>Bookmarks<a href="#Soorten_Applicaties_Help" title="Help" class="helplink"></a></h1>
            <div id="grid-container" class="applicaties">

            </div>
            <div id="form-container" class="applicaties">
                <!-- disabled, see https://github.com/flamingo-geocms/flamingo/issues/701
                <stripes:form beanclass="nl.b3p.viewer.admin.stripes.ApplicationSettingsActionBean">
                    <stripes:hidden name="version"/>
                    <stripes:hidden name="name"/>
                    <stripes:hidden name="applicationWorkversion"/>
                    <stripes:submit name="newApplication" value="Nieuwe applicatie"/>
                </stripes:form>
                -->
                <iframe src="<stripes:url beanclass="nl.b3p.viewer.admin.stripes.BookmarkActionBean" event="viewEdit"/>" id="editFrame" frameborder="0"></iframe>
            </div>

            <script type="text/javascript">
                var gridurl = '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.BookmarkActionBean" event="getGridData"/>';
                var deleteurl = '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.BookmarkActionBean" event="deleteBookmark"/>';
                vieweradmin.components.Menu.setActiveLink('menu_bookmarks');

                function removeActiveAppMenu() {
                    var a = document.getElementById("activeAppMenu");
                    if(a) {
                        Ext.removeNode(a);
                    }
                }
            </script>
            <script type="text/javascript" src="${contextPath}/resources/js/services/bookmark.js"></script>
        </div>
    </stripes:layout-component>
</stripes:layout-render>
