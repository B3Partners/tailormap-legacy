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

<%@page import="nl.b3p.viewer.util.Coalesce"%>
<%@page import="nl.b3p.viewer.config.services.GeoService"%>
<%@page import="org.stripesstuff.stripersist.Stripersist"%>
<%@page import="nl.b3p.viewer.config.security.Authorizations"%>
<%@page import="java.util.Set"%>
<%@page import="nl.b3p.viewer.config.app.ApplicationLayer"%>
<%@page import="nl.b3p.viewer.config.app.Level"%>
<%@page import="nl.b3p.viewer.config.services.Layer"%>
<%@page import="nl.b3p.viewer.admin.stripes.UserActionBean"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@include file="/WEB-INF/jsp/taglibs.jsp"%>

<stripes:layout-render name="/WEB-INF/jsp/templates/ext.jsp">
    <stripes:layout-component name="head">
        <title>Autorisatieoverzicht voor gebruiker <c:out value="${actionBean.user.username}"/></title>
    </stripes:layout-component>
    <stripes:layout-component name="body">
        <h1 id="headertext" style="padding: 5px">Autorisatieoverzicht voor gebruiker <c:out value="${actionBean.user.username}"/></h1>
        <div id="formcontent">
        <p>
            <stripes:errors/>
            <stripes:messages/>
        </p>
        <h2 style="padding: 5px">Groeplidmaatschap</h2>
        <c:forEach var="g" varStatus="status" items="${actionBean.user.groups}">${status.index > 0 ? "," : ""}
            <c:out value="${g.name}"/></c:forEach>
        <h2 style="padding-top: 5px">Gegevensregister lagen</h2>
        <p style="font-style: italic; padding: 5px">Lagen die voor alle groepen geautoriseerd zijn worden niet getoond. Een schrijfbare laag is dat 
        praktisch alleen indien attributen ook expliciet editable zijn gemaakt in een kaartlaag en de kaartlaag in een applicatie bij een edit component is geconfigureerd.</p>
        
        <% UserActionBean actionBean = (UserActionBean)pageContext.findAttribute("actionBean"); 
           Set readers, writers;
        %>
        <table class="formtable" border="1">
            <tr><th>ID</th><th>Naam</th></th><th>Rechten voor <c:out value="${actionBean.user.username}"/></th><th>Lezen groepen</th><th>Schrijven groepen</th>
            <c:forEach var="e" items="<%= Authorizations.serviceCache.entrySet() %>">
                <c:set var="gsId" value="${e.key}"/>
                <c:set var="protectedLayers" value="${e.value.protectedLayers}"/>
                
                <c:if test="${!empty protectedLayers}">
                    <% GeoService gs = Stripersist.getEntityManager().find(GeoService.class, pageContext.getAttribute("gsId")); %>
                    <tr>
                        <th colspan="5" style="text-align: center">service ${gsId} - <c:out value="<%= gs.getName() %>"/> - <fmt:formatDate pattern="yyyy-MM-dd HH:mm:ss" value="${e.value.modified}"/></th>
                    </tr>
                    
                    <c:forEach var="e" items="${protectedLayers}">
                        <c:set var="layerId" value="${e.key}"/>
                        <c:set var="readers" value="${e.value.readers}"/>
                        <c:set var="writers" value="${e.value.writers}"/>
                        <% Layer layer = Stripersist.getEntityManager().find(Layer.class, pageContext.getAttribute("layerId")); %>
                        
                        <tr>
                            <td>${layerId}</td>
                            <td><c:out value="<%= layer.getName() %>"/></td>
                            <td>
                                <%
                                if(actionBean.getAuthorizedLayers().contains(layer)) {
                                    boolean editable = actionBean.getAuthorizedEditableLayers().contains(layer);
                                    out.print("<span style=\"color: green !important\">Lezen" + (editable ? " en schrijven" : "") + "</span>");
                                } else {
                                    out.print("<span style=\"color: red !important\">Geen</span>");
                                } 
                                %>
                            </td>
                            <%
                                readers = (Set)pageContext.getAttribute("readers");
                                writers = (Set)pageContext.getAttribute("writers");
                            %>
                            <td><%= readers.isEmpty() ? "<i>iedereen</i>" : (readers.iterator().next() == null ? "<i>niemand</i>" : readers.toString()) %></td>
                            <td><%= writers.isEmpty() ? "<i>iedereen</i>" : (writers.iterator().next() == null ? "<i>niemand</i>" : writers.toString()) %></td>
                        </tr>
                        
                    </c:forEach>
                </c:if>
            </c:forEach>
        </table>
            
        <c:if test="${actionBean.application != null}">
            <h2 style="padding-top: 5px">Autorisaties voor applicatie <c:out value="${actionBean.application.name} ${actionBean.application.version != null ? 'v' + actionBean.application.version : ''}"/></h2>
            <h3 style="padding-top: 5px">Niveau's</h2>
            <p style="font-style: italic; padding: 5px">Niveau's die voor alle groepen geautoriseerd zijn worden niet getoond.</p>
            <table class="formtable" border="1">
                <tr><th>ID</th><th>Naam</th><th>Toegang voor <c:out value="${actionBean.user.username}"/></th><th>Groepen met toegang</th>
                <c:forEach var="e" items="<%= actionBean.getApplicationCache().getProtectedLevels().entrySet()%>">
                    <c:set var="levelId" value="${e.key}"/>
                    <c:set var="readers" value="${e.value.readers}"/>
                    <% Level level = Stripersist.getEntityManager().find(Level.class, pageContext.getAttribute("levelId")); %>
                    
                    <tr>
                        <td>${levelId}</td>
                        <td><c:out value="<%= level.getName() %>"/></td>
                        <td>
                            <%
                            if(actionBean.getAuthorizedLevels().contains(level)) {
                                out.print("<span style=\"color: green !important\">Ja</span>");
                            } else {
                                out.print("<span style=\"color: red !important\">Nee</span>");
                            } 
                            %>
                        </td>
                        <%
                            readers = (Set)pageContext.getAttribute("readers");
                        %>
                        <td><%= readers.isEmpty() ? "<iedereen>" : (readers.iterator().next() == null ? "<i>niemand</i>" : readers.toString()) %></td>
                    </tr>
                </c:forEach>
            </table>
            <h3 style="padding-top: 5px">Kaartlagen</h2>
            <p style="font-style: italic; padding: 5px">Kaartlagen die voor alle groepen geautoriseerd zijn worden niet getoond.</p>
            <table class="formtable" border="1">
                <tr><th>ID</th><th>Service ID en naam</th><th>Kaartlaag</th><th>Rechten voor <c:out value="${actionBean.user.username}"/></th><th>Lezen groepen</th><th>Schrijven groepen</th>
                <c:forEach var="e" items="<%= actionBean.getApplicationCache().getProtectedAppLayers().entrySet()%>">
                    <c:set var="alId" value="${e.key}"/>
                    <c:set var="readers" value="${e.value.readers}"/>
                    <c:set var="writers" value="${e.value.writers}"/>
                    <% ApplicationLayer applicationLayer = Stripersist.getEntityManager().find(ApplicationLayer.class, pageContext.getAttribute("alId"));
                       Layer alLayer = applicationLayer.getService().getLayer(applicationLayer.getLayerName());
                    %>
                    
                    <tr>
                        <td>${alId}</td>
                        <td><%= applicationLayer.getService().getId() %> - <c:out value="<%= applicationLayer.getService().getName() %>"/></td>
                        <td><%= alLayer != null ? Coalesce.coalesce(alLayer.getTitleAlias(), alLayer.getTitle(), alLayer.getName()) : applicationLayer.getLayerName() %></td>
                        <td><%
                            if(actionBean.getAuthorizedAppLayers().contains(applicationLayer)) {
                                boolean editable = actionBean.getAuthorizedEditableAppLayers().contains(applicationLayer);
                                out.print("<span style=\"color: green !important\">Lezen" + (editable ? " en schrijven" : "") + "</span>");
                            } else {
                                out.print("<span style=\"color: red !important\">Geen</span>");
                            } 
                            %>
                        </td>
                        <%
                            readers = (Set)pageContext.getAttribute("readers");
                            writers = (Set)pageContext.getAttribute("writers");
                        %>
                        <td><%= readers.isEmpty() ? "<i>iedereen</i>" : (readers.iterator().next() == null ? "<i>niemand</i>" : readers.toString()) %></td>
                        <td><%= writers.isEmpty() ? "<i>iedereen</i>" : (writers.iterator().next() == null ? "<i>niemand</i>" : writers.toString()) %></td>
                    </tr>
                </c:forEach>
            </table>            
        </c:if>
            
            <stripes:form beanclass="nl.b3p.viewer.admin.stripes.UserActionBean">
                
                <stripes:hidden name="user"/>
                <p style="padding: 5px">
                Bekijk autorisaties voor applicatie: <stripes:select name="application">
                    <c:forEach var="app" items="${actionBean.applications}">
                        <stripes:option value="${app}"><c:out value="${app.name} ${app.version != null ? 'v' + app.version : ''}"/></stripes:option>
                    </c:forEach>
                </stripes:select>
                </p>
                <stripes:submit name="authorizations">Applicatie autorisaties</stripes:submit>
            </stripes:form>
        </div>        
    </stripes:layout-component>
</stripes:layout-render>
        