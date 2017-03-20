<%--
Copyright (C) 2012 B3Partners B.V.

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

<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta http-equiv="refresh" content="2">
        <title>Autorisatie info</title>
    </head>
    <body>
        <h2>Autorisatie info</h2>

        <table>
            <tr><td>Remote user:</td><td><c:out value="${pageContext.request.remoteUser}"/></td></tr>
            <tr><td>Principal:</td><td><c:out value="${pageContext.request.userPrincipal}"/> (class <c:catch var="e"><%= request.getUserPrincipal().getClass().getName() %></c:catch>)</td></tr>
            <tr><td>Realm:</td><td> <c:catch var="e"><c:out value="${pageContext.request.userPrincipal.realm.info}"/></c:catch></td></tr>
        </table>
        <p>
        Lijst met roles:
        <ol>
            <c:if test="${pageContext.request.userPrincipal != null}" >
                <c:forEach var="r" items="${pageContext.request.userPrincipal.groups}">
                    <li><c:out value="${r.name}"/></li>
                </c:forEach>
            </c:if>
        </ol>
        <p>
        Test HttpServletRequest.isUserInRole():
        <p>
        <c:if test="${!empty param.role}">
            Rol <b><c:out value="${param.role}"/>: <b><%= request.isUserInRole(request.getParameter("role")) %></b>
            <p>
        </c:if>
        <form action="${pageContext.request.pathInfo}" method="get">
            <input name="role"  placeholder="Voer rolnaam in"  type="text">
            <input type="submit"value="Check">
        </form>

        <script type="text/javascript">
            window.onload = function() {
                document.forms[0].role.focus();
            }
        </script>
    </body>
</html>
