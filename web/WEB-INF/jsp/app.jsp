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

<stripes:layout-render name="/WEB-INF/jsp/templates/ext.jsp">
    <stripes:layout-component name="head">
        <title><c:out value="${actionBean.application.name}"/></title>
    </stripes:layout-component>

    <stripes:layout-component name="body">
        <div id="map" style="height: 90%;width: 80%; float: left;">
            <font color="red"><strong>U heeft de Flash plugin nodig om de kaart te kunnen zien.<br/>Deze kunt u <a href="http://get.adobe.com/flashplayer/" target="_blank">hier</a> gratis downloaden.</strong></font>
        </div>
        <div id="tree-div" style="height: 90%;width: 20%; float: right;"/>
        <div>
            <%--c:forEach items="${actionBean.application.components}" var="comp" >
                Component: ${comp.className} <br/>
                Layout: ${comp.details['layout']} <br/>
                Config: ${comp.config} <br/>
            </c:forEach--%>
        </div>
        <script type="text/javascript">
            var contextPath = "${contextPath}";
            var compConfigs = ${actionBean.compConfigs};
            var layout ={
                center: {
                    layout:{
                        width: 300,
                        height: 200
                    },
                    components:{
                        componentClass: "Flamingo",
                        name: "flamingo"
                    }
                },
                right: {
                    layout:{
                        width: 300,
                        height: 200
                    },
                    components:{
                        componentClass: "TOC",
                        name: "toc1"
                    }
                }
            };
            
            Ext.onReady(function(){ 
                initMapComponent();
            });
        </script>
        <script type="text/javascript" src="${contextPath}/viewer-html/common/swfobject.js"></script>
        <script type="text/javascript" src="${contextPath}/viewer-html/webmapcontroller-compiled.js"></script>
        <script type="text/javascript" src="${contextPath}/viewer-html/common/webmapcontroller/MapViewer.js"></script>
        <script type="text/javascript" src="${contextPath}/viewer-html/common/viewer.js"></script>
        <script type="text/javascript" src="${contextPath}/viewer-html/common/jsonConfig.js"></script>
    </stripes:layout-component>
</stripes:layout-render>