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
<stripes:useActionBean var="bean1" beanclass="nl.tailormap.viewer.admin.stripes.GeoServiceRegistryActionBean"/>
<security:allowed bean="bean1">
            <li class="menu-level1">
                <a href="#"><fmt:message key="viewer_admin.header.0" /></a>
                <ul class="slideoutmenu">
                    <li><stripes:link beanclass="nl.tailormap.viewer.admin.stripes.GeoServiceRegistryActionBean" id="menu_services"><fmt:message key="viewer_admin.header.1" /></stripes:link></li>
                    <li>
                        <a href="#" class="dropdownmenulink"><fmt:message key="viewer_admin.header.2" /></a>
                        <ul class="dropdownmenu">
                            <li><stripes:link beanclass="nl.tailormap.viewer.admin.stripes.AttributeSourceActionBean" id="menu_attribuutbronnen"><fmt:message key="viewer_admin.header.3" /></stripes:link></li>
                            <li><stripes:link beanclass="nl.tailormap.viewer.admin.stripes.AttributeActionBean" id="menu_attributen"><fmt:message key="viewer_admin.header.4" /></stripes:link></li>
                            <li><stripes:link beanclass="nl.tailormap.viewer.admin.stripes.ConfigureSolrActionBean" id="menu_solrconfig"><fmt:message key="viewer_admin.header.5" /></stripes:link></li>
                            <li><stripes:link beanclass="nl.tailormap.viewer.admin.stripes.FeatureTypeRelationActionBean" id="menu_relation"><fmt:message key="viewer_admin.header.6" /></stripes:link></li>
                            <li><stripes:link beanclass="nl.tailormap.viewer.admin.stripes.CycloramaConfigurationActionBean" id="menu_cyclorama"><fmt:message key="viewer_admin.header.7" /></stripes:link></li>
                       </ul>
                    </li>
                    <li><stripes:link beanclass="nl.tailormap.viewer.admin.stripes.DocumentActionBean" id="menu_documenten"><fmt:message key="viewer_admin.header.10" /></stripes:link></li>
                    <li><stripes:link beanclass="nl.tailormap.viewer.admin.stripes.FormActionBean" id="menu_forms"><fmt:message key="viewer_admin.header.25" /></stripes:link></li>
                    <li><stripes:link beanclass="nl.tailormap.viewer.admin.stripes.ServiceUsageMatrixActionBean" id="menu_serviceusagematrix"><fmt:message key="viewer_admin.header.11" /></stripes:link></li>
                    <li><stripes:link beanclass="nl.tailormap.viewer.admin.stripes.BookmarkActionBean" id="menu_bookmarks"><fmt:message key="viewer_admin.header.12" /></stripes:link></li>
                </ul>
            </li>
</security:allowed>

<stripes:useActionBean var="bean2" beanclass="nl.tailormap.viewer.admin.stripes.UserActionBean"/>
<security:allowed bean="bean2">
            <li class="menu-level1">
                <a href="#"><fmt:message key="viewer_admin.header.13" /></a>
                <ul class="slideoutmenu">
                    <li><stripes:link beanclass="nl.tailormap.viewer.admin.stripes.GroupActionBean" id="menu_gebruikersgroepen"><fmt:message key="viewer_admin.header.14" /></stripes:link></li>
                    <li><stripes:link beanclass="nl.tailormap.viewer.admin.stripes.UserActionBean" id="menu_gebruikers"><fmt:message key="viewer_admin.header.15" /></stripes:link></li>
                </ul>
            </li>
</security:allowed>

<stripes:useActionBean var="bean3" beanclass="nl.tailormap.viewer.admin.stripes.ChooseApplicationActionBean"/>
<security:allowed bean="bean3">
            <li class="menu-level1">
                <a href="#"><fmt:message key="viewer_admin.header.16" /></a>
                <ul class="slideoutmenu">
                    <li><stripes:link beanclass="nl.tailormap.viewer.admin.stripes.ChooseApplicationActionBean" id="menu_kiesapplicatie"><fmt:message key="viewer_admin.header.17" /></stripes:link></li>
                    <c:if test="${!empty sessionScope['applicationId'] && sessionScope['applicationId'] != -1}">
                        <li id="activeAppMenu">
                            <a href="#" class="dropdownmenulink"><fmt:message key="viewer_admin.header.18" />: <span style="font-style: italic;"><c:out value="${sessionScope['applicationName']}"/></span></a>
                            <ul class="dropdownmenu">
                                <li><stripes:link beanclass="nl.tailormap.viewer.admin.stripes.ApplicationSettingsActionBean" id="menu_instellingen"><fmt:message key="viewer_admin.header.19" /></stripes:link></li>
                                <li><stripes:link beanclass="nl.tailormap.viewer.admin.stripes.ApplicationTreeActionBean" id="menu_boomstructuur"><fmt:message key="viewer_admin.header.20" /></stripes:link></li>
                                <li><stripes:link beanclass="nl.tailormap.viewer.admin.stripes.ApplicationStartMapActionBean" id="menu_startkaartbeeld"><fmt:message key="viewer_admin.header.21" /></stripes:link></li>
                                <li><stripes:link beanclass="nl.tailormap.viewer.admin.stripes.LayoutManagerActionBean" id="menu_layout"><fmt:message key="viewer_admin.header.22" /></stripes:link></li>
                            </ul>
                        </li>
                    </c:if>
                </ul>
</security:allowed>
            </li>
        </ul>
        <div id="userinfo">
            <fmt:message key="locale"/>: <c:out value="${requestLocale}" /> |
            <fmt:message key="viewer_admin.header.23" />: <b><c:out value="${pageContext.request.remoteUser}"/> | </b>
            <stripes:link style="color: white" href="/logout.jsp"><fmt:message key="viewer_admin.header.24" /></stripes:link>
        </div>

    </div>

</div>