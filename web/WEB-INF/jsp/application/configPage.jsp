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
        <title>Layoutmanager</title>
    </stripes:layout-component>

    <stripes:layout-component name="header">
    </stripes:layout-component>


    <stripes:layout-component name="body">
        <stripes:form beanclass="nl.b3p.viewer.admin.stripes.LayoutManagerActionBean">
            <stripes:hidden id="configObject" name="configObject"/>
            <stripes:hidden id="name" name="name"/>
            <stripes:hidden id="className" name="className"/>
            <stripes:hidden id="name" name="name"/>
            <stripes:hidden id="div" name="div"/>


            <stripes:hidden name="application"/>
            <c:forEach items="${actionBean.application.components}" var="comp">

                <c:set var="configObj" value="${comp.config}"/>
                <c:set var="id" value="${comp.id}"/>
            </c:forEach>

            <stripes:hidden id="component" name="component" value="${id}"/>
            <script>
                var configObj = new Object();
                <c:if test="${!empty configObj}">
                        configObj = ${configObj};
                </c:if>
            </script>
            <div id ="config"></div>

            <stripes:submit name="saveComponentConfig" onclick="getConfig()">Opslaan</stripes:submit>
        </stripes:form>
        <script type="text/javascript" src="${contextPath}${actionBean.configPageUrl}"></script>
        <script type="text/javascript" src="${contextPath}/resources/js/layoutmanager/configPage.js"></script>
    </stripes:layout-component>

</stripes:layout-render>
