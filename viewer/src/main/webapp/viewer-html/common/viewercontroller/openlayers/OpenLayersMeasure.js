/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


Ext.define ("viewer.viewercontroller.openlayers.OpenLayersMeasure",{
    config: {},
    constructor: function (conf) {
        this.initConfig(conf);
        //viewer.components.tools.Measure.superclass.constructor.call(this, this.config);
        if( viewer.viewercontroller.openlayers &&
            viewer.viewercontroller.openlayers.tools &&
            viewer.viewercontroller.openlayers.tools.OpenLayersMeasureHandler) {
            conf.frameworkOptions = {
                persist: true,
                callbacks: {
                    modify: function (evt){
                        viewer.viewercontroller.openlayers.tools.OpenLayersMeasureHandler.modifyHandler(this, conf, evt);
                    }
                }
            };
        }
    },
    initEvents: function(tool) {
        var config = this.config;
        var frameworkTool = tool;

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