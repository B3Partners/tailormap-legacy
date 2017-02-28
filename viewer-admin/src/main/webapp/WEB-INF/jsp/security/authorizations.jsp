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

<%@page import="nl.b3p.viewer.config.app.ConfiguredComponent"%>
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
        <div class="textcontent">
            <h1 id="headertext">Autorisatieoverzicht voor gebruiker <c:out value="${actionBean.user.username}"/></h1>
            <stripes:errors/>
            <stripes:messages/>
            <h2>Groeplidmaatschap</h2>
            <c:forEach var="g" varStatus="status" items="${actionBean.user.groups}">${status.index > 0 ? "," : ""}
                <c:out value="${g.name}"/></c:forEach>
                <h2 style="">Gegevensregister lagen</h2>
                <p style="font-style: italic;">Lagen die voor alle groepen geautoriseerd zijn worden niet getoond. Een schrijfbare laag is dat 
                    praktisch alleen indien attributen ook expliciet editable zijn gemaakt in een kaartlaag en de kaartlaag in een applicatie bij een edit component is geconfigureerd.</p>

            <% UserActionBean actionBean = (UserActionBean) pageContext.findAttribute("actionBean");
                Set readers, writers;
            %>
            <table class="formtable" border="1">
                <thead><tr><th>ID</th><th>Naam</th></th><th>Rechten voor <c:out value="${actionBean.user.username}"/></th><th>Lezen groepen</th><th>Schrijven groepen</th></thead>
                <tnody>
                    <c:forEach var="e" items="<%= Authorizations.serviceCache.entrySet()%>">
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
                                                out.print("<span style=\"color: green !important\">Lezen" + (editable ? " en schrijven" : "") + "</span>");
                                            } else {
                                                out.print("<span style=\"color: red !important\">Geen</span>");
                                            }
                                        %>
                                    </td>
                                    <%
                                        readers = (Set) pageContext.getAttribute("readers");
                                        writers = (Set) pageContext.getAttribute("writers");
                                    %>
                                    <td><%= readers.isEmpty() ? "<i>iedereen</i>" : (readers.iterator().next() == null ? "<i>niemand</i>" : readers.toString())%></td>
                                    <td><%= writers.isEmpty() ? "<i>iedereen</i>" : (writers.iterator().next() == null ? "<i>niemand</i>" : writers.toString())%></td>
                                </tr>

                            </c:forEach>
                        </c:if>
                    </c:forEach>
                </tbody>
            </table>

            <c:if test="${actionBean.application != null}">
                <h2>Autorisaties voor applicatie <c:out value="${actionBean.application.name}"/> <c:if test="${actionBean.application.version != null}">v${actionBean.application.version}</c:if></h2>
                <h3>Niveau's</h3>
                <p style="font-style: italic;">Niveau's die voor alle groepen geautoriseerd zijn worden niet getoond.</p>
                <table class="formtable" border="1">
                    <thead><tr><th>ID</th><th>Naam</th><th>Toegang voor <c:out value="${actionBean.user.username}"/></th><th>Groepen met toegang</th></thead>
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
                                            out.print("<span style=\"color: green !important\">Ja</span>");
                                        } else {
                                            out.print("<span style=\"color: red !important\">Nee</span>");
                                        }
                                    %>
                                </td>
                                <%
                                    readers = (Set) pageContext.getAttribute("readers");
                                %>
                                <td><%= readers.isEmpty() ? "<iedereen>" : (readers.iterator().next() == null ? "<i>niemand</i>" : readers.toString())%></td>
                            </tr>
                        </c:forEach>
                    </tbody>
                </table>
                <h3>Kaartlagen</h3>
                <p style="font-style: italic;">Kaartlagen die voor alle groepen geautoriseerd zijn worden niet getoond.</p>
                <table class="formtable" border="1">
                    <thead><tr><th>ID</th><th>Service ID en naam</th><th>Kaartlaag</th><th>Rechten voor <c:out value="${actionBean.user.username}"/></th><th>Lezen groepen</th><th>Schrijven groepen</th></thead>
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
                                        out.print("<span style=\"color: green !important\">Lezen" + (editable ? " en schrijven" : "") + "</span>");
                                    } else {
                                        out.print("<span style=\"color: red !important\">Geen</span>");
                                    }
                                    %>
                                </td>
                                <%
                                    readers = (Set) pageContext.getAttribute("readers");
                                    writers = (Set) pageContext.getAttribute("writers");
                                %>
                                <td><%= readers.isEmpty() ? "<i>iedereen</i>" : (readers.iterator().next() == null ? "<i>niemand</i>" : readers.toString())%></td>
                                <td><%= writers.isEmpty() ? "<i>iedereen</i>" : (writers.iterator().next() == null ? "<i>niemand</i>" : writers.toString())%></td>
                            </tr>
                        </c:forEach>
                    </tbody>
                </table>            
                <h3>Componenten</h3>
                <p style="font-style: italic;">Componenten die voor alle groepen geautoriseerd zijn worden niet getoond.</p>
                <table class="formtable" border="1">
                    <thead><tr><th>Class</th><th>Naam</th><th>Toegang voor <c:out value="${actionBean.user.username}"/></th><th>Groepen met toegang</th></thead>
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
                                                out.print("<span style=\"color: green !important\">Ja</span>");
                                            } else {
                                                out.print("<span style=\"color: red !important\">Nee</span>");
                                            }
                                        %>
                                    </td>
                                    <%
                                        readers = (Set) pageContext.getAttribute("readers");
                                    %>
                                    <td><%= readers.isEmpty() ? "<iedereen>" : (readers.iterator().next() == null ? "<i>niemand</i>" : readers.toString())%></td>
                                </tr>
                            </c:if>
                        </c:forEach>
                    </tbody>
                </table>
            </c:if>

            <stripes:form beanclass="nl.b3p.viewer.admin.stripes.UserActionBean">

                <stripes:hidden name="user"/>
                <p>
                    Bekijk autorisaties voor applicatie: <stripes:select name="application">
                        <c:forEach var="app" items="${actionBean.applications}">
                            <stripes:option value="${app}"><c:out value="${app.name}"/>  <c:if test="${app.version != null}">v${app.version}</c:if></stripes:option>
                        </c:forEach>
                    </stripes:select>
                </p>
                <stripes:submit name="authorizations">Applicatie autorisaties</stripes:submit>
            </stripes:form>
        </div>        
    </stripes:layout-component>
</stripes:layout-render>
