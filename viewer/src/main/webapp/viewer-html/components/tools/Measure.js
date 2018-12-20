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
/* global Ext, i18next */

/**
 * Measure Tool component
 * Creates a MapComponent Tool with the given configuration by calling createTool 
 * of the MapComponent
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */

Ext.define ("viewer.components.tools.Measure",{
    extend: "viewer.components.tools.Tool",
    config: {},
    constructor: function (conf) {
        this.initConfig(conf);
        viewer.components.tools.Measure.superclass.constructor.call(this, this.config);
        if( viewer.viewercontroller.openlayers &&
            viewer.viewercontroller.openlayers.tools &&
            viewer.viewercontroller.openlayers.tools.OpenLayersMeasureHandler) {
            conf.frameworkOptions = {
                persist: true,
                callbacks: {
                    modify: function (vertex, feature){
                        viewer.viewercontroller.openlayers.tools.OpenLayersMeasureHandler.modifyHandler(this, conf, vertex);
                        if(this.handler.layer){
                            this.handler.layer.events.triggerEvent("sketchmodified", {vertex: vertex, feature: feature});
                        }
                    }
                }
            };
        }
    },
    initEvents: function() {
        var config = this.config;
        var frameworkTool = this.tool.getFrameworkTool();

        function removeClone() {
            var clonedValueDiv = document.getElementById("olControlMeasureValueClone");
            if(clonedValueDiv && clonedValueDiv.parentNode) {
                clonedValueDiv.parentNode.removeChild(clonedValueDiv);
            }
        }

        function createMeasureClone() {
            var measureValueDiv = document.getElementById("olControlMeasureValue");
            if(!measureValueDiv) {
                return;
            }
            removeClone();
            var clonedValueDiv = measureValueDiv.cloneNode(true);
            clonedValueDiv.id = 'olControlMeasureValueClone';
            clonedValueDiv.className += ' olControlMeasureValueClone';
            clonedValueDiv.querySelector('#olControlMeasureValueText').id = 'olControlMeasureValueTextClone';
            return clonedValueDiv;
        }

        frameworkTool.events.register('measure', frameworkTool, function() {
           this.map.div.appendChild(createMeasureClone());
            if(config.nonSticky){
                config.viewerController.mapComponent.activateTool(null, true);
            }
        });
        frameworkTool.events.register('measurepartial', frameworkTool, function(){
            removeClone();
        });
        frameworkTool.events.register('deactivate', frameworkTool, function(){
            if( viewer.viewercontroller.openlayers &&
                viewer.viewercontroller.openlayers.tools &&
                viewer.viewercontroller.openlayers.tools.OpenLayersMeasureHandler) {
                viewer.viewercontroller.openlayers.tools.OpenLayersMeasureHandler.removeMeasure();
            }
            removeClone();
        });
    }
});

Ext.define ("viewer.components.tools.Measure.Line",{
    extend: "viewer.components.tools.Measure",
    config:{
        name: "measureline",
        tooltip: i18next.t('viewer_components_tools_measure_0'),
        preventActivationAsFirstTool: true
    },
    constructor: function (conf){
        this.initConfig(conf);
        viewer.components.tools.Measure.Line.superclass.constructor.call(this, this.config);
        this.config.type = viewer.viewercontroller.controller.Tool.MEASURELINE;
        this.initTool(this.config);
        this.initEvents();
        return this;
    }
});
Ext.define ("viewer.components.tools.Measure.Area",{
    extend: "viewer.components.tools.Measure",
    config:{
        name: "measurearea",
        tooltip: i18next.t('viewer_components_tools_measure_1'),
        preventActivationAsFirstTool: true
    },
    constructor: function (conf){
        this.initConfig(conf);
        viewer.components.tools.Measure.Area.superclass.constructor.call(this, this.config);
        this.config.type = viewer.viewercontroller.controller.Tool.MEASUREAREA;
        this.initTool(this.config);
        this.initEvents();
        return this;
    }
});