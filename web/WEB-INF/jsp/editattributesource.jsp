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
        <title>Bewerk Attribuutbron</title>
    </stripes:layout-component>
    <stripes:layout-component name="body">
        <c:choose>
            <c:when test="${!empty actionBean.sourceId && actionBean.sourceId != 0}">
                <h1>Attribuutbron bewerken: ${actionBean.sourceId}</h1>
            </c:when>
            <c:otherwise>
                <h1>Nieuwe attribuutbron toevoegen</h1>
            </c:otherwise>
        </c:choose>
                
                <stripes:form beanclass="nl.b3p.viewer.admin.stripes.AttributeSourceActionBean">
                    <table>
                        <tr>
                            <td>Naam:</td>
                            <td><stripes:text name="name" maxlength="255" size="30"/></td>
                        </tr>
                        <tr>
                            <td>Bron URL:</td>
                            <td><stripes:text name="url" maxlength="255" size="30"/></td>
                        </tr>
                        <tr>
                            <td>Type:</td>
                            <td>
                                <stripes:select name="protocol">
                                    <stripes:option value="wfs">WFS</stripes:option>
                                    <stripes:option value="arcgis">ArcGIS Server</stripes:option>
                                    <stripes:option value="arcxml">ArcXml</stripes:option>
                                    <stripes:option value="jdbc">JDBC</stripes:option>
                                </stripes:select>
                            </td>
                        </tr>
                        <tr>
                            <td>Gebruikersnaam:</td>
                            <td><stripes:text name="username" maxlength="255" size="30"/></td>
                        </tr>
                        <tr>
                            <td>Wachtwoord:</td>
                            <td><stripes:text name="password" maxlength="255" size="30"/></td>
                        </tr>
                    </table>
                    <stripes:submit name="saveAttributeSource" value="Opslaan"/>
                </stripes:form>
    </stripes:layout-component>
</stripes:layout-render>