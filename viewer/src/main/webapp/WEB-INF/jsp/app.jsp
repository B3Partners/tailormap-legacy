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

<!DOCTYPE html>
<html class="x-border-box">
    <head>
        <title><c:out value="${actionBean.application.name}"/></title>

        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">

        <script type="text/javascript" src="${contextPath}/viewer-html/common/FlamingoErrorLogger.js"></script>
        <script type="text/javascript">
            var FlamingoErrorLogger = createFlamingoErrorLogger(
                "${actionBean.application.name}",
                "${actionBean.application.id}",
                <js:quote><stripes:url beanclass="nl.b3p.viewer.stripes.ClientsideErrorLoggerActionBean"/></js:quote>
            );
            window.onerror = FlamingoErrorLogger;

            var MobileManager = function() {
                // Originial script: http://detectmobilebrowsers.com
                var mobile = (function(a){return(/android|avantgo|bada\/|blackberry|playbook|silk|blazer|compal|elaine|fennec|hiptop|iemobile|ip(ad|hone|od)|iris|kindle|lge |maemo|meego.+mobile|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(di|rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))})(navigator.userAgent||navigator.vendor||window.opera);
                var ios = /ip(ad|hone|od)/i.test(navigator.userAgent);
                var android = /android/i.test(navigator.userAgent);
                var currentPopup = null;
                var closePopup = function() {
                    currentPopup.hide();
                };
                return {
                    isMobile: function() { return mobile${param.mobile == true ? ' || true' : ''}; },
                    isIOS: function() { return ios; },
                    isAndroid: function() { return android; },
                    getOrientation: function() { return (ios ? ( window.orientation == 90 || window.orientation == -90 ) : ( screen.width > screen.height )) ? 'landscape' : 'portrait'; }
                };
            }();
                    if(!MobileManager.isMobile()) {
                            document.write('<link rel="stylesheet" type="text/css" href="${contextPath}/extjs/resources/css/crisp/ext-theme-crisp-all.css">');
                    } else {
                            // IOS7 on iPad has an issue with height of the html/body
                            // http://stackoverflow.com/questions/19012135/ios-7-ipad-safari-landscape-innerheight-outerheight-layout-issue
                            // To resolve this issue we add a class to the HTML tag and set a fixed height for the wrapper + disable touch on html element (to prevent scroll / bounce effect)
                            if (navigator.userAgent.match(/iPad;.*CPU.*OS 7_\d/i) && !window.navigator.standalone) {
                                document.documentElement.className += ' ipad ios7';
                                document.ontouchmove = function(event){
                                    event.preventDefault();
                                };
                            }
                            document.documentElement.className += ' mobile-mode';
                            document.write('<link rel="stylesheet" type="text/css" href="${contextPath}/extjs/resources/css/touch-crisp/ext-theme-crisp-touch-all.css">');
                    }
        </script>

        <link href="${contextPath}/resources/css/viewer.css" rel="stylesheet">

        <%--XXX must only be loaded if component is added --%>
        <link href="${contextPath}/viewer-html/components/resources/css/maptip.css" rel="stylesheet">
        <link href="${contextPath}/viewer-html/components/resources/css/featureinfo.css" rel="stylesheet">
        <link href="${contextPath}/viewer-html/components/resources/css/relatedDocuments.css" rel="stylesheet">
        <link href="${contextPath}/viewer-html/components/resources/css/logger.css" rel="stylesheet">
        <link href="${contextPath}/viewer-html/components/resources/css/simpleFilter.css" rel="stylesheet">
        <link href="${contextPath}/viewer-html/components/resources/css/attributeList.css" rel="stylesheet">

        <script type="text/javascript" src="${contextPath}/extjs/ext-all${param.debug == true ? '-debug' : ''}.js"></script>
        <script type="text/javascript" src="${contextPath}/extjs/locale/ext-locale-nl.js"></script>

        <script type="text/javascript" src="${contextPath}/viewer-html/common/proj4js-compressed.js"></script>

        <c:if test="${actionBean.viewerType == 'flamingo'}">
            <script type="text/javascript" src="${contextPath}/viewer-html/common/swfobject.js"></script>
        </c:if>
        <c:if test="${actionBean.viewerType == 'openlayers'}">
            <link href="${contextPath}/viewer-html/common/resources/css/openlayers.css" rel="stylesheet">

            <c:choose>
                <c:when test="${param.ol == 'debug'}">
                    <script type="text/javascript" src="${contextPath}/viewer-html/common/openlayers/lib/OpenLayers.js"></script>
                </c:when>
                <c:otherwise>
                    <script type="text/javascript" src="${contextPath}/viewer-html/common/openlayers/OpenLayers.js"></script>
                </c:otherwise>
            </c:choose>
        </c:if>
                            
        <c:if test="${actionBean.viewerType == 'openlayers3'}">
               <link href="${contextPath}/viewer-html/common/openlayers3/theme/openlayers3.css" rel="stylesheet">
               <link href="${contextPath}/viewer-html/common/resources/css/default.css" rel="stylesheet">
               <script type="text/javascript" src="${contextPath}/viewer-html/common/openlayers3/OpenLayers.js"></script>
        </c:if>
               
        <c:choose>
            <c:when test="${!(param.debug == true)}">
                <script type="text/javascript" src="${contextPath}/viewer-html/viewer-min.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/${actionBean.viewerType}-min.js"></script>
            </c:when>
            <c:otherwise>
                <%-- Also add scripts to <projectdir>/minify/build.xml, so it's build as minified for non debug use --%>

                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/ViewerController.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/MapComponent.js"></script>

                <script type="text/javascript" src="${contextPath}/viewer-html/components/Component.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/components/LogMessage.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/components/Logger.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/components/RequestManager.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/components/DataSelectionChecker.js"></script>

                <script type="text/javascript" src="${contextPath}/viewer-html/common/overrides.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/ScreenPopup.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/CQLFilterWrapper.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/ClearTrigger.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/LocalStorage.js"></script>

                <c:set var="scriptDir" value="${contextPath}/viewer-html/common/ajax"/>
                <script type="text/javascript" src="${scriptDir}/ServiceInfo.js"></script>
                <script type="text/javascript" src="${scriptDir}/CSWClient.js"></script>
                <script type="text/javascript" src="${scriptDir}/FeatureExtent.js"></script>
                <script type="text/javascript" src="${scriptDir}/FeatureService.js"></script>
                <script type="text/javascript" src="${scriptDir}/SLD.js"></script>
                <script type="text/javascript" src="${scriptDir}/Bookmark.js"></script>
                <script type="text/javascript" src="${scriptDir}/LayerSelector.js"></script>
                <script type="text/javascript" src="${scriptDir}/CombineImage.js"></script>
                <script type="text/javascript" src="${scriptDir}/FeatureInfo.js"></script>
                <script type="text/javascript" src="${scriptDir}/EditFeature.js"></script>
                <script type="text/javascript" src="${scriptDir}/ArcQueryUtil.js"></script>

                <c:set var="scriptDir" value="${contextPath}/viewer-html/common/viewercontroller/controller"/>
                <script type="text/javascript" src="${scriptDir}/Map.js"></script>
                <script type="text/javascript" src="${scriptDir}/Layer.js"></script>
                <script type="text/javascript" src="${scriptDir}/TilingLayer.js"></script>
                <script type="text/javascript" src="${scriptDir}/WMSLayer.js"></script>
                <script type="text/javascript" src="${scriptDir}/ImageLayer.js"></script>
                <script type="text/javascript" src="${scriptDir}/VectorLayer.js"></script>
                <script type="text/javascript" src="${scriptDir}/ArcLayer.js"></script>
                <script type="text/javascript" src="${scriptDir}/Feature.js"></script>
                <script type="text/javascript" src="${scriptDir}/MapTip.js"></script>
                <script type="text/javascript" src="${scriptDir}/Extent.js"></script>
                <script type="text/javascript" src="${scriptDir}/Event.js"></script>
                <script type="text/javascript" src="${scriptDir}/Tool.js"></script>
                <script type="text/javascript" src="${scriptDir}/Component.js"></script>
                <script type="text/javascript" src="${scriptDir}/ToolMapClick.js"></script>
                <script type="text/javascript" src="${scriptDir}/SnappingController.js"></script>

                <c:choose>
                    <c:when test="${actionBean.viewerType == 'openlayers'}">
                        <c:set var="scriptDir" value="${contextPath}/viewer-html/common/viewercontroller/openlayers"/>
                        <script type="text/javascript" src="${scriptDir}/OpenLayersLayer.js"></script>
                        <script type="text/javascript" src="${scriptDir}/OpenLayersArcLayer.js"></script>
                        <script type="text/javascript" src="${scriptDir}/OpenLayersArcIMSLayer.js"></script>
                        <script type="text/javascript" src="${scriptDir}/OpenLayersArcServerLayer.js"></script>
                        <script type="text/javascript" src="${scriptDir}/OpenLayersWMSLayer.js"></script>
                        <script type="text/javascript" src="${scriptDir}/OpenLayersVectorLayer.js"></script>
                        <script type="text/javascript" src="${scriptDir}/OpenLayersImageLayer.js"></script>
                        <script type="text/javascript" src="${scriptDir}/OpenLayersTilingLayer.js"></script>
                        <script type="text/javascript" src="${scriptDir}/OpenLayersTool.js"></script>
                        <script type="text/javascript" src="${scriptDir}/OpenLayersMap.js"></script>
                        <script type="text/javascript" src="${scriptDir}/Utils.js"></script>
                        <script type="text/javascript" src="${scriptDir}/ToolMapClick.js"></script>
                        <script type="text/javascript" src="${scriptDir}/OpenLayersComponent.js"></script>
                        <script type="text/javascript" src="${scriptDir}/OpenLayersMapComponent.js"></script>
                        <script type="text/javascript" src="${scriptDir}/OpenLayersSnappingController.js"></script>
                        <script type="text/javascript" src="${scriptDir}/OpenLayersMeasure.js"></script>

                        <!-- The components -->
                        <script type="text/javascript" src="${scriptDir}/components/LoadingPanel.js"></script>
                        <script type="text/javascript" src="${scriptDir}/components/OpenLayersBorderNavigation.js"></script>
                        <script type="text/javascript" src="${scriptDir}/components/OpenLayersLoadMonitor.js"></script>
                        <script type="text/javascript" src="${scriptDir}/components/OpenLayersOverview.js"></script>
                        <script type="text/javascript" src="${scriptDir}/components/OpenLayersMaptip.js"></script>

                        <!-- The tools -->
                        <script type="text/javascript" src="${scriptDir}/tools/OpenLayersIdentifyTool.js"></script>
                        <script type="text/javascript" src="${scriptDir}/tools/OpenLayersDefaultTool.js"></script>
                    </c:when>
                    
                        <c:when test="${actionBean.viewerType == 'openlayers3'}">
                        <c:set var="scriptDir" value="${contextPath}/viewer-html/common/viewercontroller/openlayers3"/>
                        <script src="http://cdnjs.cloudflare.com/ajax/libs/proj4js/2.3.6/proj4.js" type="text/javascript"></script>
                        <script type="text/javascript" src="${scriptDir}/OpenLayers3Layer.js"></script>
                        <script type="text/javascript" src="${scriptDir}/OpenLayersMap3.js"></script>
                        <script type="text/javascript" src="${scriptDir}/Utils.js"></script>
                        <script type="text/javascript" src="${scriptDir}/OpenLayers3TilingLayer.js"></script>
                        <script type="text/javascript" src="${scriptDir}/OpenLayersMap3Component.js"></script>
                        <script type="text/javascript" src="${scriptDir}/OpenLayers3Component.js"></script>
                        <script type="text/javascript" src="${scriptDir}/OpenLayers3Tool.js"></script>
                        <script type="text/javascript" src="${scriptDir}/ToolMapClick3.js"></script>
                        <script type="text/javascript" src="${scriptDir}/OpenLayers3WMSLayer.js"></script>
                        <script type="text/javascript" src="${scriptDir}/OpenLayers3ArcLayer.js"></script>
                        <script type="text/javascript" src="${scriptDir}/OpenLayers3VectorLayer.js"></script>
                        <script type="text/javascript" src="${scriptDir}/OpenLayers3ArcServerLayer.js"></script>
                        <script type="text/javascript" src="${scriptDir}/OpenLayers3SnappingController.js"></script>
                        <script type="text/javascript" src="${scriptDir}/OpenLayers3ImageLayer.js"></script>
                        
                        
                        <!-- The components -->
                        <script type="text/javascript" src="${scriptDir}/components/LoadingPanel.js"></script>
                        <script type="text/javascript" src="${scriptDir}/components/OpenLayers3LoadMonitor.js"></script>
                        <script type="text/javascript" src="${scriptDir}/components/OpenLayers3Maptip.js"></script>
                        
                        <!-- The tools -->
                        <script type="text/javascript" src="${scriptDir}/tools/OpenLayers3IdentifyTool.js"></script>
                        <script type="text/javascript" src="${scriptDir}/tools/OpenLayers3DefaultTool.js"></script>
                        <script type="text/javascript" src="${scriptDir}/tools/ZoomIn.js"></script>
                        <script type="text/javascript" src="${scriptDir}/tools/ZoomOutButton.js"></script>
                        <script type="text/javascript" src="${scriptDir}/tools/Measure.js"></script>
                        <script type="text/javascript" src="${scriptDir}/tools/FullExtent.js"></script>
                        <script type="text/javascript" src="${scriptDir}/tools/ToolButton.js"></script> 
                        <script type="text/javascript" src="${scriptDir}/tools/DragPan.js"></script>
                        <script type="text/javascript" src="${scriptDir}/tools/StreetViewButton.js"></script>
                    </c:when>
                        
                    <c:otherwise>
                        <c:set var="scriptDir" value="${contextPath}/viewer-html/common/viewercontroller/flamingo"/>
                        <script type="text/javascript" src="${scriptDir}/FlamingoLayer.js"></script>
                        <script type="text/javascript" src="${scriptDir}/FlamingoArcLayer.js"></script>
                        <script type="text/javascript" src="${scriptDir}/FlamingoArcServerLayer.js"></script>
                        <script type="text/javascript" src="${scriptDir}/FlamingoArcIMSLayer.js"></script>
                        <script type="text/javascript" src="${scriptDir}/FlamingoWMSLayer.js"></script>
                        <script type="text/javascript" src="${scriptDir}/FlamingoVectorLayer.js"></script>
                        <script type="text/javascript" src="${scriptDir}/FlamingoMap.js"></script>
                        <script type="text/javascript" src="${scriptDir}/FlamingoTool.js"></script>
                        <script type="text/javascript" src="${scriptDir}/FlamingoImageLayer.js"></script>
                        <script type="text/javascript" src="${scriptDir}/FlamingoTilingLayer.js"></script>
                        <script type="text/javascript" src="${scriptDir}/ToolMapClick.js"></script>

                        <script type="text/javascript" src="${scriptDir}/FlamingoComponent.js"></script>

                        <script type="text/javascript" src="${scriptDir}/FlamingoMapComponent.js"></script>

                        <!-- The components -->
                        <script type="text/javascript" src="${scriptDir}/components/Overview.js"></script>

                        <script type="text/javascript" src="${scriptDir}/tools/JSButton.js"></script>
                        <script type="text/javascript" src="${scriptDir}/tools/FlamingoMeasureArea.js"></script>
                    </c:otherwise>
                </c:choose>

            </c:otherwise>
        </c:choose>

        <script type="text/javascript">
            if(MobileManager.isMobile()) {
                document.write('<meta name="HandheldFriendly" content="True">');
                document.write('<meta name="MobileOptimized" content="width=device-width; height=device-height; user-scalable=no; initial-scale=1.0; maximum-scale=1.0; minimum-scale=1.0">');
                document.write('<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, maximum-scale=1.0, minimum-scale=1.0">');
                document.write('<meta http-equiv="cleartype" content="on">');
            }
        </script>
        <script type="text/javascript" src="${contextPath}/viewer-html/common/layout.js"></script>

        <%@include file="app/style.jsp" %>

        ${actionBean.componentSourceHTML}
    </head>
    <body>
        <div id="loadwrapper">
            <div id="loader">Loading...</div>
        </div>
        <script type="text/javascript">

            if(console == undefined) {
                var console = {};
                console.log = function(logmsg) {
                    //alert(logmsg);
                };
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
                "advancedcsw":        <js:quote><stripes:url beanclass="nl.b3p.viewer.stripes.CatalogSearchActionBean" event="advancedSearch"/></js:quote>,
                "unique":             <js:quote><stripes:url beanclass="nl.b3p.viewer.stripes.UniqueValuesActionBean"/></js:quote>,
                "arcqueryutil":       <js:quote><stripes:url beanclass="nl.b3p.viewer.stripes.ArcQueryUtilActionBean"/></js:quote>,
                "proxy":              <js:quote><stripes:url beanclass="nl.b3p.viewer.stripes.ProxyActionBean"/></js:quote>,
                "datastorespinup":    <js:quote><stripes:url beanclass="nl.b3p.viewer.stripes.DataStoreSpinupActionBean"/></js:quote>,
                "autosuggest":        <js:quote><stripes:url beanclass="nl.b3p.viewer.stripes.SearchActionBean" event="autosuggest"/></js:quote>,
                "componentresource":  <js:quote><stripes:url beanclass="nl.b3p.viewer.stripes.ComponentResourceActionBean"/></js:quote>,
                "css":                <js:quote><stripes:url beanclass="nl.b3p.viewer.stripes.CSSActionBean"/></js:quote>,
                "download":           <js:quote><stripes:url beanclass="nl.b3p.viewer.stripes.DownloadFeaturesActionBean"/></js:quote>,
                "buffergeom":         <js:quote><stripes:url beanclass="nl.b3p.viewer.stripes.BufferActionBean" event="bufferGeometry"/></js:quote>,
                "cyclorama":          <js:quote><stripes:url beanclass="nl.b3p.viewer.stripes.CycloramaActionBean"/></js:quote>,
                "featureExtent":      <js:quote><stripes:url beanclass="nl.b3p.viewer.stripes.FeatureExtentActionBean"/></js:quote>
            };

            <c:if test="${actionBean.viewerType == 'openlayers'}">
                <%-- XXX maybe do this in the OpenLayersMapComponent; also check theme! --%>
                // tell OpenLayers where the control images are, remember the trailing slash
                OpenLayers.ImgPath = "${contextPath}/resources/images/openlayers_img/";
                /* Override util class OpenLayers to comply to ExtJS id regex */
                OpenLayers.Util.createUniqueID = function(prefix) {
                    if (prefix == null) {
                        prefix = "id_";
                    }
                    OpenLayers.Util.lastSeqID += 1;
                    // Added this replace, to make sure there are no dots in the ID
                    return prefix.replace(/\./g, '_') + OpenLayers.Util.lastSeqID;
                };
            </c:if>

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

                    var viewerType = <js:quote value="${actionBean.viewerType}"/>;

                    var listeners = {
                        // Cannot use viewer.viewercontroller.controller.Event.ON_COMPONENTS_FINISHED_LOADING for property name here
                        "ON_COMPONENTS_FINISHED_LOADING": updateLoginInfo
                    };
                    var mapConfig={};
                    if (viewerType=="flamingo"){
                        mapConfig.swfPath=contextPath+"/flamingo/flamingo.swf";
                    }
                    viewerController = new viewer.viewercontroller.ViewerController(viewerType, null, config, listeners,mapConfig);
                    if(!MobileManager.isMobile() || MobileManager.isAndroid() || window.onorientationchange === undefined) {
                        // Android devices seem to react better to window.resize than window.orientationchange, probably timing issue
                        Ext.on('resize', function () {
                            viewerController.resizeComponents(true);
                        });
                    } else {
                        // Listen for orientation changes
                        if(window.addEventListener) {
                            window.addEventListener("orientationchange", function() {
                                viewerController.resizeComponents(true);
                            }, false);
                        }
                    }
                });
            }());

        </script>

        <c:set var="maxWidth" value="none" />
        <c:set var="maxHeight" value="none" />
        <c:set var="margin" value="0" />
        <c:set var="backgroundColor" value="transparent" />
        <c:set var="backgroundImage" value="none" />
        <c:set var="backgroundRepeat" value="no-repeat" />
        <c:set var="backgroundPosition" value="0 0" />
        <c:forEach items="${actionBean.globalLayout}" var="globalLayout">
            <c:if test="${!empty globalLayout.value}">
                <c:if test="${globalLayout.key=='maxWidth' && globalLayout.value != '0'}">
                    <c:set var="maxWidth" value="${globalLayout.value}px" />
                </c:if>
                <c:if test="${globalLayout.key=='maxHeight' && globalLayout.value != '0'}">
                    <c:set var="maxHeight" value="${globalLayout.value}px" />
                </c:if>
                <c:if test="${globalLayout.key=='margin'}">
                    <c:set var="margin" value="${globalLayout.value}" />
                </c:if>
                <c:if test="${globalLayout.key=='backgroundColor'}">
                    <c:set var="backgroundColor" value="${globalLayout.value}" />
                </c:if>
                <c:if test="${globalLayout.key=='backgroundImage'}">
                    <c:set var="backgroundImage" value="url(${globalLayout.value})" />
                </c:if>
                <c:if test="${globalLayout.key=='backgroundRepeat'}">
                    <c:set var="backgroundRepeat" value="${globalLayout.value}" />
                </c:if>
                <c:if test="${globalLayout.key=='backgroundPosition'}">
                    <c:set var="backgroundPosition" value="${globalLayout.value}" />
                </c:if>
            </c:if>
        </c:forEach>
        <div id="wrapper" style="width: 100%; height: 100%; max-width: ${maxWidth}; max-height: ${maxHeight}; margin-left: auto; margin-right: auto; padding: ${margin}; background-color: ${backgroundColor}; background-image: ${backgroundImage}; background-repeat: ${backgroundRepeat}; background-position: ${backgroundPosition};"></div>

        <%@include file="/WEB-INF/jsp/app_overrides.jsp"%>
    </body>
</html>
