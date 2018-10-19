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
        <title><fmt:message key="viewer_admin.attribute.0" /></title>
    </stripes:layout-component>

    <stripes:layout-component name="header">
        <jsp:include page="/WEB-INF/jsp/header.jsp"/>
    </stripes:layout-component>

    <stripes:layout-component name="body">
        <div id="content">
            <h1><fmt:message key="viewer_admin.attribute.1" /><a href="#Attribuutlijst_Help" title="<fmt:message key="viewer_admin.attribute.2" />" class="helplink"></a></h1>

            <div style="margin-top: 35px; margin-bottom: -20px;">
                <p><fmt:message key="viewer_admin.attribute.3" /></p>
                <select name="featureSourceId" id="featureSourceId">
                    <option value="-1"><fmt:message key="viewer_admin.attribute.4" /></option>
                    <c:forEach var="source" items="${actionBean.featureSources}">
                        <c:set var="selected" value="" />
                        <c:if test="${actionBean.featureSourceId == source.id}">
                            <c:set var="selected" value=" selected=\"selected\"" />
                        </c:if>
                        <option value="${source.id}"${selected}>${source.protocol} #${source.id} <c:out value="${source.name}"/></option>
                    </c:forEach>
                </select>
                <select name="simpleFeatureTypeId" id="simpleFeatureTypeId">
                    <option value="1"><fmt:message key="viewer_admin.attribute.5" /></option>
                </select>
            </div>

            <div id="grid-container" class="attribute"></div>
            <div id="form-container" class="attribute">
                <iframe src="<stripes:url beanclass="nl.b3p.viewer.admin.stripes.AttributeActionBean" event="cancel"/>" id="editFrame" frameborder="0"></iframe>
            </div>
        </div>
        <script type="text/javascript" src="${contextPath}/resources/js/services/attribute.js"></script>
        <script type="text/javascript">
            Ext.onReady(function() {
                // Expose vieweradmin_components_ChooseApplication to global scope to be able to access the component from the iframe
                window.vieweradmin_components_Attributes = Ext.create('vieweradmin.components.Attributes', {
                    gridurl: '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.AttributeActionBean" event="getGridData"/>',
                    editurl: '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.AttributeActionBean" event="edit"/>',
                    getfeaturetypesurl: '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.AttributeActionBean" event="getFeatureTypes"/>'
                });
            });
        </script>
    </stripes:layout-component>

</stripes:layout-render>
