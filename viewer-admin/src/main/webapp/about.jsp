<%--
Copyright (C) 2013 B3Partners B.V.

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
<%@include file="/WEB-INF/jsp/taglibs.jsp"%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta name="teststring" content="<title>About</title>">
        <title><fmt:message key="viewer_admin.about.0" /></title>
        <link href="${contextPath}/resources/css/viewer.css" rel="stylesheet">
    </head>
    <body>
        <h1><fmt:message key="viewer_admin.about.1" /></h1>
        <c:set var="version" value="${project.version}"/>
        <table>
            
            <tr>
                <td><b><fmt:message key="viewer_admin.about.2" />:</b></td>
                <td>
                    <c:choose>
                        <c:when test="${fn:contains(version,'SNAPSHOT')}">
                            ${project.version}-${builddetails.commit.id.abbrev}
                        </c:when>
                        <c:otherwise>
                            ${project.version}
                        </c:otherwise>
                    </c:choose>
                    <span id="actuele-versie"><!-- jsonp request to GH api --></span>
                </td>
            </tr>
            <tr>
                <td><b><fmt:message key="viewer_admin.about.3" />:</b></td>
                <td>${builddetails.build.time}</td>
            </tr>
            <tr>
                <td><b><fmt:message key="viewer_admin.about.4" />:</b></td>
                <td>${builddetails.build.user.name}</td>
            </tr>
            <tr>
                <td colspan="2">
            <center><b><fmt:message key="viewer_admin.about.5" /></b></center>
                </td>
            </tr>
            <tr>
                <td><b><fmt:message key="viewer_admin.about.6" />:</b></td>
                <td>${builddetails.branch}</td>
            </tr>
            <tr>
                <td><b><fmt:message key="viewer_admin.about.7" /></b></td>
                <td>${builddetails.remote.origin.url}</td>
            </tr>
            <tr>
                <td><b><fmt:message key="viewer_admin.about.8" />:</b></td>
                <td>${builddetails.commit.id.abbrev}</td>
            </tr>
            <tr>
                <td><b><fmt:message key="viewer_admin.about.9" />:</b></td>
                <td>${builddetails.commit.id}</td>
            </tr>
            <tr>
                <td><b><fmt:message key="viewer_admin.about.10" />:</b></td>
                <td>${builddetails.commit.time}</td>
            </tr>
</table>
<h2><fmt:message key="viewer_admin.about.11" /></h2>
<table>
    <tr>
        <td><b><fmt:message key="viewer_admin.about.12" />:</b></td>
        <td>
            <jsp:expression>System.getProperty("os.name")</jsp:expression>
            <jsp:expression>System.getProperty("os.version")</jsp:expression>
            <jsp:expression>System.getProperty("os.arch")</jsp:expression>
            </td>
        </tr>
        <tr>
            <td><b><fmt:message key="viewer_admin.about.13" />:</b></td>
            <td>
            <jsp:expression>System.getProperty("java.vendor")</jsp:expression>
            <jsp:expression>System.getProperty("java.version")</jsp:expression>
            </td>
        </tr>
        <tr>
            <td><b><fmt:message key="viewer_admin.about.14" />:</b></td>
            <td><jsp:expression>getServletContext().getServerInfo()</jsp:expression></td>
    </tr>
</table>
<script>
     // use jsonp to retrieve latest release info
     function v(json){
         var versie=json.data.name;
         var datum = new Date( json.data.published_at).toDateString();
         document.getElementById('actuele-versie').innerHTML = '(latest release: '+versie+', dd. '+datum+')';
     }

     var scriptTag = document.createElement("script");
     scriptTag.src = "https://api.github.com/repos/B3Partners/tailormap/releases/latest?callback=v";
     document.getElementsByTagName('head')[0].appendChild(scriptTag);
</script>
    </body>
</html>
