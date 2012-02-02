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

        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">

        <link rel="stylesheet" type="text/css" href="${contextPath}/extjs/resources/css/ext-all-gray.css">
        <link href="${contextPath}/resources/css/viewer.css" rel="stylesheet">
        
        <script type="text/javascript" src="${contextPath}/extjs/ext-all${param.debug == true ? '-debug' : ''}.js"></script>
        
        <script type="text/javascript" src="${contextPath}/extjs/locale/ext-lang-nl.js"></script>
        <script type="text/javascript" src="${contextPath}/viewer-html/common/swfobject.js"></script>
        <c:choose>
            <c:when test="${param.debug == true}">
                <!-- Also add scripts to <projectdir>/minify/build.xml, so it's build as minified for non debug use -->
                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/ViewerController.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/components/Component.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/components/TOC.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/components/tools/Tool.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/components/tools/ZoomIn.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/components/tools/ZoomOut.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/components/tools/FeatureInfo.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/components/tools/Pan.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/components/tools/SuperPan.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/components/tools/Measure.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/components/tools/FullExtent.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/components/tools/NextExtent.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/components/tools/PreviousExtent.js"></script>

                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Controller/Map.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Controller/Layer.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Controller/MapTip.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Controller/Extent.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Controller/Feature.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Controller/Event.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Controller/Tool.js"></script>

                <!--script type="text/javascript" src="scripts/viewer-html/common/viewercontroller/OpenLayers/OpenLayersLayer.js"></script>
                <script type="text/javascript" src="scripts/viewer-html/common/viewercontroller/OpenLayers/OpenLayersWMSLayer.js"></script>
                <script type="text/javascript" src="scripts/viewer-html/common/viewercontroller/OpenLayers/OpenLayersVectorLayer.js"></script>
                <script type="text/javascript" src="scripts/viewer-html/common/viewercontroller/OpenLayers/OpenLayersImageLayer.js"></script>
                <script type="text/javascript" src="scripts/viewer-html/common/viewercontroller/OpenLayers/OpenLayersTMSLayer.js"></script>
                <script type="text/javascript" src="scripts/viewer-html/common/viewercontroller/OpenLayers/OpenLayersTool.js"></script>
                <script type="text/javascript" src="scripts/viewer-html/common/viewercontroller/OpenLayers/OpenLayersIdentifyTool.js"></script>
                <script type="text/javascript" src="scripts/viewer-html/common/viewercontroller/OpenLayers/OpenLayersMap.js"></script>
                <script type="text/javascript" src="scripts/viewer-html/common/viewercontroller/OpenLayers/Utils.js"></script-->

                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Flamingo/FlamingoLayer.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Flamingo/FlamingoWMSLayer.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Flamingo/FlamingoArcIMSLayer.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Flamingo/FlamingoVectorLayer.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Flamingo/FlamingoMap.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/Flamingo/FlamingoTool.js"></script>

                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/MapComponent.js"></script>
                <script type="text/javascript" src="${contextPath}/viewer-html/common/viewercontroller/FlamingoMapComponent.js"></script>
            </c:when>
            <c:otherwise>
                 <script type="text/javascript" src="${contextPath}/viewer-html/viewercontroller-compiled.js"></script>
            </c:otherwise>
        </c:choose>
       
        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewer.js"></script>
        <script type="text/javascript" src="${contextPath}/viewer-html/common/jsonConfig.js"></script>
        <script type="text/javascript" src="${contextPath}/viewer-html/common/layout.js"></script>

<%-- ${actionBean.componentSourceHTML} --%>
    </head>
    <body>

        <script type="text/javascript">
            ${actionBean.script}
          
            var contextPath = "${contextPath}";
            var viewerController;
            Ext.onReady(function(){

                //initLayout();
                viewerController = new viewer.viewercontroller.ViewerController("flamingo",mapId,app);

                initMapComponent();
            });

        </script>

        
        <%-- initLayout();
        <div id="leftmargin_top" style="height: 90%;width: 15%;float:left;">sdfgsdfg</div>
        <div id="map" style="height: 90%;width: 60%;float:left;">
            <font color="red"><strong>U heeft de Flash plugin nodig om de kaart te kunnen zien.<br/>Deze kunt u <a href="http://get.adobe.com/flashplayer/" target="_blank">hier</a> gratis downloaden.</strong></font>
        </div>
        <div id="rightmargin_top" style="height: 90%;width: 15%; float: right;">rechts</div>
         --%>
        <div id="wrapper" style="width: 100%; height: 100%;">
            
        </div>
    </body>
</html>
