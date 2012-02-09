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
        <title>Gegevensregister</title>
    </stripes:layout-component>

    <stripes:layout-component name="header">
        <jsp:include page="/WEB-INF/jsp/header.jsp"/>
    </stripes:layout-component>

    <stripes:layout-component name="body">
        <stripes:form beanclass="nl.b3p.viewer.admin.stripes.AttributeActionBean">
            <div id="content">
                <h1>Attributen</h1><br />

                <p>Attributen beheren voor</p>
                <stripes:select name="featureSourceId">
                    <stripes:option value="1">Kies..</stripes:option>
                    <c:forEach var="source" items="${actionBean.featureSources}">
                        <stripes:option value="${source.id}"><c:out value="${source.name}"/></stripes:option>
                    </c:forEach>
                </stripes:select>
                <stripes:select name="simpleFeatureTypeId">
                    <stripes:option value="1">Kies..</stripes:option>
                </stripes:select>
                <stripes:submit name="selectBron" value="Beheren"/>



                <div id="grid-container" class="attribute">

                </div>
                <div id="form-container" class="attribute">
                    <iframe src="<stripes:url beanclass="nl.b3p.viewer.admin.stripes.AttributeActionBean" event="cancel"/>" id="editFrame" frameborder="0"></iframe>
                </div>
            </div>
        </stripes:form>
        <script type="text/javascript">
            var gridurl = '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.AttributeActionBean" event="getGridData"/>';
            var editurl = '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.AttributeActionBean" event="edit"/>';
            var activelink = 'menu_attributen';
        </script>
        <script type="text/javascript" src="${contextPath}/resources/js/services/attribute.js"></script>
    </stripes:layout-component>

</stripes:layout-render>
