<%--
Copyright (C) 2011-2013 B3Partners B.V.

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
<%@include file="/WEB-INF/jsp/taglibs.jsp"%>

        <style type="text/css">
            /* Main background colors */
            .x-border-layout-ct {
                background-color: #FFFFFF !important;
            }

            <c:if test="${!empty actionBean.application.details.steunkleur1.value && !empty actionBean.application.details.steunkleur2.value}">
                <c:set var="steunkleur1" value="${actionBean.application.details.steunkleur1.value}" />
                <c:set var="steunkleur2" value="${actionBean.application.details.steunkleur2.value}" />
                /* Popup borders & background colors (popup borders) */
                .x-window-default {
                    border-color: ${steunkleur1};
                    box-shadow: 0 1px 0 0 ${steunkleur1} inset, 0 -1px 0 0 ${steunkleur1} inset, -1px 0 0 0 ${steunkleur1} inset, 1px 0 0 0 ${steunkleur1} inset;
                    background-color: ${steunkleur1};
                }

                /* Popup window header */
                .x-window-header-default-top {
                    background-color: ${steunkleur1}; /* Header background color */
                    box-shadow: 0 1px 0 0 ${steunkleur1} inset, -1px 0 0 0 ${steunkleur1} inset, 1px 0 0 0 ${steunkleur1} inset;
                }

                .x-window-header-default {
                    border-color: ${steunkleur1};
                }

                /* Popup content colors */
                .x-window-body-default {
                    background-color: ${steunkleur1};  /* Visible when dragging the popup  */
                    border-color: ${steunkleur1}; /* Border round the content */
                }

                .x-window.floating-window {
                    border-color: #FFFFFF;
                    box-shadow: 0 1px 0 0 #FFFFFF inset, 0 -1px 0 0 #FFFFFF inset, -1px 0 0 0 #FFFFFF inset, 1px 0 0 0 #FFFFFF inset;
                    background-color: #FFFFFF;
                }
                
                .x-window.floating-left_menu {
                    border-color: transparent;
                    box-shadow: none;
                    background-color: transparent;
                }
                
                .x-window.floating-window .x-window-header-default-top {
                    background-color: #FFFFFF; /* Header background color */
                    box-shadow: 0 1px 0 0 #FFFFFF inset, -1px 0 0 0 #FFFFFF inset, 1px 0 0 0 #FFFFFF inset;
                }
                
                /* Popup content colors */
                .x-window.floating-window .x-window-body-default {
                    background-color: #FFFFFF;  /* Visible when dragging the popup  */
                    border-color: #FFFFFF; /* Border round the content */
                }
                
                .x-window.floating-left_menu .x-window-body-default {
                    border-color: transparent;
                    background-color: transparent;
                }
                
                /* Panel header colors */
                .x-panel-header-default {
                    background-color: ${steunkleur1};
                    background-image: -moz-linear-gradient(center top, ${steunkleur1}, ${steunkleur1});
                    background-image: -webkit-gradient(linear, 50% 0%, 50% 100%, color-stop(0%, ${steunkleur1}), color-stop(100%, ${steunkleur1}));
                    background-image: -webkit-linear-gradient(top, ${steunkleur1}, ${steunkleur1});
                    background-image: -o-linear-gradient(top, ${steunkleur1}, ${steunkleur1});
                    background-image: -ms-linear-gradient(top, ${steunkleur1}, ${steunkleur1});
                    background-image: linear-gradient(top, ${steunkleur1}, ${steunkleur1});
                    border-color: ${steunkleur1};
                }

                /* Panel header colors */
                .x-panel-header-default-top {
                    box-shadow: 0 1px 0 0 ${steunkleur1} inset;
                }
                
                /* Tool icon background */
                .x-tool-img {
                    background-color: ${steunkleur1} !important;
                    color: ${steunkleur2};
                }

                /* When using user-defined colors, disable header image in IE */
                .x-nlg .x-panel-header-default-top, /* Panel headers */
                .x-nlg .x-window-default-tl, /* this and below: Popup header and borders */
                .x-nlg .x-window-default-tc,
                .x-nlg .x-window-default-tr,
                .x-nlg .x-window-default-ml,
                .x-nlg .x-window-default-mc,
                .x-nlg .x-window-default-mr,
                .x-nlg .x-window-default-bl,
                .x-nlg .x-window-default-bc,
                .x-nlg .x-window-default-br,
                .x-nlg .x-window-header-default-top-tl,
                .x-nlg .x-window-header-default-top-tc,
                .x-nlg .x-window-header-default-top-tr,
                .x-nlg .x-window-header-default-top-ml,
                .x-nlg .x-window-header-default-top-mc,
                .x-nlg .x-window-header-default-top-mr,
                .x-nlg .x-window-header-default-top-bl,
                .x-nlg .x-window-header-default-top-bc,
                .x-nlg .x-window-header-default-top-br {
                    background-image: none;
                    background-color: ${steunkleur1};
                }

                /* IE9 floating left menu */
                .x-nlg .x-window.floating-left_menu .x-window-default-tl, /* this and below: Popup header and borders */
                .x-nlg .x-window.floating-left_menu .x-window-default-tc,
                .x-nlg .x-window.floating-left_menu .x-window-default-tr,
                .x-nlg .x-window.floating-left_menu .x-window-default-ml,
                .x-nlg .x-window.floating-left_menu .x-window-default-mc,
                .x-nlg .x-window.floating-left_menu .x-window-default-mr,
                .x-nlg .x-window.floating-left_menu .x-window-default-bl,
                .x-nlg .x-window.floating-left_menu .x-window-default-bc,
                .x-nlg .x-window.floating-left_menu .x-window-default-br,
                .x-nlg .x-window.floating-left_menu .x-window-header-default-top-tl,
                .x-nlg .x-window.floating-left_menu .x-window-header-default-top-tc,
                .x-nlg .x-window.floating-left_menu .x-window-header-default-top-tr,
                .x-nlg .x-window.floating-left_menu .x-window-header-default-top-ml,
                .x-nlg .x-window.floating-left_menu .x-window-header-default-top-mc,
                .x-nlg .x-window.floating-left_menu .x-window-header-default-top-mr,
                .x-nlg .x-window.floating-left_menu .x-window-header-default-top-bl,
                .x-nlg .x-window.floating-left_menu .x-window-header-default-top-bc,
                .x-nlg .x-window.floating-left_menu .x-window-header-default-top-br {
                    border-color: transparent;
                    background-color: transparent;
                }

                /* Panel border */
                .x-panel-default {
                    border-color: ${steunkleur1};
                }
                /* Textcolor */
                .x-panel-header-text-default /* Panel headers */,
                .x-window-header-text-default /* Popup header */,
                .x-panel-header-title-default /* Panel headers */,
                .x-window-header-title-default /* Popup headers */ {
                    color: ${steunkleur2};
                }
                
                /* Text color for collapsed side-panels */
                .x-panel-header svg text {
                    fill: ${steunkleur2};
                }
                
                /* Openlayers Overzichtskaartbg */
                .olControlOverviewMapElement {
                    background-color: ${steunkleur1} !important;
                }
                /* Openlayers Overzichtskaart border */
                .olControlOverviewMapExtentRectangle {
                    border: 2px dotted ${steunkleur2} !important;
                }
                
                .steunkleur1 {
                    background-color: ${steunkleur1};
                }
                
                .steunkleur2 {
                    color: ${steunkleur2};
                }
            </c:if>
            <c:if test="${!empty actionBean.application.details.font.value}">
                /* Textcolor */
                .x-grid-row .x-grid-cell /* Tree */,
                .x-grid-cell /* Tree */,
                .x-panel-body-default /* Panels (tree's, etc.) */,
                .x-panel-header-text-default /* Panel headers */,
                .x-window-body-default /* Popup body */,
                .x-border-layout-ct /* Main containers */,
                .x-body /* Body class */,
                .x-btn, .x-btn-inner, .x-btn .x-btn-inner /* Button classes */,
                .x-field /* Form fields */,
                .x-tab /* Tabs */,
                .x-tab button /* Tabs */,
                .x-form-field /* Form fields */,
                .x-form-item /* Form items */,
                .x-window-header-text-default /* Popup header */ {
                    font-family: ${actionBean.application.details.font.value};
                }
            </c:if>
                
            <c:forEach items="${actionBean.globalLayout}" var="globalLayout">
                <c:if test="${!empty globalLayout.value}">
                    <c:if test="${globalLayout.key=='extraCss'}">
                        ${globalLayout.value}
                    </c:if>
                </c:if>
            </c:forEach>
        </style>
