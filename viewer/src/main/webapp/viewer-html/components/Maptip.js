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
/* global Ext */

/**
 * Maptip component
 * Creates a maptip component
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define ("viewer.components.Maptip",{
    extend: "viewer.components.Component",
    balloon: null,
    maptipComponent: null,
    showMaxFeaturesText:null,
    config: {
        layers: null,
        maptipdelay: 500,
        height: null,
        width: null,
        maxDescLength: 30,
        moreLink: null,
        detailShowAttr: true,
        detailShowTitle: true,
        detailShowDesc: true,
        detailShowImage: true,
        detailHideGeomAttr: true,
        heightDescription: null,
        clickRadius:null,
        spinnerWhileIdentify:null,
        useOrderedAttributes: false,
        details: {
            minWidth: 400,
            minHeight: 250
        }
    },
    serverRequestEnabled: false,
    serverRequestLayers: null,
    featureInfo: null,
    enabled: true,
    lastPosition: null,
    worldPosition: null,
    requestExtent:null,
    requestManager: null,
    extraLinkCallbacks: [],
    relatedFeatureBlocks: {},
    currentRequestId:null,
    /**
     * @constructor
     */
    constructor: function (conf){
        conf.isPopup=true;
        this.initConfig(conf);
	viewer.components.Maptip.superclass.constructor.call(this, this.config);
        this.showMaxFeaturesText = true;

        //make the balloon
        this.balloon = new Balloon(this.getDiv(),this.config.viewerController.mapComponent,"balloon",this.config.width,this.config.height);
        this.balloon.zIndex = this.balloon.zIndex+1;
        //set the offset of the map        
        var me = this;        
        //if topmenu height is in % then recalc on every resize.        
        var topMenuLayout=this.config.viewerController.getLayout('top_menu');
        if (topMenuLayout.heightmeasure && topMenuLayout.heightmeasure === "%"){
            Ext.on('resize', function(){
                me.onResize();
            }, this);
        }
        this.onResize();

        this.config.clickRadius = this.config.clickRadius ? this.config.clickRadius : 4;
        this.config.spinnerWhileIdentify = this.config.spinnerWhileIdentify ? this.config.spinnerWhileIdentify : false;

        //listen to the on addlayer
        this.config.viewerController.mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_ADDED,this.onAddLayer,this);
        this.config.viewerController.mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_REMOVED,this.onLayerRemoved,this);
        //listen to the onmaptipcancel
        this.config.viewerController.mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_MAPTIP_CANCEL,this.onMaptipCancel,this);             
        this.config.viewerController.mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_CHANGE_EXTENT,this.onChangeExtent,this);
        //Add the maptip component to the framework
        conf.type = viewer.viewercontroller.controller.Component.MAPTIP;
        this.maptipComponent = this.config.viewerController.mapComponent.createComponent(conf);
        this.config.viewerController.mapComponent.addComponent(this.maptipComponent);
        document.getElementById(this.getDiv()).addEventListener('click', this.relatedFeaturesListener.bind(this));
        if(this.popup){
            document.getElementById(this.popup.getContentId()).addEventListener('click', this.relatedFeaturesListener.bind(this));
        }
        return this;
    },
    /**
     * Event handler for when a layer is added to the map
     * @see event ON_LAYER_ADDED
     */
    onAddLayer: function(map,options){
        var mapLayer = options.layer;
        if (mapLayer === null)
            return;
        if (!this.isLayerConfigured(mapLayer)){
            return;
        }
        if(this.viewerController.isSummaryLayer(mapLayer)){
            if (mapLayer.appLayerId){
                var appLayer=this.config.viewerController.app.appLayers[mapLayer.appLayerId];
                var layer = this.config.viewerController.app.services[appLayer.serviceId].layers[appLayer.layerName];
                //Store the current map extent for every maptip request.            
                this.config.viewerController.mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_MAPTIP,function(map,options){
                    this.setRequestExtent(map.getExtent());
                },this);

                //do server side getFeature.
                if (layer.hasFeatureType){
                    this.addLayerInServerRequest(appLayer);
                }else{
                    if(mapLayer.getLayers() != null){
                        //let the mapComponent handle the getFeature
                        mapLayer.setMaptips(mapLayer.getLayers().split(","));
                        //listen to the onMaptipData
                        mapLayer.addListener(viewer.viewercontroller.controller.Event.ON_MAPTIP_DATA,this.onMapData,this);
                    }
                }
            }else{
                mapLayer.addListener(viewer.viewercontroller.controller.Event.ON_MAPTIP_DATA,this.onMapData,this);
            }
        }
    },

    onLayerRemoved: function(map,options) {
        var mapLayer = options.layer;
        if (mapLayer === null)
            return;
        if(this.viewerController.isSummaryLayer(mapLayer)){
            if (mapLayer.appLayerId){
                var appLayer=this.config.viewerController.app.appLayers[mapLayer.appLayerId];
                var layer = this.config.viewerController.app.services[appLayer.serviceId].layers[appLayer.layerName];
                if (layer.hasFeatureType && this.serverRequestLayers){
                    Ext.Array.remove(this.serverRequestLayers, appLayer);
                }
            }
        }

    },

    onResize : function(){
        var top = this.config.viewerController.getTopMenuHeightInPixels();        
        this.balloon.offsetY=Number(top);
    },

    onChangeExtent: function(map, options) {
        this.balloon.close();
    },

    /**
     * Enable doing server requests.
     * @param appLayer the applayer
     */
    addLayerInServerRequest: function (appLayer){
        //first time register for event and make featureinfo ajax request handler.
        if (!this.serverRequestEnabled){
            this.config.viewerController.mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_MAPTIP,this.doServerRequest,this);
            this.requestManager = Ext.create(viewer.components.RequestManager,Ext.create("viewer.FeatureInfo", {viewerController: this.config.viewerController}), this.config.viewerController);
            this.serverRequestEnabled = true;
        }
        if (this.serverRequestLayers === null){
            this.serverRequestLayers = new Array();
        }
        Ext.Array.include(this.serverRequestLayers, appLayer);
    },
    /**
     * Do a server request
     */
    doServerRequest: function(map,options){
        if (!this.requestManager || !this.enabled){
            return;
        }
        var radius=this.config.clickRadius*map.getResolution();
        var me=this;
        var currentScale = this.config.viewerController.mapComponent.getMap().getScale();
        var visibleAppLayers = this.config.viewerController.getVisibleAppLayers();
        var inScaleLayers = new Array();
        if (this.serverRequestLayers){
            for (var i=0; i < this.serverRequestLayers.length; i++){
                if (this.config.viewerController.isWithinScale(this.serverRequestLayers[i],currentScale)
                    && visibleAppLayers.hasOwnProperty(this.serverRequestLayers[i].id)) {
                    inScaleLayers.push(this.serverRequestLayers[i]);
                }
            }
        }
        if(inScaleLayers.length === 0) {
            return;
        }
        if(this.config.spinnerWhileIdentify){
            var coords = options.coord;
            var x = coords.x;
            var y = coords.y;
            this.viewerController.mapComponent.getMap().setMarker("edit", x, y, "spinner");
            options.useCursorForWaiting = false;
        }else{
            options.useCursorForWaiting = true;
        }
        this.currentRequestId = Ext.id();

        this.requestManager.request(this.currentRequestId, options, radius, inScaleLayers,  function(data) {
            if(me.config.spinnerWhileIdentify && me.requestManager.requestsFinished(me.currentRequestId)){
                me.viewerController.mapComponent.getMap().removeMarker("edit");
            }
            options.data = data;
            var curExtent = me.config.viewerController.mapComponent.getMap().getExtent();
            if (curExtent.equals(me.requestExtent)){
                for( var i = 0 ; i < data.length ;i++){
                    var data = data[i];
                    if(data.error) {
                        me.config.viewerController.logger.error(data.error);
                        continue;
                    }
                    var layer = me.config.viewerController.getLayer(data.appLayer);
                    layer.fireEvent(viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO_DATA, data.appLayer,data);
                }
            }

            me.onMapData(null, options);
        }, this.onFailure, me, (this.useOrderedAttributes ? { ordered: true } : {}));
    },
    /**
     * Handles when the mapping framework returns with data
     * @param layer the layer
     * @param options the options of the event
     */
    onMapData: function(layer,options){
        var curExtent = this.config.viewerController.mapComponent.getMap().getExtent();
        if (curExtent.equals(this.requestExtent)){
            this.onDataReturned(options);
        }
    },
    /**
     * Handle the data that is returned.
     * @param options options that is given by the event
     */
    onDataReturned: function(options){
        try{
            var browserZoomRatio = this.getBrowserZoomRatio();

            if (browserZoomRatio!=1){
                options.y = Math.round(browserZoomRatio * (options.y));
                options.x = Math.round(browserZoomRatio * options.x);
            }

            //if not enabled: stop
            if (!this.enabled){
                return;
            }
            var data=options.data;
            var components=[];
            if (!data) {
                return;
            }
            
            //if the mouse is in the balloon, stop. Dont show new data.
            if (this.balloon.isMouseOver() &&  options.data[0].requestId !== this.currentRequestId ){
                return;
            }
            //if position is not the last position remove content
            if (this.lastPosition){
                if (this.lastPosition.x !== options.x || this.lastPosition.y !== options.y) {
                    this.balloon.setContent("");
                }
            }else{
                this.lastPosition = new Object();
            }
            this.lastPosition.x = options.x;
            this.lastPosition.y = options.y;
            this.worldPosition = options.coord;
       
            components = this.createInfoHtmlElements(data, options);
            if (!Ext.isEmpty(components)){
                var x= options.x;
                var y= options.y;
                this.balloon.setPosition(x,y,true,browserZoomRatio);
                this.balloon.addElements(components);
                this.balloon.show();
            } else {
                var finished = this.requestManager.requestsFinished(this.currentRequestId);
                if(finished && !this.balloon.hasContent()){
                    this.balloon.setContent("");
                    this.balloon.hide();
                }
            }
        }catch(e){
            this.config.viewerController.logger.error(e);
        }
    },
    /**
     * create info elements for the balloon.
     */
    createInfoHtmlElements: function (data, options){
        var me = this;
        var components=[];
        for (var layerIndex = 0 ; layerIndex < data.length ;layerIndex ++ ){
            var layer=data[layerIndex];
            if (layer.error){
                this.config.viewerController.logger.error(layer.error);
            }else{
                var appLayer =  this.config.viewerController.app.appLayers[layer.request.appLayer];
                var details;
                if (appLayer){
                    details = appLayer.details;
                }else{
                    details = this.config.viewerController.mapComponent.getMap().getLayer(layer.request.appLayer).getDetails();
                }

                var noHtmlEncode = "true" === details['summary.noHtmlEncode'];
                var nl2br = "true" === details['summary.nl2br'];
                //has a details for this layer
                if (details[layer.request.serviceLayer]){
                    details=details[layer.request.serviceLayer];
                }
                var showRightColumn = (details && details["summary.image"]);
                var layerName= layer.request.appLayer;
                for (var index = 0 ; index< layer.features.length ; index ++){
                    var feature = Ext.create("viewer.FeatureInfoWrapper", layer.features[index]);
                    var featureDiv = new Ext.Element(document.createElement("div"));
                    featureDiv.addCls("feature_summary_feature");
                    // Render right column first, floated right, left column fills up the rest
                    if (showRightColumn) {
                        var rightColumnDiv = new Ext.Element(document.createElement("div"));
                        rightColumnDiv.addCls("feature_summary_rightcolumn");
                        var imageDiv = new Ext.Element(document.createElement("div"));
                        imageDiv.addCls("feature_summary_image");
                        imageDiv.insertHtml("beforeEnd","<img src='"+this.replaceByAttributes(details["summary.image"],feature,noHtmlEncode,nl2br)+"'/>", appLayer);
                        rightColumnDiv.appendChild(imageDiv);
                        featureDiv.appendChild(rightColumnDiv);
                    }
                    //left column
                    var leftColumnDiv = new Ext.Element(document.createElement("div"));
                    leftColumnDiv.addCls("feature_summary_leftcolumn");
                    //title
                    if (details && details["summary.title"] ){
                        var titleDiv = new Ext.Element(document.createElement("div"));
                        titleDiv.addCls("feature_summary_title");
                        titleDiv.insertHtml("beforeEnd",this.replaceByAttributes(details["summary.title"],feature,noHtmlEncode,nl2br, appLayer));
                        leftColumnDiv.appendChild(titleDiv);
                    }
                    //description
                    if (details && details["summary.description"]){
                        var descriptionDiv = new Ext.Element(document.createElement("div"));
                        descriptionDiv.addCls("feature_summary_description");
                        if (this.config.heightDescription){
                            descriptionDiv.setHeight(Number(this.config.heightDescription));
                        }
                        var desc = this.replaceByAttributes(details["summary.description"],feature,noHtmlEncode,nl2br, appLayer);
                        descriptionDiv.insertHtml("beforeEnd",desc);
                        if(appLayer.details["summary.retrieveUploads"]){
                            var indexedAttrs= feature.getIndexedAttributes();
                            var uploads = indexedAttrs["__UPLOADS__"];
                            for(var key in uploads){
                                if(uploads.hasOwnProperty(key)){
                                    var files = uploads[key];
                                    for(var i = 0 ; i < files.length ;i++){
                                        var f = files[i];
                                        var uploadDiv = new Ext.Element(document.createElement("div"));
                                        var link = actionBeans["file"] +"?view=true&upload="+ f.id + "&appLayer=" + appLayer.id + "&application=" +FlamingoAppLoader.get("appId");
                                        var linkText;
                                        if(f.mimetype.indexOf("image") !== -1){
                                            linkText = "<img src='"+ link + "'/>";
                                            uploadDiv.addCls("feature_upload_image");
                                        }else{
                                            linkText = f.filename;
                                        }
                                        uploadDiv.insertHtml("beforeEnd","<a href='" + link + "' target='_blank'>"+ linkText +"</a>")
                                        descriptionDiv.appendChild(uploadDiv);
                                    }
                                }
                            }
                        }
                        leftColumnDiv.appendChild(descriptionDiv);
                    }
                    //link
                    if (details && details["summary.link"]){
                        var linkDiv = new Ext.Element(document.createElement("div"));
                        linkDiv.addCls("feature_summary_link");
                        linkDiv.insertHtml("beforeEnd","<a target='_blank' href='"+this.replaceByAttributes(details["summary.link"],feature,noHtmlEncode,nl2br)+"'>link</a>", appLayer);
                        leftColumnDiv.appendChild(linkDiv);
                    }

                    if (this.extraLinkCallbacks && this.extraLinkCallbacks.length > 0) {
                        var extraDiv = new Ext.Element(document.createElement("div"));
                        extraDiv.addCls("feature_callback_link");
                        for (var i = 0; i < this.extraLinkCallbacks.length; i++) {
                            var entry = this.extraLinkCallbacks[i];
                            if (entry.appLayers && !((entry.appLayers).filter(function (l) {
                                return l.id === appLayer.id;
                            })).length > 0) {
                                // console.debug("looking at an unspecified appLayer, skip adding the link");
                                continue;
                            }
                            extraDiv.appendChild(this.createCallbackLink(entry, feature, appLayer, options.coord));
                        }
                        leftColumnDiv.insertFirst(extraDiv);
                    }

                    //detail
                    var detailDiv = new Ext.Element(document.createElement("div"));
                    detailDiv.addCls("feature_summary_detail");
                    //detailDiv.insertHtml("beforeEnd","<a href='javascript: alert(\"boe\")'>Detail</a>");
                    if (this.getMoreLink() !== null){
                        var detailElem=document.createElement("a");
                        detailElem.href='javascript: void(0)';
                        detailElem.feature= feature;
                        detailElem.appLayer=appLayer;
                        var detailLink = new Ext.Element(detailElem);
                        detailLink.addListener("click",
                            function (evt,el,o){
                                me.showDetails(el.appLayer,el.feature);
                            },
                            this);
                        detailLink.insertHtml("beforeEnd",this.getMoreLink());
                        detailDiv.appendChild(detailLink);
                    }
                    leftColumnDiv.appendChild(detailDiv);

                    featureDiv.appendChild(leftColumnDiv);

                    components.push(featureDiv);

                }
                if(layer.moreFeaturesAvailable && this.showMaxFeaturesText){
                    var moreFeatures = new Ext.Element(document.createElement("div"));
                    moreFeatures.addCls("feature_summary_feature");
                    moreFeatures.insertHtml("beforeEnd","Maximum aantal resultaten bereikt. Alleen de eerste 10 worden getoond.");
                    components.push(moreFeatures);
                }
            }
        }
        return components;
    },
    /**
     * Return the browser zoom ratio.
     * @return ratio of zoom (in or out)
     */
    getBrowserZoomRatio: function(){
        return Ext.get(this.config.viewerController.layoutManager.mapId).getWidth() / this.config.viewerController.mapComponent.getWidth();
    },
    /**
     * Handles the show details click.
     * @param appLayer the applayer for the details
     * @param {viewer.FeatureInfoWrapper} feature the feature that must be shown
     */
    showDetails: function(appLayer,feature){
        var cDiv=Ext.get(this.getContentDiv());
        var childs = cDiv.query('*', false);
        var len = childs.length;
        for(var i = len-1; i >= 0; i--) {
            childs[i].destroy();
        }
        cDiv.update("");
        /*
        cDiv.update(html);   */
        var featureDiv = new Ext.Element(document.createElement("div"));
        featureDiv.addCls("feature_detail_feature");
        featureDiv.setStyle("background-color", "white");

        var noHtmlEncode = "true" === appLayer.details['summary.noHtmlEncode'];
        var nl2br = "true" === appLayer.details['summary.nl2br'];

        if (appLayer.details){
            //title
            if (this.config.detailShowTitle && appLayer.details["summary.title"] ){
                var titleDiv = new Ext.Element(document.createElement("div"));
                titleDiv.addCls("feature_detail_title");
                titleDiv.insertHtml("beforeEnd",this.replaceByAttributes(appLayer.details["summary.title"],feature,noHtmlEncode,nl2br,appLayer));
                featureDiv.appendChild(titleDiv);
            }
            //description
            if (this.config.detailShowDesc && appLayer.details["summary.description"]){
                var descriptionDiv = new Ext.Element(document.createElement("div"));
                descriptionDiv.addCls("feature_detail_description");
                descriptionDiv.insertHtml("beforeEnd",this.replaceByAttributes(appLayer.details["summary.description"],feature,noHtmlEncode,nl2br,appLayer));
                featureDiv.appendChild(descriptionDiv);
            }
            //image
            if (this.config.detailShowImage && appLayer.details["summary.image"]){
                var imageDiv = new Ext.Element(document.createElement("div"));
                imageDiv.addCls("feature_detail_image");
                var img = "<img src='"+this.replaceByAttributes(appLayer.details["summary.image"],feature,noHtmlEncode,nl2br,appLayer)+"' ";
                if (this.popup.config.details && this.popup.config.details.width){
                    img+="style='max-width: "+(this.popup.config.details.width-40)+"px;'";
                }
                img+="/>";
                imageDiv.insertHtml("beforeEnd",img);
                featureDiv.appendChild(imageDiv);
            }
            //link
            if (appLayer.details["summary.link"]){
                var linkDiv = new Ext.Element(document.createElement("div"));
                linkDiv.addCls("feature_detail_link");
                linkDiv.insertHtml("beforeEnd","<a target='_blank' href='"+this.replaceByAttributes(appLayer.details["summary.link"],feature,noHtmlEncode,nl2br)+"'>link</a>",appLayer);
                featureDiv.appendChild(linkDiv);
            }
            //description attribute
            if (appLayer.details["summary.description_attributes"]){
                var descriptionDiv = new Ext.Element(document.createElement("div"));
                descriptionDiv.addCls("feature_detail_description_attr");
                descriptionDiv.insertHtml("beforeEnd",this.replaceByAttributes(appLayer.details["summary.description_attributes"],feature,noHtmlEncode,nl2br,appLayer));
                featureDiv.appendChild(descriptionDiv);
            }
        }
        if (this.config.detailShowAttr) {
            //attributes:
            if (!Ext.isEmpty(feature)) {
                // find geometry attributes, a WFS attribute source may provide more than one geometry attribute,
                // and a join may result in more than one as well
                var geomFields = this.config.viewerController.getAppLayerGeometryAttributes(appLayer);
                var filteredAttributes = ["related_featuretypes", "__fid"];
                if (this.detailHideGeomAttr) {
                    filteredAttributes.push(appLayer.geometryAttribute);
                }
                for (var n = 0; n < geomFields.length; n++) {
                    filteredAttributes.push(geomFields[n].name);
                    filteredAttributes.push(geomFields[n].alias);
                }
                var html = "<table>";
                feature.forEachAttribute(function(key, value) {
                    html+="<tr>";
                    html+="<td class='feature_detail_attr_key'>"+key+"</td>";
                    if(!noHtmlEncode) {
                        value = Ext.String.htmlEncode(value);
                    }
                    if(nl2br) {
                        value = Ext.util.Format.nl2br(value);
                    }
                    if(this.config.hasOwnProperty('detailHideNullValues') && this.config.detailHideNullValues && value.toLowerCase() === 'null') {
                        value = "";
                    }
                    html+="<td class='feature_detail_attr_value'>"+value+"</td>";
                    html+="</tr>";
                }, this, filteredAttributes);
                html+="</table>";
                var attributesDiv = new Ext.Element(document.createElement("div"));
                attributesDiv.addCls("feature_detail_attr");
                attributesDiv.insertHtml("beforeEnd",html);
                featureDiv.appendChild(attributesDiv);
            }
        }
        cDiv.appendChild(featureDiv);
        this.popup.show();
    },
    /**
     * Handle failure of ajax requests.
     * @param {String} e The error message
     * @param {Window|viewer.components.Maptip} scope Either this or another object;
     *         commonly 'this' is the global scope ('Window') which is why we make it possible to pass in.
     */
    onFailure: function (e, scope) {
        var me = this;
        if (!me.config) {
            me = scope;
        }
        if (me.config.spinnerWhileIdentify) {
            me.viewerController.mapComponent.getMap().removeMarker("edit");
        }
    },
    /**
     * Event handler for the ON_MAPTIP_CANCEL event
     * @see event ON_MAPTIP_CANCEL
     */
    onMaptipCancel: function (map){
        this.balloon.hideAfterMouseOut();
    },
    /**
     * Replaces all [feature names] with the values of the feature.
     * @param text the text that must be search for 'feature names'
     * @param {viewer.FeatureInfoWrapper} feature a object with object[key]=value
     * @param noHtmlEncode allow HTML tags in feature values
     * @param nl2br Replace newlines in feature values with br tags
     * @param appLayer The appLayer
     * @return a new text with all [key]'s  replaced
     */
    replaceByAttributes: function(text,feature,noHtmlEncode,nl2br,appLayer){
        if (Ext.isEmpty(text))
            return "";
        var attributes = feature.getIndexedAttributes();
        var newText=""+text;
        newText = this.replaceRelatedFeatures(newText, feature, noHtmlEncode, nl2br, appLayer);
        for (var key in attributes){
            if(!attributes.hasOwnProperty(key)) {
                continue;
            }
            var regex = new RegExp("\\["+key+"\\]","g");
            var value = String(attributes[key]);
            if(!noHtmlEncode) {
                value = Ext.String.htmlEncode(value);
            }
            if(nl2br) {
                value = Ext.util.Format.nl2br(value);
            }
            if(this.config.hasOwnProperty('detailHideNullValues') && this.config.detailHideNullValues && value.toLowerCase() === 'null') {
                value = "";
            }
            newText=newText.replace(regex,value);
        }
        //remove all remaining [...]
        var begin=newText.indexOf("[");
        var end=newText.indexOf("]");
        while(begin >=0 && end>0){
            newText=newText.replace(newText.substring(begin,end+1),"");
            begin=newText.indexOf("[");
            end=newText.indexOf("]");
        }
        return newText;
    },
    /**
     * Replaces all [feature names] with the values of the feature.
     * @param text the text that must be search for 'feature names'
     * @param {viewer.FeatureInfoWrapper} feature a object with object[key]=value
     * @param noHtmlEncode allow HTML tags in feature values
     * @param nl2br Replace newlines in feature values with br tags
     * @param appLayer The appLayer
     * @return a new text with all [key]'s  replaced
     */
    replaceRelatedFeatures: function(text,feature, noHtmlEncode, nl2br, appLayer) {
        var firstOccurence = text.indexOf('[begin.');
        if(firstOccurence === -1) {
            return text;
        }
        // First remove everything before first occurence
        var subblock = text.substring(firstOccurence + '[begin.'.length);
        // Find related feature name
        var relatedfeature = subblock.substring(0, subblock.indexOf(']'));
        // Create start and end tag
        var begintag = ['[begin.', relatedfeature, ']'].join('');
        var endtag = ['[end.', relatedfeature, ']'].join('');
        // Get endtag position
        var endtagpos = subblock.indexOf(endtag);
        // If we cannot find endtag, return
        if(endtagpos === -1) {
            return text;
        }
        // Remove begin and end tag to keep repeating block
        // Add to relatedFeatureBlocks object
        var relatedFeatureId = Ext.id();
        this.relatedFeatureBlocks[relatedFeatureId] = {
            block: subblock.substring(relatedfeature.length + 1, endtagpos),
            relatedFeature: this.findRelatedFeature(feature, relatedfeature),
            noHtmlEncode: noHtmlEncode,
            nl2br: nl2br,
            appLayer: appLayer
        };
        // Now replace block in original text by placeholder link
        var placeholderlink = ['<a href="#" class="load-releated-features x-tool-img x-tool-plus" data-relatedfeatureid="', relatedFeatureId, '">+</a>'].join('');
        var newText = [text.substring(0, text.indexOf(begintag)), placeholderlink, text.substring(text.indexOf(endtag) + endtag.length)].join('');
        // Recursive call because there can be more related blocks
        return this.replaceRelatedFeatures(newText, feature, noHtmlEncode, nl2br, appLayer);
    },
    findRelatedFeature: function(feature, name) {
        var related_featuretypes = feature.getRelatedFeatureTypes();
        if(!related_featuretypes) {
            return null;
        }
        for(var i = 0; i < related_featuretypes.length; i++) {
            if(related_featuretypes[i].foreignFeatureTypeName === name) {
                return related_featuretypes[i];
            }
        }
        return null;
    },
    relatedFeaturesListener: function(e) {
        if(e.target && e.target.className && e.target.className.indexOf && e.target.className.indexOf('load-releated-features') !== -1) {
            this.requestRelatedFeatureInfo(e.target);
            return false;
        }
        return true;
    },
    requestRelatedFeatureInfo: function(placeholder) {
        var relatedFeatureId = placeholder.getAttribute('data-relatedfeatureid');
        if(!this.relatedFeatureBlocks.hasOwnProperty(relatedFeatureId) || this.relatedFeatureBlocks[relatedFeatureId].relatedFeature === null) {
            placeholder.style.display = 'none';
            return;
        }
        var relatedFeatureBlock = this.relatedFeatureBlocks[relatedFeatureId];
        this.requestManager.featureInfo.relatedFeatureInfo(relatedFeatureBlock.appLayer, relatedFeatureBlock.relatedFeature, function(featureinfo) {
            var messageContainer = placeholder.parentNode.querySelector('.message-container');
            if(!messageContainer) {
                messageContainer = document.createElement('div');
                messageContainer.className = "message-container";
                placeholder.parentNode.insertBefore(messageContainer, placeholder);
            }
            messageContainer.innerHTML = "";
            messageContainer.style.display = 'none';
            if(!featureinfo.success) {
                messageContainer.style.display = 'block';
                messageContainer.innerHTML = "Er is iets mis gegaan met het ophalen van object informatie. Probeer het opnieuw";
            } else if(featureinfo.total === 0) {
                messageContainer.style.display = 'block';
                messageContainer.innerHTML = "Voor dit object is deze informatie niet beschikbaar.";
                placeholder.style.display = 'none';
            } else if(featureinfo.total > 0) {
                this.replaceRelatedFeature(featureinfo, relatedFeatureBlock, placeholder);
            }
        }.bind(this));
    },
    replaceRelatedFeature: function(featureinfo, relatedFeatureBlock, placeholder) {
        var parsedHtml = [];
        var text = relatedFeatureBlock.block;
        var relatedFeatureName = relatedFeatureBlock.relatedFeature.foreignFeatureTypeName;
        var replaceResult = this.splitByTag(text, '[begin.repeat.' + relatedFeatureName + ']', '[end.repeat.' + relatedFeatureName + ']');
        var repeatingText = replaceResult.blockText;
        if(repeatingText === '') {
            repeatingText = text;
        }
        parsedHtml.push(replaceResult.textBefore);
        for(var i = 0; i < featureinfo.features.length; i++) {
            parsedHtml.push(this.replaceByAttributes(
                repeatingText,
                Ext.create("viewer.FeatureInfoWrapper", featureinfo.features[i]),
                relatedFeatureBlock.noHtmlEncode,
                relatedFeatureBlock.nl2br,
                relatedFeatureBlock.appLayer
            ));
        }
        parsedHtml.push(replaceResult.textAfter);
        var parsedHtmlContainer = document.createElement('div');
        parsedHtmlContainer.innerHTML = parsedHtml.join('');
        placeholder.parentNode.insertBefore(parsedHtmlContainer, placeholder);
        placeholder.style.display = 'none';
    },
    
    splitByTag: function(text, begintag, endtag) {
        if(text.indexOf(begintag) === -1 || text.indexOf(endtag) === -1) {
            return { blockText: '', textBefore: '', textAfter: '' };
        }
        return {
            blockText: text.substring(text.indexOf(begintag) + begintag.length, text.indexOf(endtag)),
            textBefore: text.substring(0, text.indexOf(begintag)),
            textAfter: text.substring(text.indexOf(endtag) + endtag.length)
        };
    },
    /**
     * Checks if a layer is enabled for this component.
     * If no layers are configured then true is returned
     * Otherwise the appLayerId is checked of the given mapLayer in the list
     * of configured layers.
     */
    isLayerConfigured: function (mapLayer){
        //if there are layers configured, check if the added layer is in the configured list.
        if (this.config.layers && this.config.layers.length >0){
            for (var i in this.config.layers){
                if(!this.config.layers.hasOwnProperty(i)) {
                    continue;
                }
                if (this.config.layers[i] === mapLayer.appLayerId){
                    return true;
                }
            }
            return false;
        }
        return true;
    },
    /**
     * Over write the getMoreLink function so it always returns a String even when empty
     * @return the configured 'moreLink' or the default when not configured.
     */
    getMoreLink: function(){
        if (Ext.isEmpty(this.config.moreLink)){
            return null;
        }
        return this.config.moreLink;
    },
    /**
     *Get the application layer
     *@param layername the name of the layer
     *@param serviceId the id of the service
     *@return the application layer JSON object.
     */
    getApplicationLayer: function (layerName,serviceId){
        var appLayers=this.config.viewerController.app.appLayers;
        for (var id in appLayers){
            if(!appLayers.hasOwnProperty(id)) {
                continue;
            }
            if (appLayers[id].serviceId === serviceId &&
                appLayers[id].layerName === layerName){
                return appLayers[id];
            }
        }
        return null;
    },

    /**
     */
    setRequestExtent: function (requestExtent){
        this.requestExtent=requestExtent;
    },
    /**
     * set visibility
     * @param vis true or false
     */
    setVisible: function(vis){
        if(this.balloon === null){
            return;
        }
        if(!vis){
            this.balloon.hide();
        }else{
            this.balloon.show();
        }
    },
    /**
     * set enabled
     * @param enabled true/false
     */
    setEnabled: function(enabled){
        this.enabled = enabled;
        if (!this.enabled){
            this.setVisible(false);
        }
    },
    getExtComponents: function() {
        return [];
    },
    createCallbackLink: function (entry, feature, appLayer, coords) {
        var me = this;
        var callbackLink = document.createElement("a");
        callbackLink.href = '#callback-' + (entry.label).replace(' ', '');
        callbackLink.innerHTML = entry.label;
        callbackLink.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            if(me.balloon) {
                me.balloon.close();
            }
            entry.callback.call(entry.component, feature, appLayer, coords);
        });
        return callbackLink;
    },
    /**
     * Register the calling component for doing something extra called by a link.
     * @param component The object of the component ("this" at the calling method)
     * @param callback The callbackfunction which must be called from the click
     * @param label The label for the hyperlink
     * @param appLayers The appLayers this should apply to, when null the callback will apply to any appLayer
     */
    registerExtraLink: function (component, callback, label, appLayers) {
        var entry = {
            component: component,
            callback: callback,
            label: label,
            appLayers: appLayers
        };
        this.extraLinkCallbacks.push(entry);
    },
    /**
     * Unregister the given component for extra link on the balloon.
     * @param {type} component The component for which the callback must be removed.
     * @returns {undefined}
     */
    unregisterExtraLink: function (component) {
        for (var i = this.extraLinkCallbacks.length - 1; i >= 0; i--) {
            if (this.extraLinkCallbacks[i].component.name === component.name) {
                this.extraLinkCallbacks.splice(i, 1);
            }
        }
    }
});

