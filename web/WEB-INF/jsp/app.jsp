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
                <script type="text/javascript" src="${contextPath}/viewer-html/components/DataSelectionChecker.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/overrides.js"></script>
                
                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Controller/Map.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Controller/Layer.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Controller/TilingLayer.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Controller/WMSLayer.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Controller/ArcLayer.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Controller/ImageLayer.js"></script>                
                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Controller/VectorLayer.js"></script>                
                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Controller/MapTip.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Controller/Extent.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Controller/Feature.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Controller/Event.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Controller/Tool.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Controller/Component.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Controller/ToolMapClick.js"></script>

                <c:choose>
                    <c:when test="${viewerType == 'openlayers'}">
                        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/OpenLayers/OpenLayersLayer.js"></script>
                        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/OpenLayers/OpenLayersArcLayer.js"></script>
                        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/OpenLayers/OpenLayersArcIMSLayer.js"></script>
                        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/OpenLayers/OpenLayersArcServerLayer.js"></script>
                        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/OpenLayers/OpenLayersWMSLayer.js"></script>
                        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/OpenLayers/OpenLayersVectorLayer.js"></script>
                        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/OpenLayers/OpenLayersImageLayer.js"></script>
                        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/OpenLayers/OpenLayersTilingLayer.js"></script>
                        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/OpenLayers/OpenLayersTool.js"></script>
                        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/OpenLayers/OpenLayersIdentifyTool.js"></script>
                        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/OpenLayers/OpenLayersMap.js"></script>
                        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/OpenLayers/Utils.js"></script>
                        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/OpenLayers/ToolMapClick.js"></script>
                    </c:when>
                    <c:otherwise>
                        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Flamingo/FlamingoLayer.js"></script>
                        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Flamingo/FlamingoWMSLayer.js"></script>
                        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Flamingo/FlamingoArcLayer.js"></script>
                        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Flamingo/FlamingoArcServerLayer.js"></script>
                        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Flamingo/FlamingoArcIMSLayer.js"></script>
                        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Flamingo/FlamingoVectorLayer.js"></script>
                        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Flamingo/FlamingoImageLayer.js"></script>
                        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Flamingo/FlamingoTilingLayer.js"></script>
                        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Flamingo/FlamingoMap.js"></script>
                        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Flamingo/FlamingoTool.js"></script>
                        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Flamingo/FlamingoComponent.js"></script>
                        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Flamingo/ToolMapClick.js"></script>
                    </c:otherwise>
                </c:choose>
                    
                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/MapComponent.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/FlamingoMapComponent.js"></script>  
                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/OpenLayersMapComponent.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/ScreenPopup.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/CQLFilterWrapper.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/MobileSlider.js"></script>
                
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
       			<script type="text/javascript" src="${contextPath}/viewer-html/common/ajax/Twitter.js"></script>
            </c:when>
            <c:otherwise>
                <script type="text/javascript" src="${contextPath}/viewer-html/viewercontroller-compiled.js"></script>
            </c:otherwise>
        </c:choose>
		<script type="text/javascript">
            var MobileDetect = function() {
                // Originial script: http://detectmobilebrowsers.com
                var mobile = (function(a){return(/android|avantgo|bada\/|blackberry|playbook|silk|blazer|compal|elaine|fennec|hiptop|iemobile|ip(ad|hone|od)|iris|kindle|lge |maemo|meego.+mobile|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(di|rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))})(navigator.userAgent||navigator.vendor||window.opera);
                var ios = /ip(ad|hone|od)/i.test(navigator.userAgent);
                var android = /android/i.test(navigator.userAgent);
                var landscapeOrientation = (ios ? ( window.orientation == 90 || window.orientation == -90 ) : ( screen.width > screen.height ));
                return {
                    isMobile: function() { return mobile; },
                    isIOS: function() { return ios; },
                    isAndroid: function() { return android; },
                    isLandscape: function() { return landscapeOrientation; }
                };
            }();
			if(MobileDetect.isMobile()) {
				document.write('<meta name="HandheldFriendly" content="True">');
				document.write('<meta name="MobileOptimized" content="width=device-width; height=device-height; user-scalable=yes; initial-scale=1.0">');
				document.write('<meta name="viewport" content="width=device-width, initial-scale=1">');
				document.write('<meta http-equiv="cleartype" content="on">');
				document.write('<script type="text/javascript" src="${contextPath}/resources/js/hammer.js"></' + 'script>');
				document.write('<link href="${contextPath}/resources/css/mobile.css" rel="stylesheet">');
			}
		</script>
        <script type="text/javascript" src="${contextPath}/viewer-html/common/layout.js"></script>

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
                "unique":                <js:quote><stripes:url beanclass="nl.b3p.viewer.stripes.UniqueValuesActionBean"/></js:quote>,
                "twitter":                <js:quote><stripes:url beanclass="nl.b3p.viewer.stripes.TwitterActionBean"/></js:quote>, 
                "arcqueryutil":       <js:quote><stripes:url beanclass="nl.b3p.viewer.stripes.ArcQueryUtilActionBean"/></js:quote>
            };
        
            var user = null;
            
            var updateLoginInfo = function() { };
            <c:if test="${actionBean.user != null}">
                user = ${actionBean.user};
                
                updateLoginInfo = function() {
                    var link = document.getElementById("loginLink");
                    if(link) {
                        link.innerHTML = "Uitloggen";
                        link.onclick = logout;
                    }
                    var info = document.getElementById("loginInfo");
                    if(info) {
                        info.innerHTML = "Ingelogd als <b>" + user.name + "</b>";
                    }
                }
            </c:if>
            
            function login() {
                window.location.href = <js:quote><stripes:url prependContext="true" value="${actionBean.loginUrl}"/></js:quote>;
            }
            
            function logout() {
                window.location.href = 
                    <js:quote><stripes:url prependContext="true" value="${actionBean.loginUrl}">
                        <stripes:param name="logout" value="true"/></stripes:url></js:quote>;
            }
             
            var appId = "${actionBean.application.id}";
            var viewerController;
            (function() {
                var config = ${actionBean.appConfigJSON};
          
                Ext.onReady(function() {
                    //TODO set the correct viewertype
                    
                    var viewerType = "${viewerType}";
                    viewerController = new viewer.viewercontroller.ViewerController(viewerType, null, config);
                    if(!MobileDetect.isMobile() || MobileDetect.isAndroid() || window.onorientationchange === undefined) {
                        // Android devices seem to react better to window.resize than window.orientationchange, probably timing issue
                        Ext.EventManager.onWindowResize(function () {
                            viewerController.resizeComponents();
                        });
                    } else {
                        window.onorientationchange = function(){
                            viewerController.resizeComponents();
                        }
                    }
                                        
                    viewerController.addListener(viewer.viewercontroller.controller.Event.ON_COMPONENTS_FINISHED_LOADING, updateLoginInfo);
                });
            }());
            
        </script>

        <c:set var="maxWidth" value="none" />
        <c:set var="maxHeight" value="none" />
        <c:if test="${!empty actionBean.application.details.maxWidth.value && actionBean.application.details.maxWidth.value != 0}">
            <c:set var="maxWidth" value="${actionBean.application.details.maxWidth.value}px" />
        </c:if>
        <c:if test="${!empty actionBean.application.details.maxHeight.value && actionBean.application.details.maxHeight.value != 0}">
            <c:set var="maxHeight" value="${actionBean.application.details.maxHeight.value}px" />
        </c:if>
        <div id="wrapper" style="width: 100%; height: 100%; max-width: ${maxWidth}; max-height: ${maxHeight}; margin-left: auto; margin-right: auto;"></div>
        
    </body>
</html>
