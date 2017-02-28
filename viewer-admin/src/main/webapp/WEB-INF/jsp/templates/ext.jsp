<%--
Copyright (C) 2011-2013 B3Partners B.V.

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

<stripes:layout-definition>

<!DOCTYPE html>
<html class="x-border-box">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">

        <link rel="stylesheet" type="text/css" href="${contextPath}/extjs/resources/css/crisp/ext-theme-crisp-all.css">
        <link rel="stylesheet" type="text/css" href="${contextPath}/resources/css/main.css">
        <script type="text/javascript" src="${contextPath}/extjs/ext-all${param.debug == true ? '-debug' : ''}.js"></script>
        <script type="text/javascript" src="${contextPath}/extjs/locale/ext-locale-nl.js"></script>
        <script type="text/javascript">
            var uxpath = '${contextPath}/resources/js/ux';
            var csspath = '${contextPath}/resources/css/';
            var helppath = '${contextPath}/resources/html/help.html';
            var viewer_admin_debug_mode = ${param.debug == true ? 'true' : 'false'};
            Ext.Loader.setConfig({enabled: true});
            Ext.Loader.setPath('Ext.ux', uxpath);
        </script>      
        <script type="text/javascript" src="${contextPath}/resources/js/defaultconfigs.js"></script>
        <script type="text/javascript" src="${contextPath}/resources/js/menu.js"></script>

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
    <body class="x-body">
        <stripes:layout-component name="header" />
        <stripes:layout-component name="body"/>
    </body>
</html>

</stripes:layout-definition>