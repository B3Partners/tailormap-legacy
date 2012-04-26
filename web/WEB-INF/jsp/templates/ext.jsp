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

<stripes:layout-definition>

<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">

        <link rel="stylesheet" type="text/css" href="${contextPath}/extjs/resources/css/ext-all-gray.css">
        <link href="${contextPath}/resources/css/viewer-admin.css" rel="stylesheet">
        <link rel="stylesheet/less" type="text/css" href="${contextPath}/resources/less/main.less">

         
        <script type="text/javascript" src="${contextPath}/extjs/ext-all${param.debug == true ? '-debug' : ''}.js"></script>
        <script type="text/javascript" src="${contextPath}/extjs/locale/ext-lang-nl.js"></script>
        <script type="text/javascript">
            var uxpath = '${contextPath}/resources/js/ux';
            var helppath = '${contextPath}/resources/html/help.html';
        </script>      
        <script type="text/javascript" src="${contextPath}/resources/js/defaultconfigs.js"></script>
        <script type="text/javascript" src="${contextPath}/resources/js/menu.js"></script>
        <script type="text/javascript" src="${contextPath}/resources/js/less-1.1.5.min.js"></script>

        <stripes:layout-component name="head"/>
        
        <script type="text/javascript">
            if(console == undefined) {
                var console = {};
                console.log = function(logmsg) {
                    //alert(logmsg);
                }
            }
        </script>
    </head>
    <body>
        <stripes:layout-component name="header" />
        <stripes:layout-component name="body"/>
    </body>
</html>

</stripes:layout-definition>