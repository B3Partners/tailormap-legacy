<%--
Copyright (C) 2011-2013 B3Partners B.V.

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
        <title>Bewerk zoekbron</title>
    </stripes:layout-component>
    <stripes:layout-component name="body">
        <div id="formcontent">
        <p>
            <stripes:errors/>
            <stripes:messages/>
        </p>
        <stripes:form beanclass="nl.b3p.viewer.admin.stripes.ConfigureSolrActionBean">
            <c:choose>
                <c:when test="${empty actionBean.context.validationErrors && actionBean.context.eventName == 'newSearchConfig' || (actionBean.context.eventName == 'edit' || actionBean.context.eventName == 'saveEdit' || actionBean.context.eventName == 'save')}">

                    <stripes:submit name="cancel" value="Annuleren"/>
                    <stripes:submit name="save" value="Opslaan"/>
                    <c:choose>
                        <c:when test="${actionBean.solrConfiguration.id != null}">
                            <h1 id="headertext">Zoekbron bewerken</h1>
                        </c:when>
                        <c:otherwise>
                            <h1 id="headertext">Nieuwe zoekbron toevoegen</h1>           
                        </c:otherwise>
                    </c:choose>
                    Attribuutbron: 
                    <stripes:select name="solrConfiguration.simpleFeatureType.featureSource" onchange="featureSourceChanged(this)">
                        <stripes:option value="-1">Kies een attribuutbron</stripes:option>
                        <stripes:options-collection collection="${actionBean.featureSources}" label="name"/>
                    </stripes:select><br/>
                    
                    Featuretype:
                    <stripes:select id="featureType" name="solrConfiguration.simpleFeatureType" onchange="featureTypeChanged(this)">
                        <stripes:option value="-1">Kies een featuretype</stripes:option>
                        <stripes:options-collection collection="${actionBean.featureTypes}" label="typeName"/>
                    </stripes:select>
                    <div id="attributes" style="width:300px;">
                    </div>
                </c:when>
                <c:otherwise>
                    <script type="text/javascript">
                    var frameParent = getParent();
                    if(frameParent && frameParent.reloadGrid) {
                        frameParent.reloadGrid();
                    }
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
            var attributesUrl ='<stripes:url beanclass="nl.b3p.viewer.admin.stripes.AttributeActionBean" event="getGridData"/>';
            var deleteurl = '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.ConfigureSolrActionBean" event="delete"/>';
            var editSolrConfiguration = '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.ConfigureSolrActionBean" event="view"/>';
            var activelink = 'menu_solrconfig';
        </script>
        <script type="text/javascript" src="${contextPath}/resources/js/services/editsolrconfig.js"></script>
    </stripes:layout-component>
</stripes:layout-render>