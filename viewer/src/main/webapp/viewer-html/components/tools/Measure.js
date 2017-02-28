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
        conf.frameworkOptions = {
            persist: true,
            callbacks: {
                modify: function (evt){
                    //make a tooltip with the measured length
                    if (evt.parent){
                        var measureValueDiv = document.getElementById("olControlMeasureValue");
                        if (measureValueDiv === null){
                            measureValueDiv = document.createElement('div');
                            measureValueDiv.id = "olControlMeasureValue";
                            measureValueDiv.style.position = 'absolute';
                            this.map.div.appendChild(measureValueDiv);
                            measureValueDiv.style.zIndex = "10000";
                            measureValueDiv.className = "olControlMaptip";
                            var measureValueText = document.createElement('div');
                            measureValueText.id = 'olControlMeasureValueText';
                            measureValueDiv.appendChild(measureValueText);
                        }
                        var px= this.map.getViewPortPxFromLonLat(new OpenLayers.LonLat(evt.x,evt.y));
                        measureValueDiv.style.top = px.y + "px";
                        measureValueDiv.style.left = px.x + 10 + 'px';
                        measureValueDiv.style.display = "block";
                        var measureValueText = document.getElementById('olControlMeasureValueText');
                        var decimals = conf.decimals || 3;
                        var decimalSeparator = conf.decimalSeparator || ",";
                        var measure;
                        var units;
                        
                        /** 
                         * Overrides OpenLayers getBestLength to also account for negative values
                         */
                        function getBestLength(geometry) {
                            var units = this.displaySystemUnits[this.displaySystem];
                            var unit, length;
                            for(var i=0, len=units.length; i<len; ++i) {
                                unit = units[i];
                                length = this.getLength(geometry, unit);
                                if(length > 1 || length < -1) {
                                    break;
                                }
                            }
                            return [length, unit];
                        }

                        /** 
                         * Overrides OpenLayers getBestLength to also account for negative values
                         */
                        function getBestArea(geometry) {
                            var units = this.displaySystemUnits[this.displaySystem];
                            var unit, area;
                            for(var i=0, len=units.length; i<len; ++i) {
                                unit = units[i];
                                area = this.getArea(geometry, unit);
                                if(area > 1 || area < -1) {
                                    break;
                                }
                            }
                            return [area, unit];
                        }
                        
                        function getBestMeasure() {
                            // Call overriden function
                            var bestMeasure = getBestLength.call(this, evt.parent);
                            if(conf.type === viewer.viewercontroller.controller.Tool.MEASUREAREA){
                                bestMeasure = getBestArea.call(this, evt.parent);
                                if(bestMeasure[0] < 0){
                                    bestMeasure[0] *= -1;
                                }
                                bestMeasure[1] += "<sup>2</" + "sup>";
                            }
                            return {
                                measure: bestMeasure[0],
                                units: bestMeasure[1]
                            };
                        }
                        
                        if(conf.magicnumber && conf.units) {
                            // Add custom unit, based on km2
                            var olUnit = conf.units.replace(/\W/g, '');
                            if(!OpenLayers.INCHES_PER_UNIT.hasOwnProperty(olUnit)) {
                                OpenLayers.INCHES_PER_UNIT[olUnit] = OpenLayers.INCHES_PER_UNIT.km / (conf.magicnumber / 10);
                            }
                            measure = (conf.type === viewer.viewercontroller.controller.Tool.MEASUREAREA ? this.getArea(evt.parent, olUnit) : this.getLength(evt.parent, olUnit));
                            if(conf.type === viewer.viewercontroller.controller.Tool.MEASUREAREA && measure < 0) {
                                measure *= -1;
                            }
                            units = conf.units;
                            if(conf.addUnit) {
                                var bestMeasure = getBestMeasure.call(this);
                                measureValueText.innerHTML = "" +
                                        ("" + bestMeasure.measure.toFixed(decimals)).replace('.', decimalSeparator) + " " + bestMeasure.units + " - " +
                                        ("" + measure.toFixed(decimals)).replace('.', decimalSeparator) + " " + units;
                                return;
                            }
                        } else {
                            var bestMeasure = getBestMeasure.call(this);
                            measure = bestMeasure.measure;
                            units = bestMeasure.units;
                        }
                        measureValueText.innerHTML= ("" + measure.toFixed(decimals)).replace('.', decimalSeparator) + " " + units;
                    }
                }
            }
        };
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
        
        function removeMeasure() {
            var measureValueDiv = document.getElementById("olControlMeasureValue");
            if (measureValueDiv) {
                measureValueDiv.style.display="none";
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
            removeMeasure();
            removeClone();
        });
    }
});

Ext.define ("viewer.components.tools.Measure.Line",{
    extend: "viewer.components.tools.Measure",
    config:{
        name: "measureline",
        tooltip: "Measure"
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
        tooltip: "Measure area"
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