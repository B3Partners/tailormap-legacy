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
        <title>Layoutmanager</title>
    </stripes:layout-component>

    <stripes:layout-component name="header">
        <jsp:include page="/WEB-INF/jsp/header.jsp"/>
    </stripes:layout-component>

    <stripes:layout-component name="body">
        <div id="content">
            <div id="layoutManagerApplicationSettings">
                <button id="savebutton">Opslaan</button> &nbsp; 
                <a href="#" id="global_layout_switch">Layout instellingen</a>
                <div id="global_layout" class="globalconfig">
                    <div class="configrow"><label for="app_max_width">Maximale breedte:</label><input id="app_max_width" type="text" name="app_max_width" value="" /> px</div>
                    <div class="configrow"><label for="app_max_height">Maximale hoogte:</label><input id="app_max_height" type="text" name="app_max_height" value="" /> px</div>
                    <div class="configrow"><label for="app_margin">Marge rondom:</label><input id="app_margin" type="text" name="app_margin" value="" /></div>
                    <div class="configrow"><label for="app_background_color">Achtergrond kleur:</label><input id="app_background_color" type="text" name="app_background_color" value="" class="wide" /></div>
                    <div class="configrow"><label for="app_background_image">Achtergrond afbeelding:</label><input id="app_background_image" type="text" name="app_background_image" value="" class="wide" /></div>
                    <div class="configrow">
                        <label for="app_background_repeat">Achtergrond herhalen:</label>
                        <select id="app_background_repeat" name="app_background_repeat">
                            <option value="no-repeat">Niet herhalen</option>
                            <option value="repeat">Beide kanten op herhalen</option>
                            <option value="repeat-x">Alleen horizontaal herhalen</option>
                            <option value="repeat-y">Alleen verticaal herhalen</option>
                        </select>
                    </div>
                    <div class="configrow"><label for="app_background_position">Achtergrond positie:</label><input id="app_background_position" type="text" name="app_background_position" value="" /></div>
                    <div class="configrow"><label for="app_extracss">Extra CSS code:</label><textarea id="app_extracss" name="app_extracss" class="extliketextarea"></textarea></div>
                    <div class="configrow"><label for="app_singlepopup">Max. 1 popup tegelijk:</label><input id="app_singlepopup" type="checkbox" name="app_singlepopup" value="true" /></div>
                </div>
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

        <stripes:url var="url" beanclass="nl.b3p.viewer.admin.stripes.LayoutManagerActionBean" event="config">
            <c:if test="${param.debug}"><stripes:param name="debug" value="true"/></c:if>
        </stripes:url>
        <script type="text/javascript">
            vieweradmin.components.Menu.setActiveLink('menu_layout');
            Ext.onReady(function() {
                
                <c:choose>    
                    <c:when test="${!empty actionBean.application.layout}">
                        var layoutJson = ${actionBean.application.layout};
                    </c:when>
                    <c:otherwise>
                        var layoutJson = {};
                    </c:otherwise>
                </c:choose>
                <c:choose>    
                    <c:when test="${!empty actionBean.application.globalLayout}">
                        var globalLayout = ${actionBean.application.globalLayout};
                    </c:when>
                    <c:otherwise>
                        var globalLayout = {};
                    </c:otherwise>
                </c:choose>

                Ext.create('LayoutManager', {
                    layoutJson: layoutJson,
                    globalLayout: globalLayout,
                    components: ${actionBean.components},
                    configPageLink: <js:quote value="${url}"/>,
                    layoutSaveUrl: '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.LayoutManagerActionBean" event="saveApplicationLayout"/>',
                    removeComponentUrl: '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.LayoutManagerActionBean" event="removeComponent"/>'
                });
            });
        </script>
        <script type="text/javascript" src="${contextPath}/resources/js/ux/b3p/ColorPickerButton.js"></script>
        <script type="text/javascript" src="${contextPath}/resources/js/layoutmanager/layoutmanager.js"></script>

    </stripes:layout-component>

</stripes:layout-render>
