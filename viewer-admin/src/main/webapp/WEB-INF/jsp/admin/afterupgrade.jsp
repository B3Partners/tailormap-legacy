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

<stripes:layout-render name="/WEB-INF/jsp/templates/ext.jsp">
    <stripes:layout-component name="head">
        <title>After upgradechecks<fmt:message key="viewer_admin.bookmarkedit.0" />_</title>
    </stripes:layout-component>
    <stripes:layout-component name="header">
        <jsp:include page="/WEB-INF/jsp/header.jsp"/>
    </stripes:layout-component>
    <stripes:layout-component name="body">
        <stripes:errors/>
        <stripes:messages/>
        <h1>Checks</h1>
        <ol>
            <c:forEach items="${actionBean.checks}" var="check">
                <li>
                    <c:choose ><c:when test="${check.success}"><img src="${contextPath}/resources/images/accept.png"/></c:when><c:otherwise><img src="${contextPath}/resources/images/cancel.png"/></c:otherwise> 
                    </c:choose>
                    ${check.name}</li>
                    <c:if test="${not check.success}">
                        URL: ${check.url} <br/>
                        Melding: ${check.log}. <br/>
                        ${check.remedy}
                    </c:if>
            </c:forEach>
        </ol>
    </stripes:layout-component>
</stripes:layout-render>
