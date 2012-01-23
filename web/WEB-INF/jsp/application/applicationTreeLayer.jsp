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
    <stripes:layout-component name="body">

        <p>
        <stripes:errors/>
        <stripes:messages/>
        <p>
        <stripes:form beanclass="nl.b3p.viewer.admin.stripes.ApplicationTreeLayerActionBean">
            <stripes:hidden name="applicationLayer" value="${actionBean.applicationLayer.id}"/>
            <c:if test="${actionBean.context.eventName == 'edit'}">
                <stripes:submit name="save" value="Opslaan" />
                <stripes:submit name="cancel" value="Annuleren"/>
                <br /><br />
                <div id="tabs">
                    <div id="rights-tab" class="x-hide-display">
                        <h1>Rechten:</h1>
                        L &nbsp; B <br>
                        <c:forEach var="group" items="${actionBean.allGroups}">
                            <stripes:checkbox name="groupsRead" value="${group.name}"/>
                            <stripes:checkbox name="groupsWrite" value="${group.name}"/>
                            ${group.name}<br>
                        </c:forEach>
                    </div>
                    <div id="attributes-tab" class="x-hide-display">
                        Attributen
                    </div>
                    <div id="settings-tab" class="x-hide-display">
                        <table>
                            <tr>
                                <td>Transparantie beginwaarde:</td>
                                <td><stripes:text name="details['transparantie']" maxlength="255" size="30"/></td>
                            </tr>
                            <tr>
                                <td>Straalinvloedsgebied:</td>
                                <td><stripes:text name="details['straalinvloedsgebied']" maxlength="255" size="30"/></td>
                            </tr>
                            <tr>
                                <td>Samenvatting - titel:</td>
                                <td><stripes:text name="details['samenvatting.titel']" maxlength="255" size="30"/></td>
                            </tr>
                            <tr>
                                <td>Samenvatting - afbeelding:</td>
                                <td><stripes:text name="details['samenvatting.afbeelding']" maxlength="255" size="30"/></td>
                            </tr>
                            <tr>
                                <td>Samenvatting - omschrijving:</td>
                                <td><stripes:textarea name="details['samenvatting.omschrijving']" rows="5" cols="27"/></td>
                            </tr>
                            <tr>
                                <td>Samenvatting - link:</td>
                                <td><stripes:text name="details['samenvatting.link']" maxlength="255" size="30"/></td>
                            </tr>
                            <tr>
                                <td>EditFunctionaliteit - titel:</td>
                                <td><stripes:text name="details['editfunctie.titel']" maxlength="255" size="30"/></td>
                            </tr>
                        </table>
                    </div>
                    <div id="edit-tab" class="x-hide-display">
                        Edit
                    </div>
                    <div id="filter-tab" class="x-hide-display">
                        Selectie en filter
                    </div>
                </div>
            </c:if>
        </stripes:form>
        <script type="text/javascript" src="${contextPath}/resources/js/application/applicationTreeLayer.js"></script>
    </stripes:layout-component>
</stripes:layout-render>
