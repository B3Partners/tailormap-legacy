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
        <title>Applicatie instellingen</title>
    </stripes:layout-component>
    <stripes:layout-component name="header">
        <jsp:include page="/WEB-INF/jsp/header.jsp"/>
    </stripes:layout-component>
    <stripes:layout-component name="body">
            <div id="content">
                <p>
                <stripes:errors/>
                <stripes:messages/>
                <h1>Applicatie instellingen: <c:out value="${actionBean.application.name}"/> <c:if test="${!empty actionBean.application.version}">(v${actionBean.application.version})</c:if></h1>
                </p>
                <stripes:form beanclass="nl.b3p.viewer.admin.stripes.ApplicationSettingsActionBean">
                    <stripes:hidden name="application" value="${actionBean.application.id}"/>
                <table>
                    <tr>
                        <td>Naam:</td>
                        <td><stripes:text name="name" value="${actionBean.application.name}" maxlength="255" size="30"/></td>
                        <td rowspan="9">Opmerkingen<br><stripes:textarea cols="80" rows="5" name="details['opmerking']"/></td>
                    </tr>
                    <tr>
                        <td>Versie:</td>
                        <td><stripes:text name="version" value="${actionBean.application.version}" maxlength="255" size="30"/></td>
                    </tr>
                    <tr>
                        <td>Steunkleur 1:</td>
                        <td><stripes:text name="details['steunkleur1']" maxlength="255" size="30"/></td>
                    </tr>
                    <tr>
                        <td>Steunkleur 2:</td>
                        <td><stripes:text name="details['steunkleur2']" maxlength="255" size="30"/></td>
                    </tr>
                    <tr>
                        <td>Spritebestand icoontjes:</td>
                        <td><stripes:text name="details['iconSprite']" maxlength="255" size="30"/></td>
                    </tr>
                    <tr>
                        <td>Stylesheet metadata:</td>
                        <td><stripes:text name="details['stylesheetMetadata']" maxlength="255" size="30"/></td>
                    </tr>
                    <tr>
                        <td>Stylesheet feature info:</td>
                        <td><stripes:text name="details['stylesheetfeatureInfo']" maxlength="255" size="30"/></td>
                    </tr>
                    <tr>
                        <td>Stylesheet printen:</td>
                        <td><stripes:text name="details['stylesheetPrint']" maxlength="255" size="30"/></td>
                    </tr>
                    <tr>
                        <td>Eigenaar:</td>
                        <td><stripes:text name="owner" maxlength="255" size="30"/></td>
                    </tr>
                    <tr>
                        <td>Start extensie:</td>
                        <td>
                            lo-x <stripes:text name="startExtent.minx" maxlength="255" size="3"/>
                            lo-y <stripes:text name="startExtent.miny" maxlength="255" size="3"/>
                            rb-x <stripes:text name="startExtent.maxx" maxlength="255" size="3"/>
                            rb-y <stripes:text name="startExtent.maxy" maxlength="255" size="3"/>
                        </td>
                    </tr>
                    <tr>
                        <td>Maximale extensie:</td>
                        <td>
                            lo-x <stripes:text name="maxExtent.minx" maxlength="255" size="3"/>
                            lo-y <stripes:text name="maxExtent.miny" maxlength="255" size="3"/>
                            rb-x <stripes:text name="maxExtent.maxx" maxlength="255" size="3"/>
                            rb-y <stripes:text name="maxExtent.maxy" maxlength="255" size="3"/>
                        </td>
                    </tr>
                </table>   
                    <stripes:checkbox name="authenticatedRequired" value="${actionBean.application.authenticatedRequired}"/> Inloggen verplicht<br>
                    <stripes:submit name="save" value="Opslaan"/>
                    <stripes:submit name="cancel" value="Annuleren"/>
                </stripes:form>
            </div>
        <script type="text/javascript">
            var activelink = 'menu_instellingen';
        </script>
    </stripes:layout-component>
</stripes:layout-render>
