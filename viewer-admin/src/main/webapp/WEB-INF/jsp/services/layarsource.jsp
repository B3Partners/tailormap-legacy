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
        <title><fmt:message key="viewer_admin.layarsource.0" /></title>
    </stripes:layout-component>

    <stripes:layout-component name="header">
        <jsp:include page="/WEB-INF/jsp/header.jsp"/>
    </stripes:layout-component>

    <stripes:layout-component name="body">
        <div id="content">
            <h1>Layarbronnen</h1>
            <div style="margin-top: 35px; margin-bottom: -20px;">
                <p><fmt:message key="viewer_admin.layarsource.1" /></p>
                <select name="layarServiceId" id="layarServiceId">
                    <option value="-1"><fmt:message key="viewer_admin.layarsource.2" /></option>
                    <c:forEach var="service" items="${actionBean.layarServices}">
                        <c:set var="selected" value="" />
                        <c:if test="${actionBean.layarServiceId == service.id}">
                            <c:set var="selected" value=" selected=\"selected\"" />
                        </c:if>
                        <option value="${service.id}"${selected}><c:out value="${service.name}"/></option>
                    </c:forEach>
                </select>
            </div>

            <div id="grid-container" class="attribute"></div>
            <div id="form-container" class="attribute">
                <iframe src="<stripes:url beanclass="nl.b3p.viewer.admin.stripes.LayarSourceActionBean" event="cancel"/>" id="editFrame" frameborder="0"></iframe>
            </div>
        </div>
            
        <script type="text/javascript" src="${contextPath}/resources/js/services/layarsource.js"></script>
        <script type="text/javascript">
            var gridurl = '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.LayarSourceActionBean" event="getGridData"/>';
            var editurl = '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.LayarSourceActionBean" event="edit"/>';
            var deleteurl = '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.LayarSourceActionBean" event="delete"/>';
            vieweradmin.components.Menu.setActiveLink('menu_layarsource');
            
            Ext.onReady(function() {
                var layarServiceEl = Ext.get('layarServiceId');
                layarServiceEl.on('change', function() {
                    layarServiceChange(layarServiceEl);
                });                
                
                // Init with change, because a certain select value can be preselected
                layarServiceChange(layarServiceEl);
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
            function layarServiceChange(selectElement) {
                var selectedValue = parseInt(selectElement.getValue());

                //if(selectedValue ) {                   
                    var gridStore = Ext.getCmp('editGrid').getStore();
                    gridStore.proxy.extraParams.layarServiceId = selectedValue;
                    // Go back to page 1 and reload store
                    gridStore.load({params: {
                        start: 0,
                        page: 1,
                        limit: 10
                    }});
                    gridStore.loadPage(1, {limit:10});
                //}
            }
            function reloadGrid(){
                Ext.getCmp('editGrid').getStore().load(); 
            }
        </script>
    </stripes:layout-component>

</stripes:layout-render>
