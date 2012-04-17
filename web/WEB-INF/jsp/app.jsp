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

<!DOCTYPE html>
<html>
    <head>
        <title><c:out value="${actionBean.application.name}"/></title>
        
        <c:choose>
            <c:when test="${actionBean.viewerType == 'OpenLayersMap'}">
                <c:set var="viewerType" value="openlayers"/>
            </c:when>
            <c:otherwise>
                <c:set var="viewerType" value="flamingo"/>
            </c:otherwise>
        </c:choose>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">

        <link rel="stylesheet" type="text/css" href="${contextPath}/extjs/resources/css/ext-all-gray.css">
        <link href="${contextPath}/resources/css/viewer.css" rel="stylesheet">

        <!--XXX must only be loaded if component is added -->
        <link href="${contextPath}/viewer-html/components/resources/css/maptip.css" rel="stylesheet">
        <link href="${contextPath}/viewer-html/components/resources/css/featureinfo.css" rel="stylesheet">
        <link href="${contextPath}/viewer-html/components/resources/css/relatedDocuments.css" rel="stylesheet">
        <link href="${contextPath}/viewer-html/components/resources/css/logger.css" rel="stylesheet">
        
        
        <script type="text/javascript" src="${contextPath}/extjs/ext-all${param.debug == true ? '-debug' : ''}.js"></script>

        <script type="text/javascript" src="${contextPath}/extjs/locale/ext-lang-nl.js"></script>
        <c:if test="${viewerType == 'flamingo'}">
            <script type="text/javascript" src="${contextPath}/viewer-html/common/swfobject.js"></script>
        </c:if>
            <script type="text/javascript" src="${contextPath}/viewer-html/common/openlayers/OpenLayers.js"></script>
            <!--script type="text/javascript" src="${contextPath}/viewer-html/common/openlayers/lib/OpenLayers.js"></script-->

        <c:choose>
            <c:when test="${param.debug == true}">
                <!-- Also add scripts to <projectdir>/minify/build.xml, so it's build as minified for non debug use -->  
                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/ViewerController.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/components/Component.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/components/LogMessage.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/components/Logger.js"></script>

                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Controller/Map.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Controller/Layer.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Controller/MapTip.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Controller/Extent.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Controller/Feature.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Controller/Event.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Controller/Tool.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Controller/Component.js"></script>

                <c:choose>
                    <c:when test="${viewerType == 'openlayers'}">
                        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/OpenLayers/OpenLayersLayer.js"></script>
                        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/OpenLayers/OpenLayersWMSLayer.js"></script>
                        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/OpenLayers/OpenLayersVectorLayer.js"></script>
                        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/OpenLayers/OpenLayersImageLayer.js"></script>
                        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/OpenLayers/OpenLayersTMSLayer.js"></script>
                        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/OpenLayers/OpenLayersTool.js"></script>
                        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/OpenLayers/OpenLayersIdentifyTool.js"></script>
                        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/OpenLayers/OpenLayersMap.js"></script>
                        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/OpenLayers/Utils.js"></script>
                    </c:when>
                    <c:otherwise>
                        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Flamingo/FlamingoLayer.js"></script>
                        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Flamingo/FlamingoWMSLayer.js"></script>
                        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Flamingo/FlamingoArcLayer.js"></script>
                        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Flamingo/FlamingoArcServerLayer.js"></script>
                        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Flamingo/FlamingoArcIMSLayer.js"></script>
                        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Flamingo/FlamingoVectorLayer.js"></script>
                        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Flamingo/FlamingoImageLayer.js"></script>
                        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Flamingo/FlamingoMap.js"></script>
                        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Flamingo/FlamingoTool.js"></script>
                        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Flamingo/FlamingoComponent.js"></script>
                    </c:otherwise>
                </c:choose>
                    
                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/MapComponent.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/FlamingoMapComponent.js"></script>  
                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/OpenLayersMapComponent.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/ScreenPopup.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/CQLFilterWrapper.js"></script>
                
                <script type="text/javascript" src="${contextPath}/viewer-html/common/ajax/LayerSelector.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/ajax/ServiceInfo.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/ajax/CSWClient.js"></script>
       			<script type="text/javascript" src="${contextPath}/viewer-html/common/ajax/FeatureService.js"></script>
       			<script type="text/javascript" src="${contextPath}/viewer-html/common/ajax/SLD.js"></script>
       			<script type="text/javascript" src="${contextPath}/viewer-html/common/ajax/Bookmark.js"></script>
       			<script type="text/javascript" src="${contextPath}/viewer-html/common/ajax/CombineImage.js"></script>
       			<script type="text/javascript" src="${contextPath}/viewer-html/common/ajax/FeatureInfo.js"></script>
       			<script type="text/javascript" src="${contextPath}/viewer-html/common/ajax/EditFeature.js"></script>
       			<script type="text/javascript" src="${contextPath}/viewer-html/common/ajax/ArcQueryUtil.js"></script>
            </c:when>
            <c:otherwise>
                <script type="text/javascript" src="${contextPath}/viewer-html/viewercontroller-compiled.js"></script>
            </c:otherwise>
        </c:choose>

        <script type="text/javascript" src="${contextPath}/viewer-html/common/layout.js"></script>

        <style type="text/css">
            /* Main background colors */
            .x-border-layout-ct {
                background-color: #FFFFFF;
            }

            <c:if test="${!empty actionBean.application.details.steunkleur1 && !empty actionBean.application.details.steunkleur2}">
                <c:set var="steunkleur1" value="${actionBean.application.details.steunkleur1}" />
                <c:set var="steunkleur2" value="${actionBean.application.details.steunkleur2}" />
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
                    background-image: -moz-linear-gradient(center top , ${steunkleur1}, ${steunkleur1});
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
            <c:if test="${!empty actionBean.application.details.font}">
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
                    font-family: ${actionBean.application.details.font};
                }
            </c:if>
        </style>
        
        ${actionBean.componentSourceHTML}
    </head>
    <body>

        <script type="text/javascript">
            
            if(console == undefined) {
                var console = {};
                console.log = function(logmsg) {
                    //alert(logmsg);
                }
            }
                
            var contextPath = "${contextPath}";
            var absoluteURIPrefix = "${absoluteURIPrefix}";

            var actionBeans = { 
                "service":            <js:quote><stripes:url beanclass="nl.b3p.viewer.stripes.ServiceActionBean"/></js:quote>,
                "feature":            <js:quote><stripes:url beanclass="nl.b3p.viewer.stripes.FeatureActionBean"/></js:quote>,
                "sld":                <js:quote><stripes:url beanclass="nl.b3p.viewer.stripes.SldActionBean"/></js:quote>,
                "bookmark":           <js:quote><stripes:url beanclass="nl.b3p.viewer.stripes.BookmarkActionBean"/></js:quote>,
                "layerlist":          <js:quote><stripes:url beanclass="nl.b3p.viewer.stripes.LayerListActionBean"/></js:quote>,
                "geoserviceregistry": <js:quote><stripes:url beanclass="nl.b3p.viewer.stripes.GeoServiceRegistryActionBean"/></js:quote>,
                "attributes":         <js:quote><stripes:url beanclass="nl.b3p.viewer.stripes.AttributesActionBean"/></js:quote>,
                "combineimage":       <js:quote><stripes:url beanclass="nl.b3p.viewer.stripes.CombineImageActionBean"/></js:quote>,
                "drawing":            <js:quote><stripes:url beanclass="nl.b3p.viewer.stripes.DrawingActionBean"/></js:quote>,
                "print":              <js:quote><stripes:url beanclass="nl.b3p.viewer.stripes.PrintActionBean"/></js:quote>,
                "featureinfo":        <js:quote><stripes:url beanclass="nl.b3p.viewer.stripes.FeatureInfoActionBean"/></js:quote>,
                "editfeature":        <js:quote><stripes:url beanclass="nl.b3p.viewer.stripes.EditFeatureActionBean"/></js:quote>,
                "csw":                <js:quote><stripes:url beanclass="nl.b3p.viewer.stripes.CatalogSearchActionBean"/></js:quote>,
                "arcqueryutil":       <js:quote><stripes:url beanclass="nl.b3p.viewer.stripes.ArcQueryUtilActionBean"/></js:quote>
            };
             
            var appId = "${actionBean.application.id}";
            var viewerController;
            (function() {
                var config = ${actionBean.appConfigJSON};
          
                Ext.onReady(function() {
                    //TODO set the correct viewertype
                    
                    var viewerType = "${viewerType}";
                    viewerController = new viewer.viewercontroller.ViewerController(viewerType, null, config);
                    Ext.EventManager.onWindowResize(function () {
                        viewerController.resizeComponents();
                    });
                });
            }());
            
        </script>

        <c:set var="maxWidth" value="none" />
        <c:set var="maxHeight" value="none" />
        <c:if test="${!empty actionBean.application.details.maxWidth && actionBean.application.details.maxWidth != 0}">
            <c:set var="maxWidth" value="${actionBean.application.details.maxWidth}px" />
        </c:if>
        <c:if test="${!empty actionBean.application.details.maxHeight && actionBean.application.details.maxHeight != 0}">
            <c:set var="maxHeight" value="${actionBean.application.details.maxHeight}px" />
        </c:if>
        <div id="wrapper" style="width: 100%; height: 100%; max-width: ${maxWidth}; max-height: ${maxHeight}; margin-left: auto; margin-right: auto;"></div>
        
    </body>
</html>
