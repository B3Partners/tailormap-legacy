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
        <title>Bewerk Geoservice</title>
    </stripes:layout-component>
    <stripes:layout-component name="body">
        <stripes:form id="saveForm" beanclass="nl.b3p.viewer.admin.stripes.GeoServiceActionBean">
            <c:if test="${!empty actionBean.serviceId || !empty actionBean.parentId}">
                <c:choose>
                    <c:when test="${!empty actionBean.serviceId}">
                        <h1>Geoservice bewerken</h1>
                        Parent ID: ${actionBean.parentId}<br />
                        Service ID: ${actionBean.serviceId}
                    </c:when>
                    <c:when test="${!empty actionBean.parentId}">
                        <h1>Geoservice toevoegen</h1>
                        Parent ID: ${actionBean.parentId}
                    </c:when>
                </c:choose>
                <div>
                    Naam: <stripes:text name="service.name"/><br />
                    Url: <stripes:text name="service.url"/><br />
                    Type: 
                    <stripes:select id="serviceType" name="service.serviceType">
                        <c:forEach var="types" items="${actionBean.serviceTypes}">
                            <stripes:option  value="${types}"><c:out value="${types}"/></stripes:option>
                        </c:forEach>
                    </stripes:select>
                    <br />
                    Gebruikersnaam: <stripes:text name="service.username"/><br />
                    Wachtwoord: <stripes:text name="service.password"/><br />
                    <stripes:submit name="saveGeoService" value="opslaan"/><br />
                </div>
            </c:if>
        </stripes:form>
    </stripes:layout-component>
</stripes:layout-render>