/* 
 * Copyright (C) 2019 3Partners B.V.
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
/* global Ext, contextPath, actionBeans, FlamingoAppLoader */
/**.
 * Highlight component
 * This component adds the functionality of highlighting a feature.
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define("viewer.components.Highlight", {
    extend: "viewer.components.Component",
    vectorLayer: null,
    config: {
        title: "",
        iconUrl: "",
        tooltip: "",
        layers: null
    },
    constructor: function (conf) {
        this.initConfig(conf);
        viewer.components.Highlight.superclass.constructor.call(this, this.config);
        this.config.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_FEATURE_HIGHLIGHTED, this.highlightFeature, this);
        this.config.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_LAYERS_INITIALIZED,this.createVectorLayer, this);
        return this;
    },
    createVectorLayer: function(){
        this.vectorLayer = this.config.viewerController.mapComponent.createVectorLayer({
            name: this.name + 'VectorLayer',
            geometrytypes: ["Circle", "Polygon", "MultiPolygon", "Point", "LineString"],
            mustCreateVertices: false,
            allowselection: false,                   
            showmeasures: false,
            editable: false,     
            viewerController: this.config.viewerController,
            style: {
                fillcolor: "FF0000",
                fillopacity: 50,
                strokecolor: "0000FF",
                strokewidth: 4,
                strokeopacity: 100
            }
        });
        this.config.viewerController.registerSnappingLayer(this.vectorLayer);
        this.config.viewerController.mapComponent.getMap().addLayer(this.vectorLayer);
    },
    highlightFeature: function (featureId, appLayer, sft, searchconfig) {
        var options = {
            application: FlamingoAppLoader.get("appId"),
            featureId: featureId
        };
        if(appLayer){
            options.appLayer = appLayer.id;
        }
        if(sft){
            options.sft = sft;
            options.solrconfig = searchconfig;
        }
        Ext.Ajax.request({
            url: actionBeans.simplify,
            params: options,
            scope: this,
            success: function (result) {
                var response = Ext.JSON.decode(result.responseText);
                if(response.success){
                    this.processFeature(response);
                }
            },
            failure: function (result) {
                this.config.viewerController.logger.error(result);
            }
        });
    },
    processFeature: function (feature) {
        this.vectorLayer.removeAllFeatures();
        var f = Ext.create(viewer.viewercontroller.controller.Feature, {
            wktgeom: feature.geom
        });
        this.vectorLayer.addFeature(f);
    },
    getExtComponents: function () {
        return [this.maincontainer.getId()];
    }
});
