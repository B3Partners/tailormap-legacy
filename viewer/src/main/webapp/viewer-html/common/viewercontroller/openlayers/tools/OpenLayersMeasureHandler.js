/*
 * Copyright (C) 2012-2017 B3Partners B.V.
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
Ext.define("viewer.viewercontroller.openlayers.tools.OpenLayersMeasureHandler", {
    statics: {
        modifyHandler: function(measureTool, conf, evt){
            //make a tooltip with the measured length
            var divId = (conf.containerPrefix ? conf.containerPrefix : '') + 'olControlMeasureValue';
            if (evt.parent){
                var measureValueDiv = document.getElementById(divId);
                if (measureValueDiv === null){
                    measureValueDiv = document.createElement('div');
                    measureValueDiv.id = divId;
                    measureValueDiv.style.position = 'absolute';
                    measureTool.map.div.appendChild(measureValueDiv);
                    measureValueDiv.style.zIndex = "10000";
                    measureValueDiv.className = "olControlMaptip";
                    var measureValueText = document.createElement('div');
                    measureValueText.id = divId + 'Text';
                    measureValueDiv.appendChild(measureValueText);
                }
                var px= measureTool.map.getViewPortPxFromLonLat(new OpenLayers.LonLat(evt.x,evt.y));
                measureValueDiv.style.top = px.y + "px";
                measureValueDiv.style.left = px.x + 30 + 'px';
                measureValueDiv.style.display = "block";
                var measureValueText = document.getElementById(divId + 'Text');
                var decimals = conf.decimals || 3;
                var decimalSeparator = conf.decimalSeparator || ",";
                var measure;
                var units;
                if(conf.magicnumber && conf.units) {
                    // Add custom unit, based on km2
                    var olUnit = conf.units.replace(/\W/g, '');
                    if(!OpenLayers.INCHES_PER_UNIT.hasOwnProperty(olUnit)) {
                        OpenLayers.INCHES_PER_UNIT[olUnit] = OpenLayers.INCHES_PER_UNIT.km / (conf.magicnumber / 10);
                    }
                    measure = (measureTool.handler.CLASS_NAME === 'OpenLayers.Handler.Polygon' ? measureTool.getArea(evt.parent, olUnit) : measureTool.getLength(evt.parent, olUnit));
                    if(measureTool.handler.CLASS_NAME === 'OpenLayers.Handler.Polygon' && measure < 0) {
                        measure *= -1;
                    }
                    units = conf.units;
                    if(conf.addUnit) {
                        var bestMeasure = viewer.viewercontroller.openlayers.tools.OpenLayersMeasureHandler.getBestMeasure(measureTool, evt);
                        measureValueText.innerHTML = "" +
                            ("" + bestMeasure.measure.toFixed(decimals)).replace('.', decimalSeparator) + " " + bestMeasure.units + " - " +
                            ("" + measure.toFixed(decimals)).replace('.', decimalSeparator) + " " + units;
                        return;
                    }
                } else {
                    var bestMeasure = viewer.viewercontroller.openlayers.tools.OpenLayersMeasureHandler.getBestMeasure(measureTool, evt);
                    measure = bestMeasure.measure;
                    units = bestMeasure.units;
                }
                measureValueText.innerHTML= ("" + measure.toFixed(decimals)).replace('.', decimalSeparator) + " " + units;
            }
        },

        /**
         * Overrides OpenLayers getBestLength to also account for negative values
         */
        getBestLength: function(measureTool, geometry) {
            var units = measureTool.displaySystemUnits[measureTool.displaySystem];
            var unit, length;
            for(var i=0, len=units.length; i<len; ++i) {
                unit = units[i];
                length = measureTool.getLength(geometry, unit);
                if(length > 1 || length < -1) {
                    break;
                }
            }
            return [length, unit];
        },

        /**
         * Overrides OpenLayers getBestArea to also account for negative values
         */
        getBestArea: function(measureTool, geometry) {
            var units = measureTool.displaySystemUnits[measureTool.displaySystem];
            var unit, area;
            for(var i=0, len=units.length; i<len; ++i) {
                unit = units[i];
                area = measureTool.getArea(geometry, unit);
                if(area > 1 || area < -1) {
                    break;
                }
            }
            return [area, unit];
        },

        getBestMeasure: function(measureTool, evt) {
            // Call overriden function
            var bestMeasure;
            if(measureTool.handler.CLASS_NAME === 'OpenLayers.Handler.Polygon'){
                bestMeasure = viewer.viewercontroller.openlayers.tools.OpenLayersMeasureHandler.getBestArea(measureTool, evt.parent);
                if(bestMeasure[0] < 0){
                    bestMeasure[0] *= -1;
                }
                bestMeasure[1] += "<sup>2</" + "sup>";
            } else {
                bestMeasure = viewer.viewercontroller.openlayers.tools.OpenLayersMeasureHandler.getBestLength(measureTool, evt.parent);
            }
            return {
                measure: bestMeasure[0],
                units: bestMeasure[1]
            };
        },

        removeMeasure: function(containerPrefix) {
            var measureValueDiv = document.getElementById((containerPrefix ? containerPrefix : '') + "olControlMeasureValue");
            if (measureValueDiv) {
                measureValueDiv.style.display="none";
            }
        }
    }
});