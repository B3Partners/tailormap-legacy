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
        <title>Gegevensregister</title>
    </stripes:layout-component>

    <stripes:layout-component name="header">
        <jsp:include page="/WEB-INF/jsp/header.jsp"/>
    </stripes:layout-component>

    <stripes:layout-component name="body">
        <div id="content">
            <h1>Attributen<a href="#Attribuutlijst_Help" title="Help" class="helplink"></a></h1>

            <div style="margin-top: 35px; margin-bottom: -20px;">
                <p>Attributen beheren voor</p>
                <select name="featureSourceId" id="featureSourceId">
                    <option value="-1">Maak uw keuze..</option>
                    <c:forEach var="source" items="${actionBean.featureSources}">
                        <c:set var="selected" value="" />
                        <c:if test="${actionBean.featureSourceId == source.id}">
                            <c:set var="selected" value=" selected=\"selected\"" />
                        </c:if>
                        <option value="${source.id}"${selected}>${source.protocol} #${source.id} <c:out value="${source.name}"/></option>
                    </c:forEach>
                </select>
                <select name="simpleFeatureTypeId" id="simpleFeatureTypeId">
                    <option value="1">Maak uw keuze..</option>
                </select>
            </div>

            <div id="grid-container" class="attribute"></div>
            <div id="form-container" class="attribute">
                <iframe src="<stripes:url beanclass="nl.b3p.viewer.admin.stripes.AttributeActionBean" event="cancel"/>" id="editFrame" frameborder="0"></iframe>
            </div>
        </div>
        <script type="text/javascript" src="${contextPath}/resources/js/services/attribute.js"></script>
        <script type="text/javascript">
            var gridurl = '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.AttributeActionBean" event="getGridData"/>';
            var editurl = '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.AttributeActionBean" event="edit"/>';
            vieweradmin.components.Menu.setActiveLink('menu_attributen');

            Ext.onReady(function() {
                var featureSourceId = Ext.get('featureSourceId');
                var simpleFeatureTypeId = Ext.get('simpleFeatureTypeId');
                featureSourceId.on('change', function() {
                    featureSourceChange(featureSourceId);
                });
                simpleFeatureTypeId.on('change', function() {
                    simpleFeatureTypeChange(simpleFeatureTypeId);
                });
                function getOption(value, text, selected) {
                    var option = document.createElement('option');
                    option.value = value;
                    option.innerHTML = text;
                    if(selected) {
                        option.selected = true;
                    }
                    return option;
                }
                function removeChilds(el) {
                    if (el.hasChildNodes()) {
                        while (el.childNodes.length >= 1) {
                            el.removeChild(el.firstChild);
                        }
                    }
                }
                function featureSourceChange(featureSourceId) {
                    var selectedValue = parseInt(featureSourceId.getValue());

                    var simpleFeatureTypeId = document.getElementById('simpleFeatureTypeId');
                    // We are now emptying dom and adding options manully, don't know if this is optimal
                    removeChilds(simpleFeatureTypeId);
                    simpleFeatureTypeId.appendChild(getOption(-1, 'Kies...', true));

                    if(selectedValue != -1) {
                        Ext.Ajax.request({
                            url: '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.AttributeActionBean" event="getFeatureTypes"/>',
                            scope:this,
                            params: {
                                featureSourceId: selectedValue
                            },
                            success: function ( result, request ) {
                                result = Ext.JSON.decode(result.responseText);
                                Ext.Array.each(result, function(item) {
                                    simpleFeatureTypeId.appendChild(getOption(item.id, item.name, false));
                                });
                            },
                            failure: function() {
                                Ext.MessageBox.alert("Foutmelding", "Er is een onbekende fout opgetreden");
                            }
                        });
                        var gridStore = Ext.getCmp('editGrid').getStore();
                        gridStore.proxy.extraParams.featureSourceId = selectedValue;
                        // Go back to page 1 and reload store
                        gridStore.load({params: {
                            start: 0,
                            page: 1,
                            limit: 10
                        }});
                        gridStore.loadPage(1, {limit:10});
                    }
                }
                function simpleFeatureTypeChange(simpleFeatureTypeId) {
                    var gridStore = Ext.getCmp('editGrid').getStore();
                    gridStore.proxy.extraParams.simpleFeatureTypeId = simpleFeatureTypeId.getValue();
                    // Go back to page 1 and reload store
                    gridStore.load({params: {
                        start: 0,
                        page: 1,
                        limit: 10
                    }});
                    gridStore.loadPage(1, {limit:10});
                }
                // Init with change, because a certain select value can be preselected
                featureSourceChange(featureSourceId);
            });

            function reloadGrid(){
                Ext.getCmp('editGrid').getStore().load();
            }
        </script>
    </stripes:layout-component>

</stripes:layout-render>
