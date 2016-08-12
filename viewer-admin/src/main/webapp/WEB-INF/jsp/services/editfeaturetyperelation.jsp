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
        <title>Edit join/relaties</title>
    </stripes:layout-component>
    <stripes:layout-component name="body">
        <div id="formcontent">
            <stripes:errors/>
            <stripes:messages/>
            <script type="text/javascript" src="${contextPath}/resources/js/services/editfeaturetyperelation.js"></script>
            <stripes:form beanclass="nl.b3p.viewer.admin.stripes.FeatureTypeRelationActionBean">
                <c:choose>
                    <c:when test="${actionBean.context.eventName == 'edit'}">
                        <stripes:hidden name="relation" value="${actionBean.relation.id}"/>
                        <h1 id="headertext">Relatie bewerken</h1>
                        <table class="formtable">                            
                            <tr>
                                <td>Attribuutbron: </td>
                                <td>
                                    <select id="featureSourceSelect">
                                        <option value="-1">Maak uw keuze..</option>
                                        <c:forEach var="s" items="${actionBean.featureSources}">
                                            <c:set var="selected" value="" />
                                            <c:if test="${actionBean.relation.featureType.featureSource.id == s.id}">
                                                <c:set var="selected" value=" selected=\"selected\"" />
                                            </c:if>
                                            <option value="${s.id}"${selected}>${s.name}</option>
                                        </c:forEach>
                                    </select>                                    
                                </td>
                                <td></td>
                                <td>
                                    <select id="foreignFeatureSourceSelect">
                                       <option value="-1">Maak uw keuze..</option>
                                       <c:forEach var="s" items="${actionBean.featureSources}">
                                           <c:set var="selected" value="" />
                                           <c:if test="${actionBean.relation.foreignFeatureType.featureSource.id == s.id}">
                                               <c:set var="selected" value=" selected=\"selected\"" />
                                           </c:if>
                                           <option value="${s.id}"${selected}>${s.name}</option>
                                       </c:forEach>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td></td> 
                                <td></td>
                                <td>Koppelen met</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>
                                    Featuretype:
                                </td>
                                <td>
                                    <stripes:select name="relation.featureType" id="featuretypeSelect">
                                        <option value="-1">Maak uw keuze..</option>
                                        <c:forEach var="f" items="${actionBean.featureTypes}">    
                                            <c:set var="selected" value="" />
                                            <c:if test="${actionBean.relation.featureType.id == f.id}">
                                                <c:set var="selected" value=" selected=\"selected\"" />
                                            </c:if>
                                            <option value="${f.id}"${selected}><c:out value="${f.featureSource.name}"/> - <c:out value="${f.typeName}"/></option>                                            
                                        </c:forEach>
                                    </stripes:select>
                                </td>
                                <td></td>
                                <td>
                                    <stripes:select name="relation.foreignFeatureType" id="foreignFeaturetypeSelect">
                                        <option value="-1">Maak uw keuze..</option>
                                        <c:forEach var="f" items="${actionBean.foreignFeatureTypes}">    
                                            <c:set var="selected" value="" />
                                            <c:if test="${actionBean.relation.foreignFeatureType.id == f.id}">
                                                <c:set var="selected" value=" selected=\"selected\"" />
                                            </c:if>
                                            <option value="${f.id}"${selected}><c:out value="${f.featureSource.name}"/> - <c:out value="${f.typeName}"/></option>                                            
                                        </c:forEach>
                                    </stripes:select>
                                </td>
                            </tr>
                            <tr>
                                <td>Type relatie:</td>
                                <td><stripes:radio name="relation.type" value="join" checked="checked" class="joinrelateradio" />Join<br>
                                    <stripes:radio name="relation.type" value="relate" class="joinrelateradio" />Relate
                                </td>
                                <td></td>
                                <td></td>
                            </tr>
                        </table> 
                        <div style="margin-top: 10px;">Relatie op basis van de volgende attributen:</div>
                        <div id="attributeContainer"> </div> 
                        <%-- init attributes --%>                        
                        <script type="text/javascript">     
                            <c:forEach var="a" items="${actionBean.relation.featureType.attributes}">
                                attributes.push({id: ${a.id},name: '${a.name}'});
                            </c:forEach>
                            <c:forEach var="a" items="${actionBean.relation.foreignFeatureType.attributes}">
                                foreignAttributes.push({id: ${a.id},name: '${a.name}'});
                            </c:forEach>
                            <c:choose>
                                <c:when test="${fn:length(actionBean.relation.relationKeys)>0}">
                                    <c:forEach var="k" items="${actionBean.relation.relationKeys}">
                                        addAttributeBoxes(${k.leftSide.id},${k.rightSide.id});
                                    </c:forEach> 
                                </c:when>
                                <c:otherwise>
                                    addAttributeBoxes();
                                </c:otherwise>
                            </c:choose>
                        </script>
                        <div class="submitbuttons">
                            <stripes:submit name="save" value="Opslaan"/>
                            <stripes:submit name="cancel" value="Annuleren"/>
                        </div>
                        
                    </c:when>
                    <c:when test="${actionBean.context.eventName == 'save' || actionBean.context.eventName == 'delete'}">
                        <script type="text/javascript">
                            var frameParent = getParent();
                            if(frameParent && frameParent.vieweradmin_components_FeaturetypeRelation) {
                                frameParent.vieweradmin_components_FeaturetypeRelation.reloadGrid();
                            }
                        </script>
                        <stripes:submit name="edit" value="Nieuwe relatie"/>
                    </c:when>
                    <c:otherwise>
                        <stripes:submit name="edit" value="Nieuwe relatie"/>
                    </c:otherwise>
            </c:choose>
        </stripes:form>
        </div>
        <script type="text/javascript">
            var attributesUrl = '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.FeatureTypeRelationActionBean" event="getAttributesForFeaturetype"/>';
            var featureTypeUrl = '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.FeatureTypeRelationActionBean" event="getFeatureTypesForSource"/>';
            Ext.onReady(function() {
                function ensureRadioSelection(radiobuttons) {
                    var checkcount = 0;
                    for(var i = 0; i < radiobuttons.length; i++) {
                        if(radiobuttons[i].checked) {
                            checkcount++;
                        }
                    }
                    if(checkcount === 0) {
                        radiobuttons[0].checked = true;
                    }
                }
                ensureRadioSelection(document.querySelectorAll('.joinrelateradio'));
                appendPanel('headertext', 'formcontent');
            });
        </script>
    </stripes:layout-component>
</stripes:layout-render>
