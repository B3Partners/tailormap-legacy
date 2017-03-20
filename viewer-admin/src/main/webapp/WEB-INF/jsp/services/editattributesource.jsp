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
        <title>Bewerk Attribuutbron</title>
    </stripes:layout-component>
    <stripes:layout-component name="body">
        <div id="formcontent">
            <stripes:errors/>
            <stripes:messages/>
            <stripes:form beanclass="nl.b3p.viewer.admin.stripes.AttributeSourceActionBean">
                <c:choose>
                    <c:when test="${empty actionBean.context.validationErrors && (actionBean.context.eventName == 'edit' || actionBean.context.eventName == 'saveEdit' || actionBean.context.eventName == 'save')}">
                    <h1 id="headertext">Attribuutbron bewerken</h1>

                    <stripes:hidden name="featureSource" value="${actionBean.featureSource.id}"/>
                    <table class="formtable">
                        <tr>
                            <td>Naam *:</td>
                            <td><stripes:text name="name" maxlength="255" size="30"/></td>
                        </tr>
                        <tr>
                            <td>Bron URL *:</td>
                            <td>
                                ${actionBean.featureSource.url}
                            </td>
                        </tr>
                        <tr>
                            <td>Type *:</td>
                            <td>
                                <stripes:select name="protocol" disabled="true">
                                    <stripes:option value="wfs">WFS</stripes:option>
                                    <stripes:option value="arcgis">ArcGIS Server</stripes:option>
                                    <stripes:option value="arcxml">ArcXml</stripes:option>
                                    <stripes:option value="jdbc">JDBC</stripes:option>
                                </stripes:select>
                            </td>
                        </tr>
                        <tr>
                            <td>Gebruikersnaam:</td>
                            <td><stripes-dynattr:text name="username" maxlength="255" size="30">${username}</stripes-dynattr:text></td>
                        </tr>
                        <tr>
                            <td>Wachtwoord:</td>
                            <td><stripes-dynattr:password name="password" autocomplete="new-password" maxlength="255" size="30"/></td>
                        </tr>
                    </table>
                    <div class="submitbuttons">
                        <stripes:submit name="saveEdit" value="Opslaan"/>
                        <c:if test="${actionBean.updatable}">
                            <stripes:submit name="update" onclick="return updateConfirm();" value="Update"/>
                        </c:if>
                        <stripes:submit name="newAttributeSource" value="Nieuwe attribuutbron"/>
                        <stripes:reset class="extlikebutton" name="cancel" value="Annuleren"/>
                    </div>
                    <c:if test="${!actionBean.updatable}">
                        * Attribuutbron kan hier niet worden geupdate. Wegens de directe link tussen service en attribuutbron, dient u voor de ArcGIS en ArcIMS protocollen de bijhorende service te updaten.
                    </c:if>
                    <c:if test="${actionBean.featureSource.id != null}">
                        <br> <a href="javascript: void(0)" onclick='openServiceUsageMatrix(<c:out value="${actionBean.featureSource.id}"/>)'>Bekijk in welke applicaties deze service wordt gebruikt</a>
                    </c:if>
                    <script type="text/javascript">
                        function updateConfirm() {
                            <c:if test="${!actionBean.updatable}">
                                alert('Deze Attribuutbron kan niet worden geupdate! Update de bijhorende service.');
                                return false;
                            </c:if>
                            <c:if test="${actionBean.updatable}">
                                return confirm('Weet u zeker dat u deze Attribuutbron wilt updaten? Attributen die de server niet meer aanbiedt worden verwijderd.');
                            </c:if>
                        }
                    </script>
                        <c:if test="${actionBean.context.eventName == 'saveEdit'}">
                            <script type="text/javascript">
                                var frameParent = getParent();
                                if(frameParent && frameParent.reloadGrid) {
                                    frameParent.reloadGrid();
                                }
                            </script>
                        </c:if>
                </c:when>
                <c:when test="${actionBean.context.eventName == 'newAttributeSource'}">

                            <h1 id="headertext">Nieuwe attribuutbron toevoegen</h1>
                            <p>
                            <script type="text/javascript">
                                function checkProtocol() {
                                    var protocol = Ext.query("select[name='protocol']")[0].value;

                                    Ext.query("*[class='dbTr']").forEach(function(e) {
                                        e.style.visibility = protocol == "jdbc" ? "visible" : "hidden";
                                    });
                                    Ext.query("*[class='wfsTr']").forEach(function(e) {
                                        e.style.visibility = protocol == "wfs" ? "visible" : "hidden";
                                    });

                                    checkDefaults();
                                }

                                function checkDefaults() {
                                    // XXX impossible to use a Oracle server on PostgreSQL port
                                    // and vice versa, but automatic filling in of port is useful
                                    var dbType = Ext.query("select[name='dbtype']")[0].value;
                                    var port = Ext.query("input[name='port']")[0];
                                    if(dbType == "oracle") {
                                        if(port.value == "" || port.value == "5432") {
                                            port.value = "1521";
                                        }
                                    } else if(dbType == "postgis") {
                                        if(port.value == "" || port.value == "1521") {
                                            port.value = "5432";
                                        }
                                    }
                                }
                                Ext.onReady(checkProtocol);
                            </script>
                            <table class="formtable">
                                <tr>
                                    <td>Type *:</td>
                                    <td>
                                        <stripes:select name="protocol" onchange="checkProtocol()" onkeyup="checkProtocol()">
                                            <stripes:option value="jdbc">Database (JDBC)</stripes:option>
                                            <stripes:option value="wfs">WFS</stripes:option>
                                        </stripes:select>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Naam *:</td>
                                    <td><stripes:text name="name" maxlength="255" size="30"/></td>
                                </tr>
                                <tr class="wfsTr">
                                    <td>URL *:</td>
                                    <td><stripes:text name="url" maxlength="255" size="30"/></td>
                                </tr>
                                <tr class="dbTr">
                                    <td>Database type *:</td>
                                    <td>
                                        <stripes:select name="dbtype" onchange="checkDefaults()" onkeyup="checkDefaults()">
                                            <stripes:option value="oracle">Oracle</stripes:option>
                                            <stripes:option value="postgis">PostGIS</stripes:option>
                                        </stripes:select>
                                    </td>
                                </tr>
                                <tr class="dbTr">
                                    <td>Adres database server *:</td>
                                    <td>
                                        <stripes:text name="host" maxlength="255" size="30"/>
                                    </td>
                                </tr>
                                <tr class="dbTr">
                                    <td>Poort database server *:</td>
                                    <td>
                                        <stripes:text name="port" maxlength="255" size="30"/>
                                    </td>
                                </tr>
                                <tr class="dbTr">
                                    <td>Database *:</td>
                                    <td>
                                        <stripes:text name="database" maxlength="255" size="30"/>
                                    </td>
                                </tr>
                                <tr class="dbTr">
                                    <td>Schema *:</td>
                                    <td>
                                        <stripes:text name="schema" maxlength="255" size="30"/>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Gebruikersnaam:</td>
                                    <td><stripes-dynattr:text name="username" maxlength="255" size="30">${username}</stripes-dynattr:text></td>
                                </tr>
                                <tr>
                                    <td>Wachtwoord:</td>
                                    <td><stripes-dynattr:password name="password" autocomplete="new-password" maxlength="255" size="30"/></td>
                                </tr>
                            </table>
                            <div class="submitbuttons">
                                <stripes:submit name="save" value="Opslaan"/>
                                <stripes:reset class="extlikebutton" onclick="setTimeout(checkProtocol,10)" name="cancel" value="Annuleren"/>
                            </div>
                </c:when>
                <c:otherwise>
                    <script type="text/javascript">
                        var frameParent = getParent();
                        if(frameParent && frameParent.reloadGrid) {
                            frameParent.reloadGrid();
                        }
                    </script>
                    <stripes:submit name="newAttributeSource" value="Nieuwe attribuutbron"/>
                    <c:if test="${not empty actionBean.changedFeatureTypes}">
                        <a href="javascript: void(0)" onclick='openServiceUsageMatrix(<c:out value="${actionBean.changedFeatureSourceId}"/>)'>Open wijzigingen in Service Gebruiks Matrix</a>
                    </c:if>
                </c:otherwise>
            </c:choose>
        </stripes:form>
        </div>
        <script type="text/javascript">
            Ext.onReady(function() {
                appendPanel('headertext', 'formcontent');
            });
            function openServiceUsageMatrix(featureSourceId){ 
                var url= ""+serviceUsageMatrixUrl;

                if (changedFeatureTypes.length > 0){
                    if (url.indexOf("?")>0){
                        url+="&";
                    }else{
                        url+="?";
                    }
                    url+="changedFeatureTypes="+Ext.JSON.encode(changedFeatureTypes);                
                }
                if (featureSourceId){
                    if (url.indexOf("?")>0){
                    url+="&";
                    }else{
                        url+="?";
                    }
                    url += "featureSource="+featureSourceId;
                }
                this.parent.window.location.href=url;
            }
            var serviceUsageMatrixUrl='<stripes:url beanclass="nl.b3p.viewer.admin.stripes.ServiceUsageMatrixActionBean" event="view"/>';
            var changedFeatureSource = "";
            var changedFeatureTypes={};
            <c:forEach items="${actionBean.changedFeatureTypes}" var="change">
                changedFeatureTypes["${change.key}"]= [];
                <c:forEach items="${change.value}" var="featuretype">
                    changedFeatureTypes["${change.key}"].push(${featuretype.id});
                </c:forEach>                
            </c:forEach>
        </script>
    </stripes:layout-component>
</stripes:layout-render>