<%--
Copyright (C) 2013 B3Partners B.V.

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
        <title>Service Usage Matrix</title>
    </stripes:layout-component>

    <stripes:layout-component name="header">
        <jsp:include page="/WEB-INF/jsp/header.jsp"/>
    </stripes:layout-component>

    <stripes:layout-component name="body">
        <div id="content">
            <h1>Service Usage Matrix</h1><br/>            
            <x:parse xml="${actionBean.xml}" var="doc"/>
            <x:forEach select="$doc/root/featureSources/featureSource" var="featureSource">
                <x:if select="$featureSource//applayer">
                    <div class="usageMatrixFeatureSource">
                        <b>Attribruutbron: <x:out select="$featureSource/name"/> (<x:out select="$featureSource/protocol"/>:: <x:out select="$featureSource/url"/>) </b>
                        <table>
                            <tr>
                                <th>FeatureType</td>
                                <th>Applicatie</td>
                                <th>Layernaam van service</td>
                                <th>Applicatie layer (kaart)</td>
                            </tr>
                            <x:forEach select="$featureSource/featureType" var="featureType">
                                <x:forEach select="$featureType/applications/application" var="application">
                                    <x:forEach select="$application/layers/layer" var="layer">
                                        <x:forEach select="$layer/applayers/applayer" var="appLayer">
                                            <tr>
                                                <td><x:out select="$featureType/id"/>. <x:out select="$featureType/name"/></td>
                                                <td><x:out select="$application/id"/>. <x:out select="$application/name"/> (<x:out select="$application/version"/>)</td>
                                                <td><x:out select="$layer/name"/></td>
                                                <td><x:out select="$appLayer/id"/>. <x:out select="$appLayer/alias"/></td>
                                            </tr> 
                                        </x:forEach>
                                    </x:forEach>
                                </x:forEach>
                            </x:forEach>
                        </table>
                    </div> 
                </x:if>
            </x:forEach>
        </div>
    </stripes:layout-component>

</stripes:layout-render>