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
        <title>___Bewerk zoekbron___</title>
    </stripes:layout-component>
    <stripes:layout-component name="body">
        <c:set var="isNew">
            <c:choose>
                <c:when test="${actionBean.solrConfiguration.id != null}">
                    <c:out value="false"/>
                </c:when>
                <c:otherwise>
                    <c:out value="true"/>
                </c:otherwise>
            </c:choose>
        </c:set>
        <div id="formcontent">
        <stripes:errors/>
        <stripes:messages/>
        <stripes:form beanclass="nl.b3p.viewer.admin.stripes.ConfigureSolrActionBean">
            <c:choose>
                <c:when test="${empty actionBean.context.validationErrors && actionBean.context.eventName == 'newSearchConfig' || actionBean.context.eventName == 'edit' }">
                    <c:choose>
                        <c:when test="${!isNew}">
                            <h1 id="headertext">___Zoekbron bewerken___</h1>
                        </c:when>
                        <c:otherwise>
                            <h1 id="headertext">___Nieuwe zoekbron toevoegen___</h1>           
                        </c:otherwise>
                    </c:choose>
                    <stripes:hidden name="solrConfiguration" value="${actionBean.solrConfiguration.id}" />
                    <div style="float: left;">
                        <table class="formtable">
                            <tr>
                                <td>
                                    ___Naam___:
                                </td>
                                <td>
                                    <stripes:text name="solrConfiguration.name"/>
                                </td>
                            </tr>
                            <tr>
                                <td>___Attribuutbron___:</td>
                                <td>
                                    <stripes:select name="solrConfiguration.simpleFeatureType.featureSource" onchange="featureSourceChanged(this)">
                                        <stripes:option value="-1">___Kies een attribuutbron___</stripes:option>
                                        <stripes:options-collection collection="${actionBean.featureSources}" label="name"/>
                                    </stripes:select>
                                </td>
                            </tr>
                            <tr>
                                <td>___Featuretype___:</td>
                                <td>
                                    <stripes:select id="featureType" name="solrConfiguration.simpleFeatureType" onchange="featureTypeChanged(this.value)">
                                        <stripes:option value="-1">___Kies een featuretype___</stripes:option>
                                        <stripes:options-collection collection="${actionBean.featureTypes}" label="typeName"/>
                                    </stripes:select>
                                </td>
                            </tr>                        
                        </table>
                    </div>
                    <div id="attributes" style="width: 300px; height: 250px; float: left; margin-left: 25px; margin-top: 5px;"></div>
                    <div style="clear: both;"></div>
                    <div class="submitbuttons">
                        <stripes:submit name="cancel" value="___Annuleren___"/>
                        <stripes:submit name="save" value="___Opslaan___"/>
                    </div>
                    <c:if test="${!isNew}">
                        <script>
                            Ext.onReady(function(){
                                featureTypeChanged("${actionBean.solrConfiguration.simpleFeatureType.id}");
                            });
                        </script>
                    </c:if>
                </c:when>
                <c:otherwise>
                    <script type="text/javascript">
                    Ext.onReady(function() {
                        var frameParent = getParent();

                        if(frameParent && frameParent.vieweradmin_components_SolrConfig) {
                            frameParent.vieweradmin_components_SolrConfig.reloadGrid();
                        }
                    });
                    </script>
                    <stripes:submit name="newSearchConfig" value="Nieuwe zoekbron"/>

                </c:otherwise>
            </c:choose>
        </stripes:form>
        </div>
        <script>
            
            var gridurl = '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.AttributeSourceActionBean" event="getGridData"/>';
            var editurl = '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.ConfigureSolrActionBean" event="edit"/>';
            var featureType ='<stripes:url beanclass="nl.b3p.viewer.admin.stripes.AttributeActionBean" event="getFeatureTypes"/>';
            var attributesUrl ='<stripes:url beanclass="nl.b3p.viewer.admin.stripes.ConfigureSolrActionBean" event="getAttributesList"/>';
            var deleteurl = '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.ConfigureSolrActionBean" event="delete"/>';
            var editSolrConfiguration = '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.ConfigureSolrActionBean" event="view"/>';
            vieweradmin.components.Menu.setActiveLink('menu_solrconfig');
            var configId = "${actionBean.solrConfiguration.id}";
            Ext.onReady(function() {
                appendPanel('headertext', 'formcontent');
            });
        </script>
        <script type="text/javascript" src="${contextPath}/resources/js/services/editsolrconfig.js"></script>
    </stripes:layout-component>
</stripes:layout-render>