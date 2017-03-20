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
        <title>Edit gebruiker groep</title>
    </stripes:layout-component>
    <stripes:layout-component name="body">
        <div id="formcontent">
            <stripes:errors/>
            <stripes:messages/>
            <stripes:form beanclass="nl.b3p.viewer.admin.stripes.GroupActionBean">
                <c:choose>
                    <c:when test="${actionBean.context.eventName == 'edit'}">
                    <h1 id="headertext">Gebruikers groep bewerken</h1>
                    <stripes:hidden name="group" value="${actionBean.group.name}"/>
                    <table class="formtable">
                        <tr>
                            <td valign="top" style="height: 30px;">Naam *:</td>
                            <td valign="top"><stripes:text name="name" disabled="${!empty actionBean.group.name}" maxlength="255" size="30"/></td>
                        </tr>
                        <tr>
                            <td valign="top">Extra informatie:</td>
                            <td valign="top"><stripes:textarea name="description" cols="27" rows="4" class="extliketextarea" /></td>
                        </tr>
                    </table>
                    <div class="submitbuttons">
                        <stripes:submit name="save" value="Opslaan"/>
                        <stripes:reset class="extlikebutton" name="cancel" value="Annuleren"/>
                    </div>
                </c:when>
                <c:when test="${actionBean.context.eventName == 'save' || actionBean.context.eventName == 'delete'}">
                        <script type="text/javascript">
                            var frameParent = getParent();
                            if(frameParent && frameParent.reloadGrid) {
                                frameParent.reloadGrid();
                            }
                        </script>
                        <stripes:submit name="edit" value="Nieuwe groep"/>
                </c:when>
                <c:otherwise>
                    <stripes:submit name="edit" value="Nieuwe groep"/>
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
