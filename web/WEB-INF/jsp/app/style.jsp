<%@include file="/WEB-INF/jsp/taglibs.jsp"%>

        <style type="text/css">
            /* Main background colors */
            .x-border-layout-ct {
                background-color: #FFFFFF;
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

                /* Popup content colors */
                .x-window-body-default {
                    background-color: ${steunkleur1};  /* Visible when dragging the popup  */
                    border-color: ${steunkleur1}; /* Border round the content */
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
                .x-nlg .x-window-header-default-top-br{
                    background-image: none;
                    background-color: ${steunkleur1};
                }

                /* Panel border */
                .x-panel-default {
                    border-color: ${steunkleur1};
                }
                
                /* Textcolor */
                .x-panel-header-text-default /* Panel headers */,
                .x-window-header-text-default /* Popup header */ {
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
        </style>
