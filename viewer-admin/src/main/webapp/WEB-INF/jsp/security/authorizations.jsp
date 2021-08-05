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

<%@page import="nl.tailormap.viewer.config.app.ConfiguredComponent"%>
<%@page import="nl.tailormap.viewer.util.Coalesce"%>
<%@page import="nl.tailormap.viewer.config.services.GeoService"%>
<%@page import="org.stripesstuff.stripersist.Stripersist"%>
<%@page import="nl.tailormap.viewer.config.security.Authorizations"%>
<%@page import="java.util.Set"%>
<%@page import="nl.tailormap.viewer.config.app.ApplicationLayer"%>
<%@page import="nl.tailormap.viewer.config.app.Level"%>
<%@page import="nl.tailormap.viewer.config.services.Layer"%>
<%@page import="nl.tailormap.viewer.admin.stripes.UserActionBean"%>
<%@ page import="nl.tailormap.viewer.helpers.AuthorizationsHelper" %>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@include file="/WEB-INF/jsp/taglibs.jsp"%>

<stripes:layout-render name="/WEB-INF/jsp/templates/ext.jsp">
    <stripes:layout-component name="head">
        <title><fmt:message key="viewer_admin.authorizations.0" /> <c:out value="${actionBean.user.username}"/></title>
    </stripes:layout-component>
    <stripes:layout-component name="body">
        <div class="textcontent">
            <h1 id="headertext"><fmt:message key="viewer_admin.authorizations.1" /> <c:out value="${actionBean.user.username}"/></h1>
            <stripes:errors/>
            <stripes:messages/>
            <h2><fmt:message key="viewer_admin.authorizations.2" /></h2>
            <c:forEach var="g" varStatus="status" items="${actionBean.user.groups}">${status.index > 0 ? "," : ""}
                <c:out value="${g.name}"/></c:forEach>
                <h2 style=""><fmt:message key="viewer_admin.authorizations.3" /></h2>
                <p style="font-style: italic;"><fmt:message key="viewer_admin.authorizations.4" /></p>

            <% UserActionBean actionBean = (UserActionBean) pageContext.findAttribute("actionBean");
                Set readers, writers;
            %>
            <table class="formtable" border="1">
                <thead><tr><th><fmt:message key="viewer_admin.authorizations.5" /></th><th><fmt:message key="viewer_admin.authorizations.6" /></th></th><th><fmt:message key="viewer_admin.authorizations.7" /> <c:out value="${actionBean.user.username}"/></th><th><fmt:message key="viewer_admin.authorizations.8" /></th><th><fmt:message key="viewer_admin.authorizations.9" /></th></thead>
                <tnody>
                    <c:forEach var="e" items="<%= AuthorizationsHelper.serviceCache.entrySet()%>">
                        <c:set var="gsId" value="${e.key}"/>
                        <c:set var="protectedLayers" value="${e.value.protectedLayers}"/>

                        <c:if test="${!empty protectedLayers}">
                            <% GeoService gs = Stripersist.getEntityManager().find(GeoService.class, pageContext.getAttribute("gsId"));%>
                            <tr>
                                <th colspan="5" style="text-align: center">service ${gsId} - <c:out value="<%= gs.getName()%>"/> - <fmt:formatDate pattern="yyyy-MM-dd HH:mm:ss" value="${e.value.modified}"/></th>
                            </tr>

                            <c:forEach var="e" items="${protectedLayers}">
                                <c:set var="layerId" value="${e.key}"/>
                                <c:set var="readers" value="${e.value.readers}"/>
                                <c:set var="writers" value="${e.value.writers}"/>
                                <% Layer layer = Stripersist.getEntityManager().find(Layer.class, pageContext.getAttribute("layerId"));%>

                                <tr>
                                    <td>${layerId}</td>
                                    <td><c:out value="<%= layer.getName()%>"/></td>
                                    <td>
                                        <%
                                            if (actionBean.getAuthorizedLayers().contains(layer)) {
                                                boolean editable = actionBean.getAuthorizedEditableLayers().contains(layer);
                                                out.print("<span style=\"color: green !important\">Read" + (editable ? " and write" : "") + "</span>");
                                            } else {
                                                out.print("<span style=\"color: red !important\">None</span>");
                                            }
                                        %>
                                    </td>
                                    <%
                                        readers = (Set) pageContext.getAttribute("readers");
                                        writers = (Set) pageContext.getAttribute("writers");
                                    %>
                                    <td><%= readers.isEmpty() ? "<i>any</i>" : (readers.iterator().next() == null ? "<i>none</i>" : readers.toString())%></td>
                                    <td><%= writers.isEmpty() ? "<i>any</i>" : (writers.iterator().next() == null ? "<i>none</i>" : writers.toString())%></td>
                                </tr>

                            </c:forEach>
                        </c:if>
                    </c:forEach>
                </tbody>
            </table>

            <c:if test="${actionBean.application != null}">
                <h2><fmt:message key="viewer_admin.authorizations.10" /> <c:out value="${actionBean.application.name}"/> <c:if test="${actionBean.application.version != null}">v${actionBean.application.version}</c:if></h2>
                <h3><fmt:message key="viewer_admin.authorizations.11" /></h3>
                <p style="font-style: italic;"><fmt:message key="viewer_admin.authorizations.12" /></p>
                <table class="formtable" border="1">
                    <thead><tr><th><fmt:message key="viewer_admin.authorizations.13" /></th><th><fmt:message key="viewer_admin.authorizations.14" /></th><th><fmt:message key="viewer_admin.authorizations.15" /> <c:out value="${actionBean.user.username}"/></th><th><fmt:message key="viewer_admin.authorizations.16" /></th></thead>
                    <tbody>
                        <c:forEach var="e" items="<%= actionBean.getApplicationCache().getProtectedLevels().entrySet()%>">
                            <c:set var="levelId" value="${e.key}"/>
                            <c:set var="readers" value="${e.value.readers}"/>
                            <% Level level = Stripersist.getEntityManager().find(Level.class, pageContext.getAttribute("levelId"));%>
                            <tr>
                                <td>${levelId}</td>
                                <td><c:out value="<%= level.getName()%>"/></td>
                                <td>
                                    <%
                                        if (actionBean.getAuthorizedLevels().contains(level)) {
                                            out.print("<span style=\"color: green !important\">Yes</span>");
                                        } else {
                                            out.print("<span style=\"color: red !important\">No</span>");
                                        }
                                    %>
                                </td>
                                <%
                                    readers = (Set) pageContext.getAttribute("readers");
                                %>
                                <td><%= readers.isEmpty() ? "<i>any</i>" : (readers.iterator().next() == null ? "<i>none</i>" : readers.toString())%></td>
                            </tr>
                        </c:forEach>
                    </tbody>
                </table>
                <h3>Kaartlagen</h3>
                <p style="font-style: italic;"><fmt:message key="viewer_admin.authorizations.17" /></p>
                <table class="formtable" border="1">
                    <thead><tr><th><fmt:message key="viewer_admin.authorizations.18" /></th><th><fmt:message key="viewer_admin.authorizations.19" /></th><th><fmt:message key="viewer_admin.authorizations.20" /></th><th><fmt:message key="viewer_admin.authorizations.21" /> <c:out value="${actionBean.user.username}"/></th><th><fmt:message key="viewer_admin.authorizations.22" /></th><th><fmt:message key="viewer_admin.authorizations.23" /></th></thead>
                    <tbody>
                        <c:forEach var="e" items="<%= actionBean.getApplicationCache().getProtectedAppLayers().entrySet()%>">
                            <c:set var="alId" value="${e.key}"/>
                            <c:set var="readers" value="${e.value.readers}"/>
                            <c:set var="writers" value="${e.value.writers}"/>
                            <% 
                                ApplicationLayer applicationLayer = Stripersist.getEntityManager().find(ApplicationLayer.class, pageContext.getAttribute("alId"));
                                Layer alLayer = applicationLayer.getService().getLayer(applicationLayer.getLayerName(), Stripersist.getEntityManager());
                            %>

                            <tr>
                                <td>${alId}</td>
                                <td><%= applicationLayer.getService().getId()%> - <c:out value="<%= applicationLayer.getService().getName()%>"/></td>
                                <td><%= alLayer != null ? Coalesce.coalesce(alLayer.getTitleAlias(), alLayer.getTitle(), alLayer.getName()) : applicationLayer.getLayerName()%></td>
                                <td><%
                                    if (actionBean.getAuthorizedAppLayers().contains(applicationLayer)) {
                                        boolean editable = actionBean.getAuthorizedEditableAppLayers().contains(applicationLayer);
                                        out.print("<span style=\"color: green !important\">Read" + (editable ? " and write" : "") + "</span>");
                                    } else {
                                        out.print("<span style=\"color: red !important\">None</span>");
                                    }
                                    %>
                                </td>
                                <%
                                    readers = (Set) pageContext.getAttribute("readers");
                                    writers = (Set) pageContext.getAttribute("writers");
                                %>
                                <td><%= readers.isEmpty() ? "<i>any</i>" : (readers.iterator().next() == null ? "<i>none</i>" : readers.toString())%></td>
                                <td><%= writers.isEmpty() ? "<i>any</i>" : (writers.iterator().next() == null ? "<i>none</i>" : writers.toString())%></td>
                            </tr>
                        </c:forEach>
                    </tbody>
                </table>            
                <h3><fmt:message key="viewer_admin.authorizations.24" /></h3>
                <p style="font-style: italic;"><fmt:message key="viewer_admin.authorizations.25" /></p>
                <table class="formtable" border="1">
                    <thead><tr><th><fmt:message key="viewer_admin.authorizations.26" /></th><th><fmt:message key="viewer_admin.authorizations.27" /></th><th><fmt:message key="viewer_admin.authorizations.28" /> <c:out value="${actionBean.user.username}"/></th><th><fmt:message key="viewer_admin.authorizations.29" /></th></thead>
                    <tbody>
                        <c:forEach var="cc" items="<%= actionBean.getApplication().getComponents()%>">
                            <c:if test="${!empty cc.readers}">
                                <c:set var="ccName" value="${cc.name}"/>
                                <c:set var="readers" value="${cc.readers}"/>
                                <tr>
                                    <td><c:out value="${cc.className}"/></td>
                                    <td><c:out value="${cc.name}"/></td>
                                    <td>
                                        <%
                                            ConfiguredComponent cc = (ConfiguredComponent) pageContext.getAttribute("cc");
                                            if (actionBean.getAuthorizedComponents().contains(cc)) {
                                                out.print("<span style=\"color: green !important\">Yes</span>");
                                            } else {
                                                out.print("<span style=\"color: red !important\">No</span>");
                                            }
                                        %>
                                    </td>
                                    <%
                                        readers = (Set) pageContext.getAttribute("readers");
                                    %>
                                    <td><%= readers.isEmpty() ? "<any>" : (readers.iterator().next() == null ? "<i>none</i>" : readers.toString())%></td>
                                </tr>
                            </c:if>
                        </c:forEach>
                    </tbody>
                </table>
            </c:if>

            <stripes:form beanclass="nl.tailormap.viewer.admin.stripes.UserActionBean">

                <stripes:hidden name="user"/>
                <p>
                    <fmt:message key="viewer_admin.authorizations.30" />: <stripes:select name="application">
                        <c:forEach var="app" items="${actionBean.applications}">
                            <stripes:option value="${app}"><c:out value="${app.name}"/>  <c:if test="${app.version != null}">v${app.version}</c:if></stripes:option>
                        </c:forEach>
                    </stripes:select>
                </p>
                <stripes:submit name="authorizations"><fmt:message key="viewer_admin.authorizations.31" /></stripes:submit>
            </stripes:form>
        </div>        
    </stripes:layout-component>
</stripes:layout-render>
