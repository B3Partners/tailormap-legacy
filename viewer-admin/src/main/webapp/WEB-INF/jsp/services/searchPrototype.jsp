<%-- 
    Document   : Solr
    Created on : Sep 30, 2013, 3:05:08 PM
    Author     : Meine Toonen
--%>

<%@include file="/WEB-INF/jsp/taglibs.jsp" %>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>

<c:set var="contextPath" value="${pageContext.request.contextPath}"/>
<html>
    <head>
        <script>
            var contextpath= "${contextPath}";
        </script>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>JSP Page</title>
        
        <link rel="stylesheet" type="text/css" href="${contextPath}/extjs/resources/css/ext-all-gray.css">
        <link href="${contextPath}/resources/css/viewer-admin.css" rel="stylesheet">
        <link rel="stylesheet" type="text/css" href="${contextPath}/resources/css/main.css">
        <script type="text/javascript" src="${contextPath}/extjs/ext-all${param.debug == true ? '-debug' : ''}.js"></script>
        <script type="text/javascript" src="${contextPath}/extjs/locale/ext-lang-nl.js"></script>
         <script type="text/javascript">
            var uxpath = '${contextPath}/resources/js/ux';
            var helppath = '${contextPath}/resources/html/help.html';
        </script>      
        <script type="text/javascript" src="${contextPath}/resources/js/defaultconfigs.js"></script>
        <script type="text/javascript" src="${contextPath}/resources/js/overrides.js"></script>
        <script type="text/javascript" src="${contextPath}/resources/js/menu.js"></script>
        <script type="text/javascript" src="${contextPath}/resources/js/search.js"></script>

        
    </head>
    <body>
    </body>
</html>
