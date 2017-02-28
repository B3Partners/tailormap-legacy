<%--
Copyright (C) 2011-2016 B3Partners B.V.

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
        <title>Kies applicatie</title>
    </stripes:layout-component>
    <stripes:layout-component name="header">
        <jsp:include page="/WEB-INF/jsp/header.jsp"/>
    </stripes:layout-component>
    <stripes:layout-component name="body">
        <div id="content">
            <stripes:errors/>
            <stripes:messages/>
            <h1>Applicaties<a href="#Soorten_Applicaties_Help" title="Help" class="helplink"></a></h1>
            <div id="grid-container" class="applicaties">

            </div>
            <div id="form-container" class="applicaties">
                <stripes:form beanclass="nl.b3p.viewer.admin.stripes.ApplicationSettingsActionBean">
                    <stripes:hidden name="version"/>
                    <stripes:hidden name="name"/>
                    <stripes:hidden name="applicationWorkversion"/>
                    <stripes:submit name="newApplication" value="Nieuwe applicatie"/>
                </stripes:form>
                <div class="applicaties">
                    <stripes:form beanclass="nl.b3p.viewer.admin.stripes.ChooseApplicationActionBean">
                        <stripes:select id="defaultAppSelector" name="defaultAppId" value="${actionBean.defaultAppId}" style="display: none;">
                            <stripes:option label="- Kies een applicatie - " value="" />
                            <stripes:options-collection collection="${actionBean.apps}" label="nameWithVersion"></stripes:options-collection>
                        </stripes:select>
                    </stripes:form>
                </div>
                <iframe src="<stripes:url beanclass="nl.b3p.viewer.admin.stripes.ChooseApplicationActionBean" event="viewEdit"/>" id="editFrame" frameborder="0"></iframe>
            </div>
            <script type="text/javascript" src="${contextPath}/resources/js/application/chooseApplication.js"></script>
            <script type="text/javascript">
                Ext.onReady(function() {
                    // Expose vieweradmin_components_ChooseApplication to global scope to be able to access the component from the iframe
                    window.vieweradmin_components_ChooseApplication = Ext.create('vieweradmin.components.ChooseApplication', {
                        gridurl: '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.ChooseApplicationActionBean" event="getGridData"/>',
                        editurl: '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.ApplicationSettingsActionBean" event="view"/>',
                        deleteurl: '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.ChooseApplicationActionBean" event="deleteApplication"/>',
                        setDefaultApplication :  '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.ChooseApplicationActionBean" event="saveDefaultApplication"/>'
                    });
                });
            </script>
        </div>
    </stripes:layout-component>
</stripes:layout-render>
