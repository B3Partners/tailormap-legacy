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
        <jsp:include page="/WEB-INF/jsp/header.jsp"/>
    </stripes:layout-component>

    <stripes:layout-component name="body">
        <div id="content">
            <c:set var="maxWidth" value="" />
            <c:if test="${!empty actionBean.application.details.maxWidth}">
                <c:set var="maxWidth" value="${actionBean.application.details.maxWidth}" />
            </c:if>
            <c:set var="maxHeight" value="" />
            <c:if test="${!empty actionBean.application.details.maxHeight}">
                <c:set var="maxHeight" value="${actionBean.application.details.maxHeight}" />
            </c:if>
            <div id="layoutManagerApplicationSettings">
                <button id="savebutton">Opslaan</button>            
                Maximale breedte: <input id="app_max_width" type="text" name="app_max_width" value="${maxWidth}" /> px | Maximale hoogte: <input id="app_max_height" type="text" name="app_max_height" value="${maxHeight}" /> px
                <a href="#Toevoegen_Componenten_Layout_Help" title="Help" class="helplink"></a>
            </div>
            <div id="component-container">

            </div>
            <div id="layout-container">
                <div id="layout-north">
                    <div id="layout_header" class="content-container">
                    </div>
                </div>
                <div id="layout-center">
                    <div id="center_left">
                        <div id="layout_left_top" class="top content-container"></div>
                        <div id="layout_left_bottom" class="bottom content-container"></div>
                    </div>
                    <div id="center_right">
                        <div id="layout_right_top" class="top content-container"></div>
                        <div id="layout_right_bottom" class="bottom content-container"></div>
                    </div>
                    <div id="center_center">
                        <div id="layout_left_menu" class="content-container"></div>
                        <div id="center_center_center">
                            <div id="layout_top_menu" class="content-container"></div>
                            <div id="layout_content" class="content-container"></div>
                            <div id="layout_content_bottom" class="content-container"></div>
                            <div id="layout_popupwindow" class="content-container"></div>
                        </div>
                    </div>
                    <div style="clear: both;"></div>
                </div>
                <div id="layout-south">
                    <div id="layout_footer" class="content-container"></div>
                </div>
                <iframe id="configPage" style="width: 100%; height: 100%; border: 0px none; display: none;" frameborder="0" src=""></iframe>
            </div>
        </div>

        <script type="text/javascript">            
            var activelink = 'menu_layout';
            var components = ${actionBean.components};
            <stripes:url var="url" beanclass="nl.b3p.viewer.admin.stripes.LayoutManagerActionBean" event="config">
                <c:if test="${param.debug == 'true'}"><stripes:param name="debug">true</stripes:param></c:if>
            </stripes:url>
            var configPageLink = <js:quote value="${url}"/>;
            var layoutSaveUrl = '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.LayoutManagerActionBean" event="saveApplicationLayout"/>';
            var removeComponentUrl = '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.LayoutManagerActionBean" event="removeComponent"/>';
            <c:choose>    
                <c:when test="${!empty actionBean.application.layout}">
                    var layoutJson = ${actionBean.application.layout};
                </c:when>
                <c:otherwise>
                    var layoutJson = {};
                </c:otherwise>
            </c:choose>
        </script>
        <script type="text/javascript" src="${contextPath}/resources/js/ux/b3p/ColorPickerButton.js"></script>
        <script type="text/javascript" src="${contextPath}/resources/js/layoutmanager/layoutmanager.js"></script>

    </stripes:layout-component>

</stripes:layout-render>
