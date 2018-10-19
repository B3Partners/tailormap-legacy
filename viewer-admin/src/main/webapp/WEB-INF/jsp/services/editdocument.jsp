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
        <title><fmt:message key="viewer_admin.editdocument.0" /></title>
    </stripes:layout-component>
    <stripes:layout-component name="body">
        <div id="formcontent">
            <stripes:errors/>
            <stripes:messages/>
            <stripes:form beanclass="nl.b3p.viewer.admin.stripes.DocumentActionBean">
                <c:choose>
                    <c:when test="${actionBean.context.eventName == 'edit'}">
                    <h1 id="headertext"><fmt:message key="viewer_admin.editdocument.1" /></h1>
                    <stripes:hidden name="document" value="${actionBean.document.id}"/>
                    <table class="formtable">
                        <tr>
                            <td><fmt:message key="viewer_admin.editdocument.2" /> *:</td>
                            <td><stripes:text name="document.name" maxlength="255" size="30"/></td>
                        </tr>
                        <tr>
                            <td><fmt:message key="viewer_admin.editdocument.3" />:</td>
                            <td><stripes:text name="document.category" maxlength="255" size="30"/></td>
                        </tr>
                        <tr>
                            <td><fmt:message key="viewer_admin.editdocument.4" /> *:</td>
                            <td><stripes:text name="document.url" maxlength="255" size="30"/></td>
                        </tr>
                    </table>
                    <div class="submitbuttons">
                        <fmt:message key="viewer_admin.editdocument.5" var="editdocument5" />
                        <fmt:message key="viewer_admin.editdocument.6" var="editdocument6" />
                        <stripes:submit name="save" value="${editdocument5}"/>
                        <stripes:reset name="cancel" class="extlikebutton" value="${editdocument6}"/>
                    </div>
                </c:when>
                <c:otherwise>
                    <script type="text/javascript">
                        var frameParent = getParent();
                        if(frameParent && frameParent.vieweradmin_components_Document) {
                            frameParent.vieweradmin_components_Document.reloadGrid();
                        }
                    </script>
                    <fmt:message key="viewer_admin.editdocument.7" var="editdocument7" />
                    <stripes:submit name="edit" value="${editdocument7}"/>
                </c:otherwise>
            </c:choose>
        </stripes:form>
        </div>
        <script type="text/javascript">
            Ext.onReady(function() {
                appendPanel('headertext', 'formcontent');
            });
        </script>
    </stripes:layout-component>
</stripes:layout-render>