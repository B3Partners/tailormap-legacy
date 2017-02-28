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
        <title>About</title>
        <link href="${contextPath}/resources/css/viewer.css" rel="stylesheet">
    </head>
    <body>
        <h1>Flamingo viewer</h1>
        <c:set var="version" value="${project.version}"/>
        <table>

            <tr>
                <td><b>Version:</b></td>
                <td>
                    <c:choose>
                        <c:when test="${fn:contains(version,'SNAPSHOT')}">
                            ${project.version}-${builddetails.commit.id.abbrev}
                        </c:when>
                        <c:otherwise>
                            ${project.version}
                        </c:otherwise>
                    </c:choose>
                </td>
            </tr>
            <tr>
                <td><b>Build time:</b></td>
                <td>${builddetails.build.time}</td>
            </tr>
            <tr>
                <td><b>Build by:</b></td>
                <td>${builddetails.build.user.name}</td>
            </tr>
            <tr>
                <td colspan="2">
            <center><b>Git details</b></center>
        </td>
    </tr>
    <tr>
        <td><b>Git branch:</b></td>
        <td>${builddetails.branch}</td>
    </tr>
    <tr>
        <td><b>Git remote url</b></td>
        <td>${builddetails.remote.origin.url}</td>
    </tr>
    <tr>
        <td><b>Git commit abbrev id:</b></td>
        <td>${builddetails.commit.id.abbrev}</td>
    </tr>
    <tr>
        <td><b>Git commit full id:</b></td>
        <td>${builddetails.commit.id}</td>
    </tr>
    <tr>
        <td><b>Git commit time:</b></td>
        <td>${builddetails.commit.time}</td>
    </tr>
</table>
</body>
</html>
