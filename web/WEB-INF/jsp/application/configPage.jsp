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
        <title>Configureer component</title>
    </stripes:layout-component>

    <stripes:layout-component name="header">
    </stripes:layout-component>


    <stripes:layout-component name="body">
        <stripes:form beanclass="nl.b3p.viewer.admin.stripes.LayoutManagerActionBean" id="configForm" style="width: 100%; height: 100%;">
            <stripes:hidden name="component" value="${actionBean.component.id}"/>
            <stripes:hidden name="className" value="${actionBean.className}"/>
            <stripes:hidden name="name" value="${actionBean.name}"/>
            <stripes:hidden id="componentLayout" name="componentLayout"/>
            <stripes:hidden name="configObject" id="configObject"/>
            <stripes:hidden name="saveComponentConfig" value="Opslaan" />

            <div id="tabs" style="width: 100%; height: 100%;">
                <div id ="config" style="width: 100%; height: 100%;" class="tabdiv">
                </div>
                <div id="rights" class="tabdiv"> 
                    <h1>Groepen:</h1>
                    De volgende gebruikersgroepen hebben recht op dit component:<br/>

                    <c:forEach var="group" items="${actionBean.allGroups}">
                        <stripes:checkbox name="groups" value="${group.name}"/>${group.name}<br>
                    </c:forEach>
                </div>
                <div id="layout" class="tabdiv">

                </div>
            </div>
        </stripes:form>
        <script>
            var applicationId= ${actionBean.application.id};
            var className = "${actionBean.className}";
            var name = "${actionBean.name}";
            var metadata = new Object();
            <c:if test="${!empty actionBean.metadata}">
                metadata = ${actionBean.metadata};
                var className = metadata.className;
            </c:if>
                var contextPath = "${contextPath}";
                var configObject = null;
                var details = null;
            <c:if test="${!empty actionBean.component.config}">
                configObject= ${actionBean.component.config};
                details = Ext.JSON.decode('${actionBean.details}');
            </c:if>             
        </script>          
        <stripes:url var="configSource" beanclass="nl.b3p.viewer.admin.stripes.ComponentConfigSourceActionBean">
            <stripes:param name="className" value="${actionBean.className}"/> 
        </stripes:url>
        <script type="text/javascript" src="${contextPath}/viewer-html/components/ConfigObject.js"></script>       
        <c:if test="${actionBean.loadCustomConfig}">
            <script type="text/javascript" src="${configSource}"></script>
        </c:if>
        <script type="text/javascript" src="${contextPath}/resources/js/ux/b3p/FilterableCheckboxes.js"></script>
        <script type="text/javascript" src="${contextPath}/resources/js/ux/b3p/SelectionGrid.js"></script>
        <script type="text/javascript" src="${contextPath}/resources/js/ux/ColorField.js"></script>
        <script type="text/javascript" src="${contextPath}/resources/js/layoutmanager/configPage.js"></script>
    </stripes:layout-component>
</stripes:layout-render>
