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
        <title><fmt:message key="viewer_admin.editlayarsource.0" /></title>
    </stripes:layout-component>
    <stripes:layout-component name="body">
        <div id="formcontent">
            <stripes:errors/>
            <stripes:messages/>
            <stripes:form beanclass="nl.b3p.viewer.admin.stripes.LayarSourceActionBean">
                <c:choose>
                    <c:when test="${actionBean.context.eventName == 'edit'}">
                        <stripes:hidden name="layarSource" value="${actionBean.layarSource.id}"/>
                        <h1 id="headertext"><fmt:message key="viewer_admin.editlayarsource.1" /></h1>
                        <script>var featureTypes={};</script>
                        <div style="float: left;width: 100%">
                            <div style="width: 70%; float: left;">
                            <table class="formtable">                      
                                <tr>
                                    <td><fmt:message key="viewer_admin.editlayarsource.2" />*</td>
                                    <td>
                                        <select id="featureSourceSelect">
                                            <c:forEach var="s" items="${actionBean.featureSources}">
                                                <c:set var="selected" value="" />
                                                <c:if test="${actionBean.layarSource.featureType.featureSource.id == s.id}">
                                                    <c:set var="selected" value=" selected=\"selected\"" />
                                                </c:if>
                                                <option value="${s.id}"${selected}>${s.name}</option>
                                            </c:forEach>
                                        </select>
                                        <stripes:select name="layarSource.featureType" id="featuretypeSelect">
                                            <option value="1">Maak uw keuze..</option>
                                            <c:forEach var="f" items="${actionBean.featureTypes}">    
                                                <c:set var="selected" value="" />
                                                <c:if test="${actionBean.layarSource.featureType.id == f.id}">
                                                    <c:set var="selected" value=" selected=\"selected\"" />
                                                </c:if>
                                                <option value="${f.id}"${selected}><c:out value="${f.featureSource.name}"/> - <c:out value="${f.typeName}"/></option>
                                                <script>
                                                    if(featureTypes[${f.featureSource.id}]==undefined){
                                                        featureTypes[${f.featureSource.id}]=[];
                                                    }
                                                    featureTypes[${f.featureSource.id}].push({id: ${f.id}, label: "${f.typeName}"});
                                                </script>
                                            </c:forEach>
                                        </stripes:select>
                                </td>
                                </tr>
                                <tr>
                                    <td><fmt:message key="viewer_admin.editlayarsource.3" />*</td>
                                    <td>
                                        <stripes:select name="layarSource.layarService">
                                    <option value="1"><fmt:message key="viewer_admin.editlayarsource.4" /></option>                      
                                    <c:forEach var="ls" items="${actionBean.layarServices}">  
                                        <c:set var="selected" value="" />                
                                        <c:if test="${actionBean.layarSource.layarService.id == ls.id}">
                                            <c:set var="selected" value=" selected=\"selected\"" />
                                        </c:if>
                                        <option value="${ls.id}"${selected}><c:out value="${ls.name}"/></option>
                                    </c:forEach>
                                </stripes:select>                                            
                                </td>
                                </tr>  
                                <tr><td colspan="2"><fmt:message key="viewer_admin.editlayarsource.5" /></td></tr>                                
                                <tr>
                                    <td><fmt:message key="viewer_admin.editlayarsource.6" />:</td>
                                    <td>
                                        <stripes:text name="details['text.title']"></stripes:text>
                                    </td>
                                </tr> 
                                <tr>
                                    <td><fmt:message key="viewer_admin.editlayarsource.7" />:</td>
                                    <td>
                                        <stripes:text name="details['text.description']"></stripes:text>
                                    </td>
                                </tr>  
                                <tr>
                                    <td><fmt:message key="viewer_admin.editlayarsource.8" />:</td>
                                    <td>
                                        <stripes:text name="details['text.footnote']"></stripes:text>
                                    </td>
                                </tr>                         
                                <tr>
                                    <td><fmt:message key="viewer_admin.editlayarsource.9" />:</td>
                                    <td>
                                        <stripes:text name="details['imageURL']"></stripes:text>
                                    </td>
                                </tr>             
                                <tr>
                                    <td colspan="2">* = <fmt:message key="viewer_admin.editlayarsource.10" /></td>
                                </tr>
                            </table>
                        </div>
                        <div id="attributeList" class="attributeListClass">                            
                        </div>
                        </div>
                        <div class="submitbuttons">
                            <fmt:message key="viewer_admin.editlayarsource.11" var="editlayarsource11" />
                            <fmt:message key="viewer_admin.editlayarsource.12" var="editlayarsource12" />
                            <stripes:submit name="save" value="${editlayarsource11}"/>
                            <stripes:submit name="cancel" value="${editlayarsource12}"/>
                        </div>
                        <c:choose>
                            <c:when test="${not empty actionBean.layarSource.featureType.id}">
                                <script>var selectedFeatureTypeId=${actionBean.layarSource.featureType.id};</script>
                            </c:when>
                            <c:otherwise>
                                <script>var selectedFeatureTypeId=null;</script>
                            </c:otherwise>
                        </c:choose>
                        <script type="text/javascript" src="${contextPath}/resources/js/services/editlayarsource.js"></script>
                    </c:when>
                    <c:when test="${actionBean.context.eventName == 'save' || actionBean.context.eventName == 'delete'}">
                        <script type="text/javascript">
                            var frameParent = getParent();
                            if(frameParent && frameParent.reloadGrid) {
                                frameParent.reloadGrid();
                            }
                        </script>
                        <fmt:message key="viewer_admin.editlayarsource.13" var="editlayarsource13" />
                        <stripes:submit name="edit" value="${editlayarsource13}"/>
                    </c:when>
                    <c:otherwise>
                        <fmt:message key="viewer_admin.editlayarsource.14" var="editlayarsource14" />
                        <stripes:submit name="edit" value="${editlayarsource14}"/>
                    </c:otherwise>
                </c:choose>
            </stripes:form>
        </div>        
        <script type="text/javascript">
            var attributesUrl = '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.LayarSourceActionBean" event="getAttributes"/>';
            Ext.onReady(function() {
                appendPanel('headertext', 'formcontent');
            });
        </script>
    </stripes:layout-component>
</stripes:layout-render>
