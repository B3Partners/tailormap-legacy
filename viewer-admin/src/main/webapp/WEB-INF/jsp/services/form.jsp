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
        <title><fmt:message key="viewer_admin.form.title" /></title>
    </stripes:layout-component>
    <stripes:layout-component name="header">
        <jsp:include page="/WEB-INF/jsp/header.jsp"/>
    </stripes:layout-component>
    <stripes:layout-component name="body">
        <div id="content">
            <stripes:errors/>
            <stripes:messages/>
            <h1><fmt:message key="viewer_admin.form.header" /><a href="#Soorten_Applicaties_Help" title="<fmt:message key="viewer_admin.form.helptext" />" class="helplink"></a></h1>
            <br/>
            <div id="form-container" class="forms">
                <div id="grid-container" class="attribute"></div>
            </div>
            <div class="">
                <stripes:form beanclass="nl.tailormap.viewer.admin.stripes.FormActionBean">
                    <stripes:select id="defaultFSSelector" name="defaultFeatureSourceId" value="${actionBean.defaultFeatureSourceId}" style="display: none;">
                        <fmt:message key="viewer_admin.form.choosedefaultfs" var="OptLabel1" />
                        <stripes:option label="${OptLabel1}" value="" />
                        <stripes:options-collection collection="${actionBean.featureSources}" label="name"></stripes:options-collection>
                    </stripes:select>
                </stripes:form>
            </div>
            <div id="form-container" class="applicaties">
                <iframe src="<stripes:url beanclass="nl.tailormap.viewer.admin.stripes.FormActionBean" event="cancel"/>" id="editFrame" frameborder="0"></iframe>

            </div>
        </div>
        <script type="text/javascript" src="${contextPath}/resources/js/services/form.js"></script>
        <script type="text/javascript">
            var forms = ${actionBean.forms};

            Ext.onReady(function() {
                // Expose vieweradmin_components_Bookmark to global scope to be able to access the component from the iframe
                window.vieweradmin_components_FormSource = Ext.create('vieweradmin.components.Form', {
                    forms:forms,
                    gridurl: '<stripes:url beanclass="nl.tailormap.viewer.admin.stripes.FormActionBean" event="getGridData"/>',
                    editurl: '<stripes:url beanclass="nl.tailormap.viewer.admin.stripes.FormActionBean" event="edit"/>',
                    deleteurl: '<stripes:url beanclass="nl.tailormap.viewer.admin.stripes.FormActionBean" event="delete"/>',
                    setDefaultFeaturesource :  '<stripes:url beanclass="nl.tailormap.viewer.admin.stripes.FormActionBean" event="saveDefaultFeatureSource"/>'

                });
            });
        </script>
    </stripes:layout-component>
</stripes:layout-render>
