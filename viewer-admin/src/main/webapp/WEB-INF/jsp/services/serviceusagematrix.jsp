<%--
Copyright (C) 2013-2015 B3Partners B.V.

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
        <title>Service Usage Matrix</title>
    </stripes:layout-component>

    <stripes:layout-component name="header">
        <jsp:include page="/WEB-INF/jsp/header.jsp"/>
    </stripes:layout-component>

    <stripes:layout-component name="body">
        <script type="text/javascript">
            vieweradmin.components.Menu.setActiveLink('menu_serviceusagematrix');
            var deleteApplicationLayerUrl= <js:quote><stripes:url beanclass="nl.b3p.viewer.admin.stripes.ServiceUsageMatrixActionBean" event="deleteApplicationLayer"/></js:quote>
            
            function deleteApplicationLayer(applicationId, appLayerId, store){
                Ext.Ajax.request({ 
                    url: deleteApplicationLayerUrl, 
                    scope:this,
                    params: { 
                        applicationLayer: appLayerId,
                        application: applicationId
                    }, 
                    success: function ( result  ) {
                        result = Ext.JSON.decode(result.responseText);
                        if (result.success){
                            Ext.MessageBox.alert("Verwijderd", "De kaart "+result.name+"("+result.id+") is verwijderd.");
                            var rec=store.getById(appLayerId);
                            store.remove(rec);
                        }else{
                            Ext.MessageBox.alert("Foutmelding", "Het verwijderen is niet gelukt: "+result.message);
                        }
                    },
                    failure: function() {
                        Ext.MessageBox.alert("Foutmelding", "Er is een fout opgetreden: "+result.message);
                    }
                });
            }
            var changedFeatureTypes;
            <c:if test="${not empty actionBean.changedFeatureTypes}">
                changedFeatureTypes=${actionBean.changedFeatureTypes};
            </c:if>
            var translateKey={
                "FAILED" : "Mislukt",
                "MISSING" : "Ontbreekt",
                "NEW" : "Nieuw",
                "UNMODIFIED" : "Ongewijzigd", 
                "CHANGED" : "Gewijzigd", 
                "UPDATED" : "Geupdate"
            }
            function checkChanged(){
                if (changedFeatureTypes){
                    for (var key in changedFeatureTypes){
                        if(changedFeatureTypes[key]){
                            for(var i =0; i < changedFeatureTypes[key].length; i++){
                                var els = Ext.select(".featureType_"+changedFeatureTypes[key][i]);
                                els.addCls("featureType-"+key.toLowerCase());
                                var transKey = translateKey[key];
                                els.insertHtml("beforeEnd"," ("+transKey+")");
                            }
                        }
                    }
                }
            }
            function exportXsl(){
                var url=<js:quote><stripes:url beanclass="nl.b3p.viewer.admin.stripes.ServiceUsageMatrixActionBean" event="view"/></js:quote>
                url+="?output_format=XSL";
                <c:if test="${not empty actionBean.featureSource}">
                    url+="&featureSource=${actionBean.featureSource.id}";
                </c:if>
                window.open(url);
            }
            Ext.onReady(checkChanged);
        </script>
        <div id="content">
            <h1>Service Usage Matrix</h1>
            <div style="margin-top: 35px; margin-bottom: -20px;">&nbsp;</div>
            <a href="javascript: void(0)" onclick="exportXsl()">Exporteer als Excel document</a><br>
            <x:parse xml="${actionBean.xml}" var="doc"/>
            <script type="text/javascript">
                Ext.define('ServiceUsage', {
                    extend: 'Ext.data.Model',
                    fields: [
                        {name: 'featureType', type: 'string'},
                        {name: 'application',  type: 'string'},
                        {name: 'layer',       type: 'string'},
                        {name: 'appLayer',  type: 'string'},
                        {name: 'remove:',  type: 'string'},
                        {name: 'id',  type: 'int'},
                    ]
                });
                <x:forEach select="$doc/root/featureSources/featureSource" var="featureSource">
                    <x:set var="total" select="count($featureSource//applayer)"/>                        
                    <c:set var="count" value="0" scope="page" />
                    var store<x:out select="$featureSource/id"/> = Ext.create('Ext.data.Store',{
                        model: 'ServiceUsage',
                        storeId: 'store<x:out select="$featureSource/id"/>',
                        data:[                        
                            <x:choose>
                                <x:when select="$featureSource//applayer">
                                    <x:forEach select="$featureSource/featureType" var="featureType" varStatus="ftcount">  
                                        <x:forEach select="$featureType/applications/application" var="application" varStatus="appcount">
                                            <x:forEach select="$application/layers/layer" var="layer" varStatus="lcount">
                                                <x:forEach select="$layer/applayers/applayer" var="appLayer" varStatus="applcount">
                                                    <c:set var="count" value="${count + 1}" scope="page"/>
                                                    {id: <x:out select="$appLayer/id"/>,
                                                    featureType: '<x:out select="$featureType/name"/>',
                                                    application: '<x:out select="$application/name"/>,versie: <x:out select="$application/version"/> (<x:out select="$application/id"/>)',
                                                    layer: '<x:out select="$layer/name"/>',
                                                    appLayer: '<x:out select="$appLayer/alias"/>(<x:out select="$appLayer/id"/>) ',
                                                    remove: '<x:out select="$application/id"/>,<x:out select="$appLayer/id"/>,store<x:out select="$featureSource/id"/>'}
                                                    <c:if test="${count!=total}">,</c:if>
                                                 </x:forEach>
                                            </x:forEach>
                                        </x:forEach>
                                    </x:forEach>                                
                                </x:when>
                                <x:otherwise>                                    
                                </x:otherwise>
                            </x:choose>
                        ]
                    });
                </x:forEach>
            </script>
            <x:forEach select="$doc/root/featureSources/featureSource" var="featureSource">                    
                <div id='featureSource<x:out select="$featureSource/id"/>' class="usageMatrixFeatureSource">
                    <b>Attribuutbron: <x:out select="$featureSource/name"/> (<x:out select="$featureSource/protocol"/>:: <x:out select="$featureSource/url"/> id: <x:out select="$featureSource/id"/>) </b>
                    <x:choose>
                        <x:when select="$featureSource//applayer">
                            <script type="text/javascript">
                                Ext.onReady(function(){
                                    Ext.create('Ext.grid.Panel',{
                                        store :  store<x:out select="$featureSource/id"/>,
                                        columns : [
                                            {text: 'Featuretype', dataIndex: 'featureType',flex: 1},
                                            {text: 'Applicatie', dataIndex: 'application',flex: 1},
                                            {text: 'Layernaam van service', dataIndex: 'layer',flex: 1},
                                            {text: 'Applicatie layer (kaart)', dataIndex: 'appLayer',flex: 1},
                                            {text: '', dataIndex: 'remove', flex: 1, menuDisabled: true,
                                                renderer: function(value) {
                                                    return Ext.String.format('<a href="javascript: void(0)" onclick="return deleteApplicationLayer({0});">Verwijder</a>', value);
                                                },
                                                sortable: false
                                            }
                                        ],
                                        renderTo: 'featureSource<x:out select="$featureSource/id"/>'
                                    });
                                });
                            </script>
                        </x:when>
                        <x:otherwise>
                            <br>De service wordt niet gebruikt in één van de geconfigureerde applicaties.
                        </x:otherwise>
                    </x:choose>
                </div> 
            </x:forEach>
        </div>
    </stripes:layout-component>

</stripes:layout-render>