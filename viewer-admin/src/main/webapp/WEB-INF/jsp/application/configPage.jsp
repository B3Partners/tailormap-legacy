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
        <title>Configureer component</title>
        <link rel="stylesheet" href="${contextPath}/resources/css/HtmlEditorExtensions.css" />
    </stripes:layout-component>

    <stripes:layout-component name="header">
    </stripes:layout-component>


    <stripes:layout-component name="body"><%--@elvariable id="actionBean" type="nl.b3p.viewer.admin.stripes.LayoutManagerActionBean"--%>
        <stripes:form beanclass="nl.b3p.viewer.admin.stripes.LayoutManagerActionBean" id="configForm" style="width: 100%; height: 100%;">
            <input type="hidden" name="component" value="${actionBean.component.id}"/>
            <stripes:hidden name="className" value="${actionBean.className}"/>
            <stripes:hidden name="name" value="${actionBean.name}"/>
            <stripes:hidden id="componentLayout" name="componentLayout"/>
            <stripes:hidden name="configObject" id="configObject"/>
            <stripes:hidden name="saveComponentConfig" value="Opslaan" />

            <div id="tabs" style="width: 100%; height: 100%;">
                <div id ="config" style="width: 100%; height: 100%;" class="tabdiv">
                    <a href="" title="Help" class="helplink" id="compHelpLink"></a>
                </div>
                <div id="rights" class="tabdiv"> 
                    <h1>Groepen:</h1>
                    De volgende gebruikersgroepen hebben recht op dit component:<br/>

                    <c:forEach var="group" items="${actionBean.allGroups}">
                        <stripes:checkbox name="groups" value="${group.name}"/>${group.name}<br>
                    </c:forEach>
                </div>
                <div id="layout" class="tabdiv">
                    <a href="#Component_Layout_Tab_Help" title="Help" class="helplink"></a>
                </div>
                <div id="help" class="tabdiv">
                    <a href="#Component_Help_Tab_Help" title="Help" class="helplink"></a>
                </div>
            </div>
        </stripes:form>
        <stripes:url var="configSource" beanclass="nl.b3p.viewer.admin.stripes.ComponentConfigSourceActionBean">
            <stripes:param name="className" value="${actionBean.className}"/> 
        </stripes:url>
        <c:if test="${actionBean.loadCustomConfig}">
            <script type="text/javascript" src="${configSource}"></script>
        </c:if>
        <script type="text/javascript" src="${contextPath}/resources/js/ux/b3p/FilterableCheckboxes.js"></script>
        <script type="text/javascript" src="${contextPath}/resources/js/ux/form/HtmlEditorImage.js"></script>
        <script type="text/javascript" src="${contextPath}/resources/js/ux/form/HtmlEditorTable.js"></script>
        <script type="text/javascript" src="${contextPath}/resources/js/ux/b3p/SelectionGrid.js"></script>
        <script type="text/javascript" src="${contextPath}/resources/js/ux/ColorField.js"></script>
        <script type="text/javascript" src="${contextPath}/resources/js/layoutmanager/configPage.js"></script>
        <script type="text/javascript">
            Ext.onReady(function() {
                var metadata = {};
                var className = "${actionBean.className}";
                <c:if test="${!empty actionBean.metadata}">
                    metadata = ${actionBean.metadata};
                    className = metadata.className;
                </c:if>

                var appConfig = {};
                <c:if test="${!empty actionBean.appConfigJSON}">
                    appConfig = ${actionBean.appConfigJSON};
                </c:if>

                var configObject = {};
                var details = {};
                <c:if test="${!empty actionBean.component.config}">
                    configObject= Ext.JSON.decode(<js:quote>${actionBean.component.config}</js:quote>);
                    details = Ext.JSON.decode(<js:quote>${actionBean.details}</js:quote>);
                </c:if>

                Ext.create("vieweradmin.components.ConfigPage", {
                    applicationId: ${actionBean.application.id},
                    className : className,
                    name : "${actionBean.name}",
                    currentRegion : "${param.currentRegion}",
                    metadata : metadata,
                    contextPath: "${contextPath}",
                    configObject: configObject,
                    details: details,
                    appConfig: appConfig,
                    actionBeans: {
                        "imageupload": <js:quote><stripes:url beanclass="nl.b3p.viewer.admin.stripes.ImageUploadActionBean"/></js:quote>
                    }
                });
            });
        </script>
    </stripes:layout-component>
</stripes:layout-render>
