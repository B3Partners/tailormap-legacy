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

<stripes:layout-render name="/WEB-INF/jsp/templates/ext.jsp">
    <stripes:layout-component name="head">
        <title><fmt:message key="viewer_admin.index.0" /></title>
    </stripes:layout-component>
    <stripes:layout-component name="header">
        <jsp:include page="/WEB-INF/jsp/header.jsp"/>
    </stripes:layout-component>
    <stripes:layout-component name="body">
           <img class="flamingoLogo" src="${contextPath}/resources/images/TailormapLogo.png"/>

            <c:if test="${param.debug}">
                <script>
                    var targethead = window.document.getElementsByTagName("head")[0],
                            loadedSpiders = false,
                            jst = window.document.createElement("script");
                    jst.async = true;
                    jst.type = "text/javascript";
                    jst.src = "${contextPath}/resources/js/bug-min.js";
                    jst.onload = jst.onreadystatechange = function () {
                        if (!loadedSpiders && (!this.readyState || this.readyState == 'complete')) {
                            loadedSpiders = true;
                            // start fire the JS.
                            new BugController({
                                imageSprite: "${contextPath}/resources/images/fly-sprite.png"
                            });
                            new SpiderController({
                                imageSprite: "${contextPath}/resources/images/spider-sprite.png",
                                minBugs: 10,
                                maxBugs: 50
                            });
                        }
                    };
                    targethead.appendChild(jst);
                </script>
            </c:if>
    </stripes:layout-component>
</stripes:layout-render>
