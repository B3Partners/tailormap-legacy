<%--
Copyright (C) 2011 B3Partners B.V.

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
        <title>Geo service</title>
    </stripes:layout-component>
    <stripes:layout-component name="body">

        <p>
        <stripes:errors/>
        <stripes:messages/>
        </p>
            <stripes:form beanclass="nl.b3p.viewer.admin.stripes.GeoServiceActionBean">
                
<c:if test="${(actionBean.context.eventName == 'default' || actionBean.context.eventName == 'editCategory') && !empty actionBean.category}">

    <script type="text/javascript">
        Ext.create('Ext.Button', {
            renderTo: document.body,
            text    : 'Service toevoegen aan <c:out value="${actionBean.category.name}"/>',
            icon    : '${contextPath}/resources/images/add.png',
            handler: function() {
                window.location.href = '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.GeoServiceActionBean" event="addForm"><stripes:param name="category" value="${actionBean.category}"/></stripes:url>';
            }
        });
        
        function deleteConfirm() {
            return confirm('Weet u zeker dat u deze categorie wilt verwijderen?');
        }
    </script>
    <stripes:hidden name="category" value="${actionBean.category.id}"/>
    Naam: <stripes:text name="categoryName" value="${actionBean.category.name}"/><br />
    <stripes:submit name="editCategory" value="Opslaan"/>
    <stripes:submit name="deleteCategory" onclick="return deleteConfirm();" value="Verwijder categorie"/>
    <stripes:submit name="cancel" value="Annuleren"/><br />
    
    <script type="text/javascript">
        var frameParent = getParent();
        if(frameParent && frameParent.addServiceNode && '${actionBean.newService}' != '') {
            frameParent.addServiceNode('${actionBean.newService}');
        }
    </script>
    <script type="text/javascript">
        var frameParent = getParent();
        if(frameParent && frameParent.renameNode && '${actionBean.category.name}' != '') {
            frameParent.renameNode('c${actionBean.category.id}','${actionBean.category.name}');
        }
    </script>
</c:if>
            
<c:if test="${actionBean.context.eventName == 'deleteCategory'}">
    <script type="text/javascript">
        var frameParent = getParent();
        if(frameParent && frameParent.removeTreeNode && '${actionBean.categoryId}' != '') {
            frameParent.removeTreeNode('${actionBean.categoryId}');
        }
    </script>
</c:if>
    
<c:if test="${actionBean.context.eventName == 'deleteService'}">
    <script type="text/javascript">
        var frameParent = getParent();
        if(frameParent && frameParent.removeTreeNode && '${actionBean.serviceId}' != '') {
            frameParent.removeTreeNode('${actionBean.serviceId}');
        }
    </script>
</c:if>
    
 <c:if test="${actionBean.context.eventName == 'saveService'}">
    <script type="text/javascript">
        var frameParent = getParent();
        if(frameParent && frameParent.renameNode && '${actionBean.service.name}' != '') {
            frameParent.renameNode('s${actionBean.service.id}','${actionBean.service.name}');
        }
    </script>
</c:if>
    
<%-- Bestaande service --%>
<c:if test="${actionBean.context.eventName == 'editGeoService'}">   
    <h1>Service wijzigen</h1>
    
    <table>
        <tr>
            <td>URL van de service:</td>
            <td><stripes:text name="url" maxlength="255" size="80" disabled="true"/></td>
        </tr>
        <tr><td>Protocol:</td>
            <td>
                <stripes:select name="protocol" disabled="true" onchange="checkProtocol()" onkeyup="checkProtocol()">
                    <stripes:option value="wms">WMS</stripes:option>
                    <stripes:option value="arcgis">ArcGIS Server</stripes:option>
                    <stripes:option value="arcims">ArcIMS</stripes:option>
                </stripes:select>
            </td>
        </tr>
        <c:if test="${actionBean.protocol == 'arcims'}">
            <tr>
                <td>Service name:</td>
                <td>
                    <stripes:text name="serviceName" disabled="true" size="30"/>
                </label>
                </td>
            </tr>          
        </c:if>
        <tr>
            <td>Weergavenaam:</td>
            <td><stripes:text name="name" maxlength="255" size="30"/></td>
        </tr>
        <tr>
            <td>Gebruikersnaam:</td>
            <td><stripes:text name="username" maxlength="255" size="30"/></td>
        </tr>
        <tr>
            <td>Wachtwoord:</td>
            <td><stripes-dynattr:password name="password" autocomplete="off" maxlength="255" size="30"/></td>
        </tr>
    </table>
    
    <stripes:submit name="saveService" value="Opslaan"/>
    <stripes:hidden name="service" value="${actionBean.service.id}"/>
    <stripes:submit name="deleteService" onclick="return deleteServiceConfirm();" value="Verwijder service"/>
    <stripes:submit name="cancel" value="Annuleren"/>
    <script type="text/javascript">
        function deleteServiceConfirm() {
            return confirm('Weet u zeker dat u deze service wilt verwijderen?');
        }
    </script>
</c:if>

<%-- Nieuwe service --%>
<c:if test="${actionBean.context.eventName == 'addForm' || actionBean.context.eventName == 'add'}">
    
    <stripes:hidden name="category"/>
    
    <h1>Nieuwe service toevoegen</h1>
    <p>
    <script type="text/javascript">
        function checkProtocol() {
            var protocol = Ext.query("select[name='protocol']")[0].value;
            Ext.fly('useUrlTr').setVisible(protocol == "wms");
            Ext.fly('serviceNameTr').setVisible(protocol == "arcims");            
        }

        Ext.onReady(checkProtocol);
    </script>    
    <table>
        <tr>
            <td>URL van de service:</td>
            <td><stripes:text name="url" maxlength="255" size="80"/></td>
        </tr>
        <tr><td>Protocol:</td>
            <td>
                <stripes:select name="protocol" onchange="checkProtocol()" onkeyup="checkProtocol()">
                    <stripes:option value="wms">WMS</stripes:option>
                    <stripes:option value="arcgis">ArcGIS MapServer (REST)</stripes:option>
                    <stripes:option value="arcims">ArcIMS</stripes:option>
                </stripes:select>
            </td>
        </tr>
        <tr id="useUrlTr">
            <td colspan="2">
                <label>
                    <stripes:checkbox name="overrideUrl"/>Gebruik altijd ingevulde URL in plaats van URLs in GetCapabilities
                </label>
            </td>
        </tr>
        <tr id="serviceNameTr">
            <td>Service name:</td>
            <td>
            <label>
                <stripes:text name="serviceName" maxlength="255" size="30"/>
            </label>
            </td>
        </tr>        
        <tr>
            <td>Weergavenaam:</td>
            <td><stripes:text name="name" maxlength="255" size="30"/></td>
        </tr>
        <tr>
            <td>Gebruikersnaam:</td>
            <td><stripes:text name="username" maxlength="255" size="30"/></td>
        </tr>
        <tr>
            <td>Wachtwoord:</td>
            <td><stripes-dynattr:password name="password" autocomplete="off" maxlength="255" size="30"/></td>
        </tr>
        <tr>
            <td colspan="2"><i>De weergavenaam wordt bij het inladen van de service
                    automatisch bepaald. Bovenstaand kan optioneel een alternatieve weergavenaam
                    worden ingevuld.</i>
            </td>
        </tr>

    </table>
</p>
    <stripes:submit name="add" value="Service inladen"/>
    <stripes:submit name="cancel" value="Annuleren"/>
</c:if>
    
</stripes:form>

    </stripes:layout-component>
</stripes:layout-render>