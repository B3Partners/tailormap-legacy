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
        <p>
        <!--event: ${actionBean.context.eventName}<br>
        <p>-->
            <stripes:form beanclass="nl.b3p.viewer.admin.stripes.GeoServiceActionBean">
                
<c:if test="${actionBean.context.eventName == 'default' && !empty actionBean.category}">

    <script type="text/javascript">
        Ext.create('Ext.Button', {
            renderTo: document.body,
            text    : 'Service toevoegen aan <c:out value="${actionBean.category.name}"/>',
            icon    : '${contextPath}/resources/images/add.png',
            handler: function() {
                window.location.href = '<stripes:url beanclass="nl.b3p.viewer.admin.stripes.GeoServiceActionBean" event="addForm"><stripes:param name="category" value="${actionBean.category}"/></stripes:url>';
            }
        });
    </script>
    <stripes:hidden name="category" value="${actionBean.category.id}"/>
    Naam: <stripes:text name="categoryName" value="${actionBean.category.name}"/><br />
    <stripes:submit name="editCategory" value="Opslaan"/>
    <stripes:submit name="deleteCategory" value="Verwijder categorie"/>
    <stripes:submit name="cancel" value="Annuleren"/><br />
    
    <script type="text/javascript">
        var frameParent = getParent();
        if(frameParent && frameParent.addServiceNode && '${actionBean.newService}' != '') {
            frameParent.addServiceNode('${actionBean.newService}');
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
    
 <c:if test="${actionBean.context.eventName == 'editCategory'}">
    <script type="text/javascript">
        var frameParent = getParent();
        if(frameParent && frameParent.renameNode && '${actionBean.category.name}' != '') {
            frameParent.renameNode('c${actionBean.category.id}','${actionBean.category.name}');
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
            <td><stripes:text name="url" value="${actionBean.service.url}" maxlength="255" size="80" disabled="true"/></td>
        </tr>
        <tr><td>Protocol:</td>
            <td>
                <stripes:select name="protocol" disabled="true" onchange="checkProtocol()" onkeyup="checkProtocol()">
                    <stripes:option value="wms">WMS</stripes:option>
                    <stripes:option value="arcgis">ArcGIS Server</stripes:option>
                    <stripes:option value="arcxml">ArcIMS</stripes:option>
                </stripes:select>
            </td>
        </tr>
        <tr>
            <td>Weergavenaam:</td>
            <td><stripes:text name="name" value="${actionBean.service.name}" maxlength="255" size="30"/></td>
        </tr>
        <tr>
            <td>gebruikersnaam:</td>
            <td><stripes:text name="username" value="${actionBean.service.username}" maxlength="255" size="30"/></td>
        </tr>
        <tr>
            <td>Wachtwoord:</td>
            <td><stripes:text name="password" value="${actionBean.service.password}" maxlength="255" size="30"/></td>
        </tr>
    </table>
    
    <stripes:submit name="saveService" value="Opslaan"/>
    <stripes:hidden name="service" value="${actionBean.service.id}"/>
    <stripes:submit name="deleteService" value="Verwijder service"/>
    <stripes:submit name="cancel" value="Annuleren"/>
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
                    <stripes:option value="arcgis">ArcGIS Server</stripes:option>
                    <stripes:option value="arcxml">ArcIMS</stripes:option>
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
        <tr>
            <td>Weergavenaam:</td>
            <td><stripes:text name="name" maxlength="255" size="30"/></td>
        </tr>
        <tr>
            <td>gebruikersnaam:</td>
            <td><stripes:text name="username" maxlength="255" size="30"/></td>
        </tr>
        <tr>
            <td>Wachtwoord:</td>
            <td><stripes:text name="password" maxlength="255" size="30"/></td>
        </tr>
        <tr>
            <td colspan="2"><i>De weergavenaam wordt bij het inladen van de service
                    automatisch bepaald. Bovenstaand kan optioneel een alternatieve weergavenaam
                    worden ingevuld.</i>
            </td>
        </tr>

    </table>
    <stripes:submit name="add" value="Service inladen"/>
    <stripes:submit name="cancel" value="Annuleren"/>
</c:if>

</stripes:form>

    </stripes:layout-component>
</stripes:layout-render>