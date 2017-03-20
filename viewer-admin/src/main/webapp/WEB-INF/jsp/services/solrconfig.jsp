<%--
Copyright (C) 2011 B3Partners B.V.

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
        <title>Solr configureren</title>
    </stripes:layout-component>

    <stripes:layout-component name="header">
        <jsp:include page="/WEB-INF/jsp/header.jsp"/>
    </stripes:layout-component>

        <stripes:layout-component name="body">
            <div id="content">
                <stripes:errors/>
                <stripes:messages/>
                <h1>Zoekbronnen<a href="#Attribuutbronnen_Help" title="Help" class="helplink"></a></h1>

                <div id="grid-container" class="attributesources">

                </div>

                <div id="form-container" class="attributesources">
                    <iframe src="<stripes:url beanclass="nl.b3p.viewer.admin.stripes.ConfigureSolrActionBean" event="cancel"/>" id="editFrame" frameborder="0"></iframe>
                </div>
            </div>
          <script type="text/javascript">
            var solrInitialized = ${actionBean.solrInitialized};
            var gridurl = '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.ConfigureSolrActionBean" event="getGridData"/>';
            var editurl = '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.ConfigureSolrActionBean" event="edit"/>';
            var addToIndexUrl = '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.ConfigureSolrActionBean" event="addToIndex"/>';
            var removeFromIndexUrl = '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.ConfigureSolrActionBean" event="removeFromIndex"/>';
            var deleteurl = '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.ConfigureSolrActionBean" event="delete"/>';
            var editSolrConfiguration = '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.ConfigureSolrActionBean" event="view"/>';
            vieweradmin.components.Menu.setActiveLink('menu_solrconfig');
        </script>   
        <script type="text/javascript" src="${contextPath}/resources/js/services/solrconfig.js"></script>
    </stripes:layout-component>
        
</stripes:layout-render>