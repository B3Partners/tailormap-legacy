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
        <title>___CSW service___</title>
    </stripes:layout-component>
    <stripes:layout-component name="body">
        <div id="formcontent">
            <stripes:errors/>
            <stripes:messages/>
            <stripes:form id="searchForm" beanclass="nl.b3p.viewer.admin.stripes.CatalogServiceActionBean">
                <stripes:hidden id="category" name="category"/>
                <h1 id="headertext">___CSW Service doorzoeken___</h1>
                <table class="formtable">
                    <tr>
                        <td>___URL van de service___:</td>
                        <td><stripes:text id="url" name="url" value="http://www.nationaalgeoregister.nl/geonetwork/srv/dut/csw" maxlength="255" size="80"/></td>
                    </tr>
                    <tr>
                        <td>___Zoekterm___:</td>
                        <td><stripes:text id="searchTerm" name="searchTerm" value="___bv natuur___" maxlength="255" size="80"/></td>
                    </tr>
                    <tr>
                        <td>
                            <input type="button" class="extlikebutton" onclick="return searchCsw();" name="search" value="___Zoeken___"/>
                        </td>
                        <td><span id="numresults"></span></td>
                    </tr>
                </table>
            </stripes:form>
            <stripes:form id="geoserviceForm" beanclass="nl.b3p.viewer.admin.stripes.GeoServiceActionBean">
                <stripes:hidden id="category" name="category"/>
                <stripes:hidden id="url" name="url"/>
                <stripes:hidden id="protocol" name="protocol"/>
            </stripes:form>
            <div id="searchResults" style="height:400px; overflow: auto; border: 1px solid #000;"/>
        </div>
        <script type="text/javascript">
            
            var actionBeans = {
                "service": <js:quote><stripes:url beanclass="nl.b3p.viewer.admin.stripes.GeoServiceActionBean"/></js:quote>,
                "csw": <js:quote><stripes:url beanclass="nl.b3p.viewer.admin.stripes.CatalogServiceActionBean"/></js:quote>
            };
            Ext.onReady(function() {
                appendPanel('headertext', 'formcontent');
            });
            </script>
            <script type="text/javascript" src="${contextPath}/resources/js/services/cswservice.js"></script>

    </stripes:layout-component>
</stripes:layout-render>