/** Creates a balloon.
 *TODO: Place in own file so it can be used by other components and make it a ext class
 * @param mapDiv The div element where the map is in.
 * @param viewerController the viewerController that controlles the map
 * @param balloonId the id of the DOM element that represents the balloon.
 * @param balloonWidth the width of the balloon (optional, default: 300);
 * @param balloonHeight the height of the balloon (optional, default: 300);
 * @param offsetX the offset x
 * @param offsetY the offset y
 * @param balloonCornerSize the size of the rounded balloon corners of the round.png image(optional, default: 20);
 * @param balloonArrowHeight the hight of the arrowImage (optional, default: 40);
 */
function Balloon(mapDiv,viewerController,balloonId, balloonWidth, balloonHeight, offsetX,offsetY, balloonCornerSize, balloonArrowHeight){
    this.mapDiv=Ext.get(mapDiv);
    this.viewerController=viewerController;
    this.balloonId=balloonId;
    this.balloonWidth=300;
    this.balloonHeight=300;
    this.balloonCornerSize=20;
    this.balloonArrowHeight = 20;
    this.balloonContentWrapper = null;
    this.balloonContent=null;
    this.mouseIsOverElement=new Object();
    this.maptipId=0;
    this.closeOnMouseOut=true;
    this.showCloseButton=false;
    this.zIndex = 13000;
    this.balloonTitleContent = "";
    this.balloonTitle = null;
    //because click events still needs to be handled by the map, move the balloon a bit
    this.offsetX=1;
    this.offsetY=0;
    this.roundImgPath=FlamingoAppLoader.get('contextPath')+"/viewer-html/components/resources/images/maptip/round.png";
    this.arrowImgPath=FlamingoAppLoader.get('contextPath')+"/viewer-html/components/resources/images/maptip/arrow.png";

    //the balloon jquery dom element.
    this.balloon=null;
    this.x=null;
    this.y=null;

    if (balloonWidth){
        this.balloonWidth=balloonWidth;
    }
    if (balloonHeight)
        this.balloonHeight=balloonHeight;
    if (balloonCornerSize){
        this.balloonCornerSize=balloonCornerSize;
    }
    if (balloonArrowHeight){
        this.balloonArrowHeight=balloonArrowHeight;
    }
    if (offsetX){
        this.offsetX=offsetX;
    }
    if (offsetY){
        this.offsetY=offsetY;
    }
    /**
     *Private function. Don't use.
     */
    this._createBalloon = function(x,y){
        //create balloon and styling.
        this.balloon=new Ext.Element(document.createElement("div"));
        this.balloon.addCls("infoBalloon");
        this.balloon.id = this.balloonId;

        this.balloon.applyStyles({
            'position': 'absolute',
            'width':""+this.balloonWidth+"px",
            'height':""+this.balloonHeight+"px",
            'z-index':this.zIndex
        });

        //arrows
        this.balloon.insertHtml("beforeEnd","<div class='balloonArrow balloonArrowTopLeft' style='display: none; width:"+this.balloonArrowHeight+"px; height:"+this.balloonArrowHeight+"px; z-index:"+(this.zIndex+2)+";'><img src='"+this.arrowImgPath+"'/></div>");
        this.balloon.insertHtml("beforeEnd","<div class='balloonArrow balloonArrowTopRight' style='display: none; width:"+this.balloonArrowHeight+"px; height:"+this.balloonArrowHeight+"px; z-index:"+(this.zIndex+2)+";'><img style='left: -"+this.balloonArrowHeight+"px;' src='"+this.arrowImgPath+"'/></div>");
        this.balloon.insertHtml("beforeEnd","<div class='balloonArrow balloonArrowBottomLeft' style='display: none; width:"+this.balloonArrowHeight+"px; height:"+this.balloonArrowHeight+"px; z-index:"+(this.zIndex+2)+";'><img style='left: -"+(2*this.balloonArrowHeight)+"px;' src='"+this.arrowImgPath+"'/></div>");
        this.balloon.insertHtml("beforeEnd","<div class='balloonArrow balloonArrowBottomRight' style='display: none; width:"+this.balloonArrowHeight+"px; height:"+this.balloonArrowHeight+"px; z-index:"+(this.zIndex+2)+";'><img style='left: -"+(3*this.balloonArrowHeight)+"px;' src='"+this.arrowImgPath+"'/></div>");

        //content
        var balloonContentEl = document.createElement("div");
        //balloonContentEl.innerHTML=
        this.balloonContent= new Ext.Element(balloonContentEl);
        this.balloonContent.addCls('balloonContent');
        this.balloonContent.applyStyles({
            top: this.balloonArrowHeight-1+"px",
            bottom: this.balloonArrowHeight-1+"px",
            'z-index': this.zIndex+1
        });
        this.balloonContent.on("mouseover",function(){
            this.onMouseOver('balloonContent');
        },this);
        this.balloonContent.on("mouseout",function(){
            this.onMouseOut('balloonContent');
        }, this);
        this.balloonContentWrapper = new Ext.Element(document.createElement("div"));
        this.balloonContentWrapper.addCls('balloonContentWrapper');
        this.balloonContent.appendChild(this.balloonContentWrapper);
        this.balloon.appendChild(this.balloonContent);

        this.x=x;
        this.y=y;

        //calculate position
        this._resetPositionOfBalloon(x,y);

        //append the balloon.
        Ext.get(this.mapDiv).appendChild(this.balloon);
    };

    /**
     * Adds the close and minimize buttons to the balloon
     */
    this._appendButtons = function() {
        if(!this.showCloseButton || this.balloonContent.query('.balloonButton').length === 2){
            return;
        }
        var thisObj = this;
        var closeButton = new Ext.Element(document.createElement("div"));
        closeButton.addCls("x-tool-img x-tool-close balloonButton");
        closeButton.applyStyles({
            'z-index': this.zIndex+3
        });
        closeButton.addListener("click",function(){
            thisObj.close();
        });
        this.balloonContent.appendChild(closeButton);

        var minMaximizeButton = new Ext.Element(document.createElement("div"));
        minMaximizeButton.addCls("x-tool-img x-tool-minimize balloonButton");
        minMaximizeButton.applyStyles({
            'z-index': this.zIndex+3
        });
        minMaximizeButton.addListener("click",function(){
            thisObj.minMaximize();
            if(minMaximizeButton.hasCls('x-tool-minimize')) {
                minMaximizeButton.removeCls('x-tool-minimize').addCls('x-tool-maximize');
            } else {
                minMaximizeButton.addCls('x-tool-minimize').removeCls('x-tool-maximize');
            }
        });
        this.balloonContent.appendChild(minMaximizeButton);
    };

    this.setTitle = function(title) {
        this.balloonTitleContent = title;
        this._appendTitle();
    };

    this._appendTitle = function() {
        if(!this.balloonContent) {
            return;
        }
        if(!this.balloonTitle) {
            this.balloonTitle = new Ext.Element(document.createElement("div"));
            this.balloonTitle.addCls("balloon-title");
            this.balloonContent.appendChild(this.balloonTitle);
        }
        this.balloonTitle.update(this.balloonTitleContent);
    };

    /**
     *Private function. Use setPosition(x,y,true) to reset the position
     *Reset the position to the point. And displays the right Arrow to the point
     *Sets the this.leftOfPoint and this.topOfPoint
     *@param x the x coord
     *@param y the y coord
     */
    this._resetPositionOfBalloon = function(x,y){
        var centerX = this.mapDiv.getWidth()/2;
        var centerY = this.mapDiv.getHeight()/2;
        //determine the left and top.
        if (x > centerX){
            this.leftOfPoint=true;
        }else{
            this.leftOfPoint=false;
        }
        if (y > centerY){
            this.topOfPoint=true;
        }else{
            this.topOfPoint=false;
        }
        //display the right arrow
        this.balloon.select(".balloonArrow").applyStyles({'display':'none'}).removeCls('arrowVisible');
        //$j("#infoBalloon > .balloonArrow").css('display', 'block');
        if (!this.leftOfPoint && !this.topOfPoint){
            //popup is bottom right of the point
            this.balloon.select(".balloonArrowTopLeft").applyStyles({"display":"block"}).addCls('arrowVisible');
        }else if (this.leftOfPoint && !this.topOfPoint){
            //popup is bottom left of the point
            this.balloon.select(".balloonArrowTopRight").applyStyles({"display":"block"}).addCls('arrowVisible');
        }else if (this.leftOfPoint && this.topOfPoint){
            //popup is top left of the point
            this.balloon.select(".balloonArrowBottomRight").applyStyles({"display":"block"}).addCls('arrowVisible');
        }else{
            //pop up is top right of the point
            this.balloon.select(".balloonArrowBottomLeft").applyStyles({"display":"block"}).addCls('arrowVisible');
        }

        // Update z-indexes
        this.balloon.applyStyles({
            'z-index': this.zIndex
        });
        this.balloon.select(".balloonArrowTopLeft").applyStyles({"z-index": this.zIndex+2});
        this.balloon.select(".balloonArrowTopRight").applyStyles({"z-index": this.zIndex+2});
        this.balloon.select(".balloonArrowBottomRight").applyStyles({"z-index": this.zIndex+2});
        this.balloon.select(".balloonArrowBottomLeft").applyStyles({"z-index": this.zIndex+2});
    };
    /**
     *called by internal elements if the mouse is moved in 1 of the maptip element
     *@param the id of the element.
     */
    this.onMouseOver= function(elementId){
        this.mouseIsOverElement[elementId]=1;
    };
    /**
     *called by internal elements when the mouse is out 1 of the maptip element
     *@param the id of the element.
     */
    this.onMouseOut= function(elementId){
        this.mouseIsOverElement[elementId]=0;
        if (this.closeOnMouseOut){
            var thisObj=this;
            setTimeout(function(){
                if (!thisObj.isMouseOver()){
                    thisObj.hide();
                }
            },50);
        }

    };
    
    this.isMouseOver = function(){
        for (var elementid in this.mouseIsOverElement){
            if(this.mouseIsOverElement[elementid] === 1){
                return true;
            }
        }
        return false;
    };

    /**
     *Set the position of this balloon. Create it if not exists
     *@param x pixel x
     *@param y pixel y
     *@param resetPositionOfBalloon boolean if true the balloon arrow will be
     *@param browserZoomRatio if the browser is zoomed.
     *redrawn (this.resetPositionOfBalloon is called)
     */
    this.setPosition = function (x,y,resetPositionOfBalloon,browserZoomRatio){
        //new maptip position so update the maptipId
        this.maptipId++;

        var updatedZIndex = this.zIndex;
        try {
            Ext.WindowManager.eachTopDown(function(comp){
                var zIndex = comp.getEl().getZIndex();
                if(zIndex > updatedZIndex) {
                    updatedZIndex = zIndex;
                }
            });
        } catch(e) {}
        if(updatedZIndex) {
            this.zIndex = updatedZIndex + 1;
        }
        if (!this.balloon){
            this._createBalloon(x,y);
        }else if(resetPositionOfBalloon){
            this._resetPositionOfBalloon(x,y);
        }
        this._appendButtons();
        this._appendTitle();
        this.maximize();
        if (x && y ){

            this.x=x;
            this.y=y;
            if (browserZoomRatio !== undefined && browserZoomRatio !== null && browserZoomRatio !== 1){
                this.x = this.x*browserZoomRatio;
                this.y = this.y*browserZoomRatio;
            }
        }else if (!this.x|| !this.y){
            throw "No coords found for this balloon";
        }else{
            x=this.x;
            y=this.y;
        }
        this.balloon.applyStyles({'display':'block'});


        //calculate position

        //determine the left and top.
        var correctedOffsetX=this.offsetX;
        var correctedOffsetY=this.offsetY;
        var left=x+correctedOffsetX;
        var top =y+correctedOffsetY;
        if (this.leftOfPoint){
            left=left-this.balloonWidth;
        }
        if (this.topOfPoint){
            top= top-this.balloonHeight;
        }
       //set position of balloon
        this.balloon.setLeft(""+left+"px");
        this.balloon.setTop(""+top+"px");
    };
    
    /**
     *Set the position of this balloon. Create it if not exists
     *@param xcoord The world x coord
     *@param ycoord the world y coord
     *@param resetPositionOfBalloon boolean if true the balloon arrow will be
     *redrawn (this.resetPositionOfBalloon is called)
     *@param browserZoomRatio the ratio the browser is zoomed (in or out)
     */
    this.setPositionWorldCoords = function (xcoord,ycoord,resetPositionOfBalloon, browserZoomRatio){
        var pixel= this.viewerController.getMap().coordinateToPixel(xcoord,ycoord);
        this.setPosition(pixel.x, pixel.y, resetPositionOfBalloon,browserZoomRatio);
    };
    
    /**
     * xxx not working! Make it work!
     * Remove the balloon
     **/
    this.remove = function(){
        this.balloon.remove();
        this.viewerController.getMap().removeListener(viewer.viewercontroller.controller.Event.ON_FINISHED_CHANGE_EXTENT,viewerController.getMap(), this.setPosition,this);
        delete this.balloon;
    };
    
    /*Get the DOM element where the content can be placed.*/
    this.getContentElement = function () {
        if (this.balloon === undefined || this.balloonContent === undefined || this.balloonContentWrapper === null)
            return null;
        return this.balloonContentWrapper;
    };
    
    this.setContent = function (value){
        var element=this.getContentElement();
        if (!element){
            return;
        }
        var childs = element.query('*', false);
        var len = childs.length;
        for(var i = len-1; i >= 0; i--) {
            childs[i].destroy();
        }
        element.update(value);
    };

    this.addContent = function (value){
        var element=this.getContentElement();
        if (!element){
            return;
        }
        element.insertHtml("beforeEnd", value);
    };
    
    this.addElements = function (elements){
        var element=this.getContentElement();
        if (!element){
            return;
        }
        for (var i=0; i < elements.length; i++){
            element.appendChild(elements[i]);
        }
    };
    
    this.hide = function(){
        this.mouseIsOverElement = {};
        if (this.balloon)
            this.balloon.setVisible(false);
    };
    
    this.show = function(){
        if (this.balloon) {
            this.balloon.setVisible(true);
        }
    };
    
    this.maximize = function() {
        this.balloon.removeCls('minimized');
    };
    
    this.minMaximize = function() {
        var minimize = true;
        if(this.balloon.hasCls('minimized')) {
            this.balloon.removeCls('minimized');
            minimize = false;
        } else {
            this.balloon.addCls('minimized');
            
        }
    };
    
    this.close = function(){
        this.setContent("");
        this.hide();
    };
    
    this.hideAfterMouseOut= function(){
        var thisObj = this;
        //store the number to check later if it's still the same maptip position
        var newId= new Number(this.maptipId);
        setTimeout(function(){
            if (newId === thisObj.maptipId){
                if (!thisObj.isMouseOver()){
                    thisObj.setContent("");
                    thisObj.hide();
                }
            }else{
            }
        },1000);
    };

    this.hasContent = function(){
        var content = this.getContentElement();
        return content && content.el.dom.childNodes.length > 0;
    };
}

