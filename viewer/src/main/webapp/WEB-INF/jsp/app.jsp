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
<html class="x-border-box theme-triton">
    <head>
        <title><c:out value="${actionBean.title}"/></title>

        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">

        <link rel="stylesheet" type="text/css" href="${contextPath}/extjs/resources/css/triton/theme-triton-all_1.css">
        <link rel="stylesheet" type="text/css" href="${contextPath}/extjs/resources/css/triton/theme-triton-all_2.css">
        <script type="text/javascript" src="${contextPath}/viewer-html/common/FlamingoErrorLogger.js"></script>
        <script type="text/javascript">
            var FlamingoErrorLogger = createFlamingoErrorLogger(
                "${actionBean.application.name}",
                "${actionBean.application.id}",
                <js:quote><stripes:url beanclass="nl.b3p.viewer.stripes.ClientsideErrorLoggerActionBean"/></js:quote>
            );
            window.onerror = FlamingoErrorLogger;
        </script>
        <script type="text/javascript" src="${contextPath}/viewer-html/i18n/i18next.11.9.0.min.js"></script>
        <script type="text/javascript" src="<stripes:url beanclass="nl.b3p.viewer.stripes.I18nActionBean" event="i18nextJs"><stripes:param name="language" value="${actionBean.language}"/></stripes:url>"></script>

        <link href="${contextPath}/resources/css/viewer.css" rel="stylesheet">
        <link href="${contextPath}/viewer-html/components/resources/css/maptip.css" rel="stylesheet">
        <link href="${contextPath}/viewer-html/components/resources/css/featureinfo.css" rel="stylesheet">
        <link href="${contextPath}/viewer-html/components/resources/css/relatedDocuments.css" rel="stylesheet">
        <link href="${contextPath}/viewer-html/components/resources/css/logger.css" rel="stylesheet">
        <link href="${contextPath}/viewer-html/components/resources/css/simpleFilter.css" rel="stylesheet">
        <link href="${contextPath}/viewer-html/components/resources/css/attributeList.css" rel="stylesheet">
        <c:if test="${actionBean.viewerType == 'openlayers'}">
            <link href="${contextPath}/viewer-html/common/resources/css/openlayers.css" rel="stylesheet">
        </c:if>
        <link href="${contextPath}/viewer-html/svg/svgsprite.css" rel="stylesheet">

    </head>
    <body>

        <div id="appLoader">
            <div class="spinner"><fmt:message key="viewer.app.0" /></div>
        </div>

        <div id="loadwrapper">
            <div id="loader"><fmt:message key="viewer.app.1" /></div>
        </div>

        <div id="wrapper"></div>

        <script type="text/javascript">
                            // IOS7 on iPad has an issue with height of the html/body
                            // http://stackoverflow.com/questions/19012135/ios-7-ipad-safari-landscape-innerheight-outerheight-layout-issue
                            // To resolve this issue we add a class to the HTML tag and set a fixed height for the wrapper + disable touch on html element (to prevent scroll / bounce effect)
                            if (navigator.userAgent.match(/iPad;.*CPU.*OS 7_\d/i) && !window.navigator.standalone) {
                                document.documentElement.className += ' ipad ios7';
                                document.ontouchmove = function(event){
                                    event.preventDefault();
                                };
                    }
        </script>


        <script type="text/javascript" src="${contextPath}/extjs/ext-all${param.debug == true ? '-debug' : ''}.js"></script>
        <c:if test="${actionBean.language eq 'nl_NL'}">
        <script type="text/javascript" src="${contextPath}/extjs/locale/locale-nl${param.debug == true ? '-debug' : ''}.js"></script>
        </c:if>

        <script type="text/javascript" src="${contextPath}/viewer-html/common/proj4js-compressed.js"></script>

        <c:if test="${actionBean.viewerType == 'flamingo'}">
            <script type="text/javascript" src="${contextPath}/viewer-html/common/swfobject.js"></script>
        </c:if>
        <c:if test="${actionBean.viewerType == 'openlayers'}">

            <c:choose>
                <c:when test="${param.ol == 'debug'}">
                    <script type="text/javascript" src="${contextPath}/viewer-html/common/openlayers/lib/OpenLayers.js"></script>
                </c:when>
                <c:otherwise>
                    <script type="text/javascript" src="${contextPath}/viewer-html/common/openlayers/OpenLayers.js"></script>
                </c:otherwise>
            </c:choose>
        </c:if>
                         
        <c:if test="${actionBean.viewerType == 'openlayers5'}">
               <link href="${contextPath}/viewer-html/common/ol/ol.css" rel="stylesheet">  
               <link href="${contextPath}/viewer-html/common/resources/css/openlayers.css" rel="stylesheet">
               <script src="http://cdnjs.cloudflare.com/ajax/libs/proj4js/2.3.6/proj4.js" type="text/javascript"></script>
               <c:set var="olStylesheet"><stripes:url beanclass="nl.b3p.viewer.stripes.CSSActionBean" /></c:set>
               <link href="${olStylesheet}?theme=flamingo&app=${actionBean.application.id}" rel="stylesheet">
               
               <c:choose>
                <c:when test="${param.debug == true}">
                    <script type="text/javascript" src="${contextPath}/viewer-html/common/ol/debug/ol.js"></script>
                </c:when>
                <c:otherwise>
                    <script type="text/javascript" src="${contextPath}/viewer-html/common/ol/ol.js"></script>
                </c:otherwise>
            </c:choose>
        </c:if>

        <c:choose>
            <c:when test="${!(param.debug == true)}">
                <script type="text/javascript" src="${contextPath}/viewer-html/viewer-min.js?${project.version}"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/${actionBean.viewerType}-min.js?${version}"></script>
            </c:when>
            <c:otherwise>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/AppLoader.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/AppStyle.js"></script>

                <script type="text/javascript" src="${contextPath}/viewer-html/common/MobileManager.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/ViewerController.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/MapComponent.js"></script>

                <script type="text/javascript" src="${contextPath}/viewer-html/components/Component.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/components/LogMessage.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/components/Logger.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/components/RequestManager.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/components/DataSelectionChecker.js"></script>

                
                <script type="text/javascript" src="${contextPath}/viewer-html/common/ScreenPopup.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/CQLFilterWrapper.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/FeatureInfoWrapper.js"></script>
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
                <script type="text/javascript" src="${scriptDir}/EditBulkFeature.js"></script>
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
                <script type="text/javascript" src="${scriptDir}/FeatureStyle.js"></script>
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
                        <script type="text/javascript" src="${scriptDir}/OpenLayersMeasure.js"></script>
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

                        <!-- The components -->
                        <script type="text/javascript" src="${scriptDir}/components/LoadingPanel.js"></script>
                        <script type="text/javascript" src="${scriptDir}/components/OpenLayersBorderNavigation.js"></script>
                        <script type="text/javascript" src="${scriptDir}/components/OpenLayersLoadMonitor.js"></script>
                        <script type="text/javascript" src="${scriptDir}/components/OpenLayersOverview.js"></script>
                        <script type="text/javascript" src="${scriptDir}/components/OpenLayersMaptip.js"></script>

                        <!-- The tools -->
                        <script type="text/javascript" src="${scriptDir}/tools/OpenLayersIdentifyTool.js"></script>
                        <script type="text/javascript" src="${scriptDir}/tools/OpenLayersMeasureTool.js"></script>
                        <script type="text/javascript" src="${scriptDir}/tools/OpenLayersDefaultTool.js"></script>
                        <script type="text/javascript" src="${scriptDir}/tools/OpenLayersMeasureHandler.js"></script>
                    </c:when>
                    <c:when test="${actionBean.viewerType == 'openlayers5'}">
                        <c:set var="scriptDir" value="${contextPath}/viewer-html/common/viewercontroller/ol"/>
                        <script type="text/javascript" src="${scriptDir}/OlLayer.js"></script>
                        <script type="text/javascript" src="${scriptDir}/OpenLayers5Map.js"></script>
                        <script type="text/javascript" src="${scriptDir}/Utils.js"></script>
                        <script type="text/javascript" src="${scriptDir}/OlTilingLayer.js"></script>
                        <script type="text/javascript" src="${scriptDir}/OlMapComponent.js"></script>
                        <script type="text/javascript" src="${scriptDir}/OlComponent.js"></script>
                        <script type="text/javascript" src="${scriptDir}/OlTool.js"></script>
                        <script type="text/javascript" src="${scriptDir}/ToolMapClick.js"></script>
                        <script type="text/javascript" src="${scriptDir}/OlWMSLayer.js"></script>
                        <script type="text/javascript" src="${scriptDir}/OlArcLayer.js"></script>
                        <script type="text/javascript" src="${scriptDir}/OlVectorLayer.js"></script>
                        <script type="text/javascript" src="${scriptDir}/OlArcServerLayer.js"></script>
                        <script type="text/javascript" src="${scriptDir}/OlSnappingController.js"></script>
                        <script type="text/javascript" src="${scriptDir}/OlImageLayer.js"></script>
                        
                        
                        <!-- The components -->
                        <script type="text/javascript" src="${scriptDir}/components/panZoomBar.js"></script>
                        <script type="text/javascript" src="${scriptDir}/components/LoadingPanel.js"></script>
                        <script type="text/javascript" src="${scriptDir}/components/OlLoadMonitor.js"></script>
                        <script type="text/javascript" src="${scriptDir}/components/OlMaptip.js"></script>
                        <script type="text/javascript" src="${scriptDir}/components/OlOverview.js"></script>
                        
                        <!-- The tools -->
                        <script type="text/javascript" src="${scriptDir}/tools/OlIdentifyTool.js"></script>
                        <script type="text/javascript" src="${scriptDir}/tools/OlDefaultTool.js"></script>
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

        <script type="text/javascript" src="${contextPath}/viewer-html/common/layout.js"></script>

        ${actionBean.componentSourceHTML}

        <script type="text/javascript">

            if(console == undefined) {
                var console = {};
                console.log = function(logmsg) {
                    //alert(logmsg);
                };
            }


            var actionBeans = {
                "app":                <js:quote><stripes:url beanclass="nl.b3p.viewer.stripes.ApplicationActionBean"/></js:quote>,
                "appConfig":          <js:quote><stripes:url beanclass="nl.b3p.viewer.stripes.ApplicationActionBean" event="retrieveAppConfigJSON" /></js:quote>,
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
                "editbulkfeature":    <js:quote><stripes:url beanclass="nl.b3p.viewer.stripes.EditBulkFeatureActionBean"/></js:quote>,
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
                "featureExtent":      <js:quote><stripes:url beanclass="nl.b3p.viewer.stripes.FeatureExtentActionBean"/></js:quote>,
                "featureReport":      <js:quote><stripes:url beanclass="nl.b3p.viewer.stripes.FeatureReportActionBean"/></js:quote>,
                "ontbrandings":       <js:quote><stripes:url beanclass="nl.b3p.viewer.stripes.OntbrandingsActionBean"/></js:quote>,
                "file":               <js:quote><stripes:url beanclass="nl.b3p.viewer.stripes.FileUploadActionBean"/></js:quote>,
                "wkt":                <js:quote><stripes:url beanclass="nl.b3p.viewer.stripes.WriteWKTActionBean"/></js:quote>,
                "contact":            <js:quote><stripes:url beanclass="nl.b3p.viewer.stripes.ContactActionBean"/></js:quote>,
                "simplify":            <js:quote><stripes:url beanclass="nl.b3p.viewer.stripes.SimplifyFeatureActionBean"/></js:quote>
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

            var FlamingoAppLoader = Ext.create("viewer.AppLoader", {
                appId: "${actionBean.application.id}",
                viewerType: <js:quote value="${actionBean.viewerType}"/>,
                debugMode: <c:choose><c:when test="${param.debug == true}">true</c:when><c:otherwise>false</c:otherwise></c:choose>,
                user: <c:choose><c:when test="${actionBean.user != null}">${actionBean.user}</c:when><c:otherwise>null</c:otherwise></c:choose>,
                loginUrl: <js:quote><stripes:url prependContext="true" value="${actionBean.loginUrl}"/></js:quote>,
                logoutUrl: <js:quote><stripes:url prependContext="true" value="${actionBean.loginUrl}"><stripes:param name="logout" value="true"/></stripes:url></js:quote>,
                logoutAndReturnUrl: <js:quote><stripes:url prependContext="true" value="${actionBean.loginUrl}"><stripes:param name="logout" value="true"/><stripes:param name="returnAfterLogout" value="true"/></stripes:url></js:quote>,
                contextPath: "${contextPath}",
                absoluteURIPrefix: "${absoluteURIPrefix}",
                actionbeanUrl: actionBeans["appConfig"]

                        });

        </script>

        <%@include file="/WEB-INF/jsp/app_overrides.jsp"%>

        <script>
            <%-- allow app_overrides to redirect before firing off Ajax requests,
                 for instance to check a single-sign login / passive SAML request --%>
            FlamingoAppLoader.loadApplication();
        </script>
    </body>
</html>
