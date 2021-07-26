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

<stripes:layout-render name="/WEB-INF/jsp/templates/angular.jsp">

    <stripes:layout-component name="head">
        <title><fmt:message key="viewer_admin.configpage.0" /></title>
        <style>
            .config-page-wrapper {
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: stretch;
            }
            #component-container {
                flex: 1;
                padding: 16px;
                overflow: auto;
            }
            #save-button {
                justify-content: flex-end;
                display: flex;
                padding: 0 8px 8px 0;
            }
        </style>
    </stripes:layout-component>

    <stripes:layout-component name="header">
    </stripes:layout-component>


    <stripes:layout-component name="body"><%--@elvariable id="actionBean" type="nl.tailormap.viewer.admin.stripes.LayoutManagerActionBean"--%>
        <stripes:form beanclass="nl.tailormap.viewer.admin.stripes.LayoutManagerActionBean" id="configForm">
            <input type="hidden" name="component" value="${actionBean.component.id}"/>
            <stripes:hidden name="className" value="${actionBean.className}"/>
            <stripes:hidden name="name" value="${actionBean.name}"/>
            <stripes:hidden id="componentLayout" name="componentLayout"/>
            <stripes:hidden name="configObject" id="configObject" value="${actionBean.configObject}" />
            <stripes:hidden name="saveComponentConfig" value="Opslaan" />
            <stripes:hidden name="currentRegion" value="${param.currentRegion}" />
        </stripes:form>
        <app-root></app-root>
        <div class="config-page-wrapper">
            <div id="component-container"></div>
            <div id="save-button">
                <tailormap-config-page-save-button></tailormap-config-page-save-button>
            </div>
        </div>

        <script type="text/javascript">
            window.addEventListener('DOMContentLoaded',function () {
                <c:set var="configObject"><js:quote>${"{}"}</js:quote></c:set>
                <c:if test="${!empty actionBean.component.config}">
                <c:set var="configObject"><js:quote>${actionBean.component.config}</js:quote></c:set>
                </c:if>
                const configEl = document.createElement('${actionBean.ngConfigComponent}');
                configEl.setAttribute('application-id', '${actionBean.application.id}');
                configEl.setAttribute('config', ${configObject});
                configEl.addEventListener('configChanged', function(config) {
                    if (config.detail) {
                        document.querySelector('#configObject').value = config.detail;
                    }
                });
                document.querySelector('#component-container').appendChild(configEl);
                document.querySelector('#configObject').value = ${configObject};
            });
        </script>
    </stripes:layout-component>
</stripes:layout-render>
