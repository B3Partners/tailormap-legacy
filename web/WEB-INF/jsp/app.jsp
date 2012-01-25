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
        <script type="text/javascript" src="${contextPath}/viewer-html/webmapcontroller-compiled.js"></script>
        <script type="text/javascript" src="${contextPath}/viewer-html/common/webmapcontroller/MapViewer.js"></script>
        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewer.js"></script>
        <script type="text/javascript" src="${contextPath}/viewer-html/common/jsonConfig.js"></script>

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
        <div id="map" style="height: 90%;width: 80%; float: left;">
            <font color="red"><strong>U heeft de Flash plugin nodig om de kaart te kunnen zien.<br/>Deze kunt u <a href="http://get.adobe.com/flashplayer/" target="_blank">hier</a> gratis downloaden.</strong></font>
        </div>
        <div id="tree-div" style="height: 90%;width: 20%; float: right;"/>
    </body>
</html>
