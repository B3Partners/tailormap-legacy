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
        <title><fmt:message key="viewer_admin.editattribute.0" /></title>
    </stripes:layout-component>
    <stripes:layout-component name="body">
        <div id="formcontent">
            <stripes:errors/>
            <stripes:messages/>
            <stripes:form beanclass="nl.b3p.viewer.admin.stripes.FormActionBean">
                <stripes:hidden name="form" value="${actionBean.form.id}"/>
                <c:choose>
                <c:when test="${actionBean.context.eventName == 'edit' || actionBean.context.eventName == 'add'}">
                    <h1 id="headertext">Formulier bewerken</h1>
                    <table class="formtable">
                        <tr>
                            <td><fmt:message key="viewer_admin.editform.name" />:</td>
                            <td><stripes:text name="form.name" maxlength="255" size="30"/></td>
                        </tr>
                        <tr>
                            <td><fmt:message key="viewer_admin.editform.ft" />:</td>
                            <td><stripes:text name="form.featureTypeName" maxlength="255" size="30"/></td>
                        </tr>
                        <tr>
                            <td><fmt:message key="viewer_admin.editform.formconfig" /> *:</td>
                            <td><stripes:textarea name="form.json"  cols="100" rows="15"/></td>
                        </tr>
                    </table>
                    <div class="submitbuttons">
                        <fmt:message key="viewer_admin.editattribute.3" var="editattribute3" />
                        <fmt:message key="viewer_admin.editattribute.4" var="editattribute4" />
                        <stripes:submit name="save" value="${editattribute3}"/>
                        <stripes:reset name="cancel" class="extlikebutton" value="${editattribute4}"/>
                    </div>
                </c:when>
                <c:when test="${actionBean.context.eventName == 'save' || actionBean.context.eventName == 'delete'}">
                    <script type="text/javascript">
                        var frameParent = getParent();
                        if(frameParent && frameParent.vieweradmin_components_FormSource) {
                            frameParent.vieweradmin_components_FormSource.reloadGrid();
                        }
                    </script>
                </c:when>
                    <c:otherwise>

                        <stripes:submit name="add" value="add">Voeg toe</stripes:submit>
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
