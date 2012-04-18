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
        </p>
        <stripes:form beanclass="nl.b3p.viewer.admin.stripes.ApplicationTreeLayerActionBean" id="apptreelayerform">
            <stripes:hidden name="applicationLayer" value="${actionBean.applicationLayer.id}"/>
            <stripes:hidden name="attributesJSON" id="attributesJSON" value="${actionBean.attributesJSON}"/>
            <c:if test="${actionBean.context.eventName == 'edit'}">
                <h1>Bewerken kaartlaag</h1>
                <br>
                <stripes:submit name="save" value="Opslaan" />
                <stripes:submit name="cancel" value="Annuleren"/>
                <br /><br />
                <div id="tabs">
                    <div id="rights-tab" class="x-hide-display">
                        <h1>Rechten:</h1>
                        L &nbsp; B <br/>
                        <c:forEach var="group" items="${actionBean.allGroups}">
                            <stripes:checkbox name="groupsRead" value="${group.name}"/>
                            <stripes:checkbox name="groupsWrite" value="${group.name}"/>
                            ${group.name}<br/>
                        </c:forEach>
                    </div>
                    <div id="attributes-tab" class="x-hide-display"><div>
                        <c:choose>
                            <c:when test="${not empty actionBean.attributesList}">
                                <c:forEach var="attribute" items="${actionBean.attributesList}">
                                    <stripes:checkbox name="selectedAttributes" value="${attribute.name}"/>
                                    <c:choose>
                                        <c:when test="${not empty attribute.alias}">
                                            ${attribute.alias}
                                        </c:when>
                                        <c:otherwise>
                                            ${attribute.name}
                                        </c:otherwise>
                                    </c:choose>
                                    <br>
                                </c:forEach>
                            </c:when>
                            <c:otherwise>
                                Er zijn geen attributen voor deze kaartlaag geconfigureerd.
                            </c:otherwise>
                        </c:choose>
                        </div>
                    </div>
                    <div id="settings-tab" class="x-hide-display">
                        <table class="formtable">
                            <tr>
                                <td>Transparantie beginwaarde:</td>
                                <td><stripes:text name="details['transparency']" maxlength="255" size="10"/></td>
                            </tr>
                            <tr>
                                <td>Straalinvloedsgebied:</td>
                                <td><stripes:text name="details['influenceradius']" maxlength="255" size="10"/></td>
                            </tr>
                            <tr>
                                <td>Samenvatting - titel:</td>
                                <td><stripes:text name="details['summary.title']" maxlength="255" size="30"/></td>
                            </tr>
                            <tr>
                                <td>Samenvatting - afbeelding:</td>
                                <td><stripes:text name="details['summary.image']" maxlength="255" size="30"/></td>
                            </tr>
                            <tr>
                                <td>Samenvatting - omschrijving:</td>
                                <td><stripes:textarea name="details['summary.description']" rows="5" cols="27"/></td>
                            </tr>
                            <tr>
                                <td>Samenvatting - link:</td>
                                <td><stripes:text name="details['summary.link']" maxlength="255" size="30"/></td>
                            </tr>
                            <tr>
                                <td>EditFunctionaliteit - titel:</td>
                                <td><stripes:text name="details['editfunction.title']" maxlength="255" size="30"/></td>
                            </tr>
                        </table>
                    </div>
                    <div id="edit-tab" class="x-hide-display">
                        <c:choose>
                            <c:when test="${actionBean.editable}">
                                Er zijn geen attributen voor deze kaartlaag geconfigureerd.
                            </c:when>
                            <c:otherwise>
                                De attribuutbron van deze kaartlaag is niet van het type JDBC en is daarom niet editbaar.
                            </c:otherwise>
                        </c:choose>
                    </div>
                    <div id="filter-tab" class="x-hide-display">
                        Er zijn geen attributen voor deze kaartlaag geconfigureerd.
                    </div>
                </div>
                <script type="text/javascript">
                    var attributes = ${actionBean.attributesJSON};
                    var getDBValuesUrl = '';
                    var editable = ${actionBean.editable};
                    var imagesPath = "${contextPath}/resources/images/";
                </script>
                <script type="text/javascript" src="${contextPath}/resources/js/application/applicationTreeLayer.js"></script>
            </c:if>
        </stripes:form>
    </stripes:layout-component>
</stripes:layout-render>
