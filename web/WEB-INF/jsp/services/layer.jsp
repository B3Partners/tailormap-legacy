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
        <title>Bewerk layer</title>
    </stripes:layout-component>
    <stripes:layout-component name="body">
        <p>
        <stripes:errors/>
        <stripes:messages/>
        <p>
        <stripes:form beanclass="nl.b3p.viewer.admin.stripes.LayerActionBean">
        <c:if test="${actionBean.context.eventName == 'edit'}"> 
        <h1>Layer bewerken</h1>
        <stripes:hidden name="layer" value="${actionBean.layer.id}"/>
        
        <table>
            <tr>
                <td>Naam: 
                <td><stripes:text name="layer.titleAlias" maxlength="255" size="30"/></td>
            </tr>
            <tr>     
                <td>Layer:</td> 
                <td><stripes:text name="layer.title" disabled="true" maxlength="255" size="30"/></td>
            </tr>
            <tr>     
                <td>Legenda:</td> 
                <td><stripes:text name="layer.legendImageUrl" maxlength="255" size="30"/></td>
            </tr>
            <tr>     
                <td>Metadata:</td> 
                <td><stripes:text name="details['metadata.stylesheet']" maxlength="255" size="30"/></td>
            </tr>
            <tr>     
                <td>Downloadlink:</td> 
                <td><stripes:text name="details['download.url']" maxlength="255" size="30"/></td>
            </tr>
            <tr>
                <td valign="top">
                    <h1>Groepen:</h1>
                    L &nbsp; B <br>

                        <c:forEach var="group" items="${actionBean.allGroups}">
                            <stripes:checkbox name="groupsRead" value="${group.name}"/>
                            <stripes:checkbox name="groupsWrite" value="${group.name}"/>${group.name}<br>
                        </c:forEach>

                </td>
            </tr>
            <tr>
                <td>
                    <h1>Kaartlaag wordt gebruikt in de volgende applicaties:</h1>
                    <c:if test="${not empty actionBean.applicationsUsedIn}">
                        <c:forEach var="name" items="${actionBean.applicationsUsedIn}">
                            <c:out value="${name}"/><br>
                        </c:forEach>
                    </c:if>
                </td>
            </tr>
        </table>
        
        <stripes:submit name="save" value="Kaartlaag opslaan"/>
        <stripes:submit name="cancel" value="Annuleren"/>
        </c:if>
        </stripes:form>
        
        <c:if test="${actionBean.context.eventName == 'save'}">
            <script type="text/javascript">
                var frameParent = getParent();
                if(frameParent && frameParent.renameNode && '${actionBean.layer.titleAlias}' != '') {
                    frameParent.renameNode('l${actionBean.layer.id}','${actionBean.layer.titleAlias}');
                }
            </script>
        </c:if>
    </stripes:layout-component>
</stripes:layout-render>