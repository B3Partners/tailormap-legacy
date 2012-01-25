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
        <title>Configureer component</title>
    </stripes:layout-component>

    <stripes:layout-component name="header">
    </stripes:layout-component>


    <stripes:layout-component name="body">
        <stripes:form beanclass="nl.b3p.viewer.admin.stripes.LayoutManagerActionBean">
            <stripes:hidden name="component" value="${actionBean.component.id}"/>
            <stripes:hidden name="className" value="${actionBean.className}"/>
            <stripes:hidden name="name" value="${actionBean.name}"/>
            <stripes:hidden name="configObject" id="configObject"/>

            <div id ="config"></div>
            <div id="rights"> 
                <h1>Groepen:</h1>
                De volgende gebruikersgroepen hebben recht op dit component:<br/>

                <c:forEach var="group" items="${actionBean.allGroups}">
                    <stripes:checkbox name="groups" value="${group.name}"/>${group.name}<br>
                </c:forEach>
            </div>
            <div id="layout">
                <h1>Vensterpositie</h1>
                <input type="radio" name="positie" value="center">Gecentreerd <br/>
                <input type="radio"  name="positie" value="fixed">Vaste positie (van linker bovenhoek popup t.o.v. linker bovenhoek scherm)<br/>
                <input type="checkbox" value="changeablePosition">Gebruiker kan de positie van de popup aanpassen<br/>
                
                <h1>Venstergrootte</h1>
                Breedte <stripes:text name="breedte" id="breedte"/><br/>
                Hoogte<stripes:text name="hoogte" id="hoogte"/><br/>
                <input type="checkbox" value="changeableSize">Gebruiker kan de grootte van de popup aanpassen<br/>
            </div>

            <stripes:submit onclick="getConfig()" name="saveComponentConfig">Opslaan</stripes:submit>
        </stripes:form>
        <script>
            var className = "${actionBean.className}";
            var name = "${actionBean.name}";
            var metadata = new Object();
            <c:if test="${!empty actionBean.metadata}">
                metadata = JSON.parse ('${actionBean.metadata}');
                var className = metadata.className;
            </c:if>
                var contextPath = "${contextPath}";
                var configObject = null;
            <c:if test="${!empty actionBean.component.config}">
                configObject= JSON.parse ('${actionBean.component.config}');
            </c:if>
        </script>
        <script type="text/javascript" src="${contextPath}/viewer-html/components/component.js"></script>
        <script type="text/javascript" src="${contextPath}/resources/js/layoutmanager/configPage.js"></script>
    </stripes:layout-component>

</stripes:layout-render>
