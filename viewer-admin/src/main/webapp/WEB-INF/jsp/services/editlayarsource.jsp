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
        <title>Edit layar source</title>
    </stripes:layout-component>
    <stripes:layout-component name="body">
        <div id="formcontent">
            <stripes:errors/>
            <stripes:messages/>
            <stripes:form beanclass="nl.b3p.viewer.admin.stripes.LayarSourceActionBean">
                <c:choose>
                    <c:when test="${actionBean.context.eventName == 'edit'}">
                        <stripes:hidden name="layarSource" value="${actionBean.layarSource.id}"/>
                        <h1 id="headertext">Layar bron bewerken</h1>
                        <script>var featureTypes={};</script>
                        <div style="float: left;width: 100%">
                            <div style="width: 70%; float: left;">
                            <table class="formtable">                      
                                <tr>
                                    <td>Attribuutbron*</td>
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
                                    <td>Layar service*</td>
                                    <td>
                                        <stripes:select name="layarSource.layarService">
                                    <option value="1">Maak uw keuze..</option>                      
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
                                <tr><td colspan="2">Te publiceren velden, geef aan hoe deze gevuld moeten worden per Object. 
                                        Gebruik '[attribuutnaam]' om een waarde van het object te gebruiken. 
                                        Aan de rechterkant wordt een lijst getoond met mogelijke attribuutnamen.</td></tr>                                
                                <tr>
                                    <td>Titel</td>
                                    <td>
                                        <stripes:text name="details['text.title']"></stripes:text>
                                    </td>
                                </tr> 
                                <tr>
                                    <td>Omschrijving</td>
                                    <td>
                                        <stripes:text name="details['text.description']"></stripes:text>
                                    </td>
                                </tr>  
                                <tr>
                                    <td>Footnote</td>
                                    <td>
                                        <stripes:text name="details['text.footnote']"></stripes:text>
                                    </td>
                                </tr>                         
                                <tr>
                                    <td>Url naar afbeelding</td>
                                    <td>
                                        <stripes:text name="details['imageURL']"></stripes:text>
                                    </td>
                                </tr>             
                                <tr>
                                    <td colspan="2">* = verplicht</td>
                                </tr>
                            </table>
                        </div>
                        <div id="attributeList" class="attributeListClass">                            
                        </div>
                        </div>
                        <div class="submitbuttons">
                            <stripes:submit name="save" value="Opslaan"/>
                            <stripes:submit name="cancel" value="Annuleren"/>
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
                        <stripes:submit name="edit" value="Nieuwe layar bron"/>
                    </c:when>
                    <c:otherwise>
                        <stripes:submit name="edit" value="Nieuwe layar bron"/>
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
