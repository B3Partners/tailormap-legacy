/* 
 * Copyright (C) 2012-2013 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * Buffer component
 * Creates a Buffer component
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define ("viewer.components.Buffer",{
    extend: "viewer.components.Component",
    layerSelector: null,
    radius:null,
    imageLayers:null,
    colorPicker:null,
    color:null,
    panel: null,
    config: {
        layers:null,
        title:null,
        maxFeatures:null,
        iconUrl:null,
        tooltip:null,
        label: "",
        details: {
            minWidth: 300,
            minHeight: 225
        }
    },
    constructor: function (conf){
        this.initConfig(conf);     
		viewer.components.Buffer.superclass.constructor.call(this, this.config);
        if(this.config.maxFeatures == null){
            this.config.maxFeatures = 50;
        }
        var me = this;
        this.renderButton({
            handler: function(){
                me.buttonClick();
            },
            text: me.config.title,
            icon: me.config.iconUrl,
            tooltip: me.config.tooltip,
            label: me.config.label
        });      
        this.imageLayers = new Array();
        this.config.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_SELECTEDCONTENT_CHANGE,this.selectedContentChanged,this );
        return this;
    },
    selectedContentChanged : function (){
        for(var i = 0 ;i < this.imageLayers.length ;i++){
            this.config.viewerController.mapComponent.getMap().addLayer(this.imageLayers[i]);
        }
    },
    buttonClick : function (){ 
        if (this.panel ==null){
            this.loadWindow();
        }
        this.layerSelector.initLayers();
        this.popup.show();
    },
    loadWindow : function(){        
        var me = this;
        this.radius = Ext.create("Ext.form.field.Text",{
            name: "straal" ,
            id: this.name + "Radius",
            fieldLabel: i18next.t('viewer_components_buffer_0')
        });
        
        this.colorPicker = Ext.create("Ext.ux.ColorField",{ 
            showText: true,
            name: 'color',
            fieldLabel : "Kleur buffer",
            id:'color' + this.name,            
            value: "FF0000",
            listeners :{
                select : {
                    fn: this.colorChanged,
                    scope : this
                }
            }
        });
        
        this.buffer = Ext.create("Ext.button.Button",{
            name: "buffer" ,
            id: this.name + "BufferButton",
            text: i18next.t('viewer_components_buffer_1'),
            margin: '10px 0px 0px 0px',
            listeners: {
                click:{
                    scope: this,
                    fn: this.buffer
                }
            }
        });
        
        this.remove = Ext.create("Ext.button.Button",{
            name: "removeBuffer" ,
            id : this.name + "RemoveButton",
            text: i18next.t('viewer_components_buffer_2'), 
            margin: '10px 0px 0px 10px',           
            listeners: {
                click:{
                    scope: this,
                    fn: function(){
                        me.removeBuffer();
                        if(viewer.components.MobileManager.isMobile()) {
                            me.popup.hide();
                        }
                    }
                }
            }
        });
        
        this.layerSelector = Ext.create("viewer.components.LayerSelector",{
            viewerController : this.config.viewerController,
            layers : this.config.layers,
            restriction: "bufferable"
        });
        
        this.panel = Ext.create ("Ext.container.Container",{
            id: this.name +"Container",
            renderTo : this.getContentDiv(),
            margin: '0px 0px 0px 10px',
            items:[
                this.layerSelector.getLayerSelector(),
                this.radius,
                this.colorPicker,
                this.buffer,
                this.remove
            ]
        });
    },
    buffer : function (){
        var layer = this.layerSelector.getValue();
        var radius = this.radius.getValue();
        if(layer != null && radius != ""){
            this.removeBuffer();
            var filterParams = null;
            if(layer.filter){
                filterParams = "&filter=" + encodeURIComponent(layer.filter.getCQL());
            }
            var bbox = this.config.viewerController.mapComponent.getMap().getExtent();
            var width = this.config.viewerController.mapComponent.getMap().getWidth();
            var height = this.config.viewerController.mapComponent.getMap().getHeight();
            var url = FlamingoAppLoader.get('absoluteURIPrefix') + FlamingoAppLoader.get('contextPath') + "/action/Buffer";
            var attrs ="?bbox="+ bbox.toString() + "&serviceId="+ layer.serviceId+"&layerName="+ layer.layerName +"&width="+ width+"&height="+height+"&buffer="+radius+"&maxFeatures="+ this.config.maxFeatures;
            if(this.color != null){
                    attrs += "&color="+this.color;
            }
            url += attrs;
            if(filterParams){
                var filterUrl = url + filterParams;
                url = filterUrl;
                if(filterUrl.length > 1024){
                    this.config.viewerController.logger.warning("Buffertool generates url with filters that has more than 1024 characters, which can produce faulty requests in some browsers");
                }
            }
            var imageLayer = this.config.viewerController.mapComponent.createImageLayer(this.name + "_" + layer.id, url, bbox);
            this.imageLayers.push(imageLayer);
            this.config.viewerController.mapComponent.getMap().addLayer(imageLayer);
            if(viewer.components.MobileManager.isMobile()) {
                this.popup.hide();
            }
        }
    },
    removeBuffer : function(){
        var map = this.config.viewerController.mapComponent.getMap();
        var layer = this.layerSelector.getValue();
        if(layer != null){
            var bufferId = this.name + "_" + layer.id;
            var mapLayer = map.getLayer(bufferId);
            if(mapLayer!=null){
                map.removeLayer(mapLayer);
            }
            for(var i = 0 ; i < this.imageLayers.length ; i++ ){
                if(this.imageLayers[i].id == bufferId){
                    this.imageLayers.splice(i,1);
                }
            }
        }
    },
    getBookmarkState: function() {
        var state = [];
        for (var i = 0; i < this.imageLayers.length; i++){
            state.push({
                id: this.imageLayers[i].id,
                url: this.imageLayers[i].url,
                bbox: this.imageLayers[i].extent
            });
        }
        return state;
    },

    loadVariables: function (state) {
        state = Ext.decode(state);
        if (state.length > 0) {
            this.imageLayers = [];
            for(var i = 0; i < state.length; i++) {
                this.imageLayers.push(this.config.viewerController.mapComponent.createImageLayer(state[i].id, state[i].url, state[i].bbox));
            }
            this.selectedContentChanged();
        }
    },
    getExtComponents: function() {
        if(this.panel) {
            return Ext.Array.merge([ this.name +"Container" ], this.layerSelector.getExtComponents());
        } else {
            return [];
        }
    },
    colorChanged : function (color){
        this.color = color;
    }
});
