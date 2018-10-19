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
        <title>___Kies applicatie-bookmark?____</title>
    </stripes:layout-component>
    <stripes:layout-component name="body">
            <stripes:errors/>
            <stripes:messages/>
            <script type="text/javascript">
                    var frameParent = getParent();
                <c:if test="${actionBean.context.eventName == 'deleteBookmark'}">
                    if(frameParent && frameParent.vieweradmin_components_Bookmark) {
                        frameParent.vieweradmin_components_Bookmark.reloadGrid();
                    }   
                </c:if>
                <c:if test="${empty sessionScope['applicationId']}">
                    if(frameParent && frameParent.vieweradmin_components_Bookmark) {
                        frameParent.vieweradmin_components_Bookmark.removeActiveAppMenu();
                    }
                </c:if>
            </script>

    </stripes:layout-component>
</stripes:layout-render>
