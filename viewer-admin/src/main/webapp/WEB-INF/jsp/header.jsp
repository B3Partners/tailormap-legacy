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

<div id="header">
    <div id="menu">
        <ul>
<stripes:useActionBean var="bean1" beanclass="nl.b3p.viewer.admin.stripes.GeoServiceRegistryActionBean"/>
<security:allowed bean="bean1">
            <li class="menu-level1">
                <a href="#">Gegevensregister</a>
                <ul class="slideoutmenu">
                    <li><stripes:link beanclass="nl.b3p.viewer.admin.stripes.GeoServiceRegistryActionBean" id="menu_services">Services en Kaartlagen</stripes:link></li>
                    <li>
                        <a href="#" class="dropdownmenulink">Bronnen</a>
                        <ul class="dropdownmenu">
                            <li><stripes:link beanclass="nl.b3p.viewer.admin.stripes.AttributeSourceActionBean" id="menu_attribuutbronnen">Attribuutbronnen</stripes:link></li>
                            <li><stripes:link beanclass="nl.b3p.viewer.admin.stripes.AttributeActionBean" id="menu_attributen">Attributen</stripes:link></li>
                            <li><stripes:link beanclass="nl.b3p.viewer.admin.stripes.ConfigureSolrActionBean" id="menu_solrconfig">Zoekbronnen</stripes:link></li>
                            <li><stripes:link beanclass="nl.b3p.viewer.admin.stripes.FeatureTypeRelationActionBean" id="menu_relation">Join/Relate</stripes:link></li>
                            <li><stripes:link beanclass="nl.b3p.viewer.admin.stripes.CycloramaConfigurationActionBean" id="menu_cyclorama">Cyclorama</stripes:link></li>
                            <li><stripes:link beanclass="nl.b3p.viewer.admin.stripes.LayarServiceActionBean" id="menu_layarservices">Layar services</stripes:link></li>
                            <li><stripes:link beanclass="nl.b3p.viewer.admin.stripes.LayarSourceActionBean" id="menu_layarsource">Layar bronnen</stripes:link></li>
                       </ul>
                    </li>
                    <li><stripes:link beanclass="nl.b3p.viewer.admin.stripes.DocumentActionBean" id="menu_documenten">Documenten</stripes:link></li>
                    <li><stripes:link beanclass="nl.b3p.viewer.admin.stripes.ServiceUsageMatrixActionBean" id="menu_serviceusagematrix">Service Gebruiks Matrix</stripes:link></li>
                    <li><stripes:link beanclass="nl.b3p.viewer.admin.stripes.BookmarkActionBean" id="menu_bookmarks">Beheer bookmarks</stripes:link></li>
                </ul>
            </li>
</security:allowed>

<stripes:useActionBean var="bean2" beanclass="nl.b3p.viewer.admin.stripes.UserActionBean"/>
<security:allowed bean="bean2">
            <li class="menu-level1">
                <a href="#">Beheer toegang</a>
                <ul class="slideoutmenu">
                    <li><stripes:link beanclass="nl.b3p.viewer.admin.stripes.GroupActionBean" id="menu_gebruikersgroepen">Gebruikersgroepen</stripes:link></li>
                    <li><stripes:link beanclass="nl.b3p.viewer.admin.stripes.UserActionBean" id="menu_gebruikers">Gebruikers</stripes:link></li>
                </ul>
            </li>
</security:allowed>

<stripes:useActionBean var="bean3" beanclass="nl.b3p.viewer.admin.stripes.ChooseApplicationActionBean"/>
<security:allowed bean="bean3">
            <li class="menu-level1">
                <a href="#">Applicatiebeheer</a>
                <ul class="slideoutmenu">
                    <li><stripes:link beanclass="nl.b3p.viewer.admin.stripes.ChooseApplicationActionBean" id="menu_kiesapplicatie">Kies een applicatie</stripes:link></li>
                    <c:if test="${!empty sessionScope['applicationId'] && sessionScope['applicationId'] != -1}">
                        <li id="activeAppMenu">
                            <a href="#" class="dropdownmenulink">Applicatie: <span style="font-style: italic;"><c:out value="${sessionScope['applicationName']}"/></span></a>
                            <ul class="dropdownmenu">
                                <li><stripes:link beanclass="nl.b3p.viewer.admin.stripes.ApplicationSettingsActionBean" id="menu_instellingen">Instellingen</stripes:link></li>
                                <li><stripes:link beanclass="nl.b3p.viewer.admin.stripes.ApplicationTreeActionBean" id="menu_boomstructuur">Boomstructuur met kaarten</stripes:link></li>
                                <li><stripes:link beanclass="nl.b3p.viewer.admin.stripes.ApplicationStartMapActionBean" id="menu_startkaartbeeld">Startkaartbeeld</stripes:link></li>
                                <li><stripes:link beanclass="nl.b3p.viewer.admin.stripes.LayoutManagerActionBean" id="menu_layout">Layout met beschikbare componenten</stripes:link></li>
                            </ul>
                        </li>
                    </c:if>
                </ul>
</security:allowed>
            </li>
        </ul>
        <div id="userinfo">
            <fmt:message key="locale"/>: <%= request.getLocale().getLanguage() %> |
            Ingelogd als: <b><c:out value="${pageContext.request.remoteUser}"/> | </b>
            <stripes:link style="color: white" href="/logout.jsp">Uitloggen</stripes:link>
        </div>

    </div>

</div>