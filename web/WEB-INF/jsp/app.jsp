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
        
        <script type="text/javascript" src="${contextPath}/viewer-html/common/webmapcontroller/ViewerController.js"></script>
         <script type="text/javascript" src="${contextPath}/viewer-html/components/Component.js"></script>
        <script type="text/javascript" src="${contextPath}/viewer-html/components/TOC.js"></script>

        <script type="text/javascript" src="${contextPath}/viewer-html/common/webmapcontroller/Controller/Map.js"></script>
        <script type="text/javascript" src="${contextPath}/viewer-html/common/webmapcontroller/Controller/Layer.js"></script>
        <script type="text/javascript" src="${contextPath}/viewer-html/common/webmapcontroller/Controller/MapTip.js"></script>
        <script type="text/javascript" src="${contextPath}/viewer-html/common/webmapcontroller/Controller/Extent.js"></script>
        <script type="text/javascript" src="${contextPath}/viewer-html/common/webmapcontroller/Controller/Feature.js"></script>
        <script type="text/javascript" src="${contextPath}/viewer-html/common/webmapcontroller/Controller/Event.js"></script>
        <script type="text/javascript" src="${contextPath}/viewer-html/common/webmapcontroller/Controller/Tool.js"></script>
        
        <!--script type="text/javascript" src="scripts/viewer-html/common/webmapcontroller/OpenLayers/OpenLayersLayer.js"></script>
        <script type="text/javascript" src="scripts/viewer-html/common/webmapcontroller/OpenLayers/OpenLayersWMSLayer.js"></script>
        <script type="text/javascript" src="scripts/viewer-html/common/webmapcontroller/OpenLayers/OpenLayersVectorLayer.js"></script>
        <script type="text/javascript" src="scripts/viewer-html/common/webmapcontroller/OpenLayers/OpenLayersImageLayer.js"></script>
        <script type="text/javascript" src="scripts/viewer-html/common/webmapcontroller/OpenLayers/OpenLayersTMSLayer.js"></script>
        <script type="text/javascript" src="scripts/viewer-html/common/webmapcontroller/OpenLayers/OpenLayersTool.js"></script>
        <script type="text/javascript" src="scripts/viewer-html/common/webmapcontroller/OpenLayers/OpenLayersIdentifyTool.js"></script>
        <script type="text/javascript" src="scripts/viewer-html/common/webmapcontroller/OpenLayers/OpenLayersMap.js"></script>
        <script type="text/javascript" src="scripts/viewer-html/common/webmapcontroller/OpenLayers/Utils.js"></script-->
        
        <script type="text/javascript" src="${contextPath}/viewer-html/common/webmapcontroller/Flamingo/FlamingoLayer.js"></script>
        <script type="text/javascript" src="${contextPath}/viewer-html/common/webmapcontroller/Flamingo/FlamingoWMSLayer.js"></script>
        <script type="text/javascript" src="${contextPath}/viewer-html/common/webmapcontroller/Flamingo/FlamingoArcIMSLayer.js"></script>
        <script type="text/javascript" src="${contextPath}/viewer-html/common/webmapcontroller/Flamingo/FlamingoVectorLayer.js"></script>
        <script type="text/javascript" src="${contextPath}/viewer-html/common/webmapcontroller/Flamingo/FlamingoMap.js"></script>
        <script type="text/javascript" src="${contextPath}/viewer-html/common/webmapcontroller/Flamingo/FlamingoTool.js"></script>
        
        <script type="text/javascript" src="${contextPath}/viewer-html/common/webmapcontroller/MapComponent.js"></script>
        <script type="text/javascript" src="${contextPath}/viewer-html/common/webmapcontroller/FlamingoMapComponent.js"></script>
        <!--script type="text/javascript" src="${contextPath}/viewer-html/webmapcontroller-compiled.js"></script-->
        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewer.js"></script>
        <script type="text/javascript" src="${contextPath}/viewer-html/common/jsonConfig.js"></script>
        <%-- script type="text/javascript" src="${contextPath}/viewer-html/common/layout.js"></script --%>

${actionBean.componentSourceHTML}
    </head>
    <body>

        <script type="text/javascript">
            ${actionBean.script}

            var contextPath = "${contextPath}";

            Ext.onReady(function(){

                //initLayout();

                initMapComponent();
            });

        </script>

        
        <%-- initLayout(); --%>
        <div id="leftmargin_top" style="height: 90%;width: 15%;float:left;">sdfgsdfg</div>
        <div id="map" style="height: 90%;width: 60%;float:left;">
            <font color="red"><strong>U heeft de Flash plugin nodig om de kaart te kunnen zien.<br/>Deze kunt u <a href="http://get.adobe.com/flashplayer/" target="_blank">hier</a> gratis downloaden.</strong></font>
        </div>
        <div id="rightmargin_top" style="height: 90%;width: 15%; float: right;">rechts</div>
        
        <div id="wrapper" style="width: 100%; height: 100%;">
            
        </div>
    </body>
</html>
