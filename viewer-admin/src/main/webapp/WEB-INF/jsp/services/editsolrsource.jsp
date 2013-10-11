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

                        <c:choose>
                            <c:when test="${actionBean.solrConfiguration != null}">
                                <h1 id="headertext">Zoekbron bewerken</h1>
                            </c:when>
                            <c:otherwise>
                                <h1 id="headertext">Nieuwe zoekbron toevoegen</h1>           
                            </c:otherwise>
                        </c:choose>


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
    </stripes:layout-component>
</stripes:layout-render>