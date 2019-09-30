/* 
 * Copyright (C) 2019 B3Partners B.V.
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


/* global ol, Ext */
xF

Ext.define("viewer.viewercontroller.ol.tools.Measure",{
    extend: "viewer.viewercontroller.ol.OlTool",
    sketch:null,
    listener:null,
    measureTooltipElement:null,
    measureTooltip:null,
    overlay:null,
    layer:null,
    constructor : function(conf){
        //viewer.viewercontroller.ol.tools.Measure.superclass.constructor.call(this,conf);
        this.initConfig(conf);
        this.conf = conf;
        this.overlay =[];
        this.pan = null;
        conf.id = "measure";
        //conf.class = "olControlMeasure";
        conf.onlyClick = false;
        conf.actives =false;
        this.mapComponent = conf.viewerController.mapComponent;
        this.frameworkObject = this.initTool(conf.typ);
        this.initEvents();
        this.deactivate();
    },

    activate : function(){
        this.conf.actives =true;
        this.pan = new ol.interaction.DragPan();
        this.frameworkObject = this.initTool(this.conf.typ);
        this.initEvents();
        this.mapComponent.maps[0].getFrameworkMap().addInteraction(this.frameworkObject);
        this.mapComponent.maps[0].getFrameworkMap().addInteraction(this.pan);
        this.frameworkObject.setActive(true);
        this.createMeasureToolTip();
    },

    deactivate : function() {

        this.conf.actives =false;
        this.frameworkObject.setActive(false);
        
        for(var i=0; i < this.overlay.length;i++){
            this.mapComponent.maps[0].getFrameworkMap().removeOverlay(this.overlay[i]);
        }
        this.overlay =[];
        this.mapComponent.maps[0].getFrameworkMap().removeInteraction(this.frameworkObject);
        this.mapComponent.maps[0].getFrameworkMap().removeInteraction(this.pan);
        this.layer.getSource().clear();
    },

    initTool : function(type){
        var index  = this.mapComponent.maps[0].getFrameworkMap().getLayers().getLength() +1;
        var source = new ol.source.Vector();
        
        this.layer = new ol.layer.Vector({
            zIndex:index,
            source: source,
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: '#ffcc33',
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color: '#ffcc33'
                })
            })
            })
        });
        this.mapComponent.maps[0].getFrameworkMap().addLayer(this.layer);

        var draw = new ol.interaction.Draw({
            source:source,
            type: type,
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                }),
            stroke: new ol.style.Stroke({
                color: 'rgba(0, 0, 0, 0.5)',
                lineDash: [10, 10],
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 5,
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0, 0.7)'
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                })
            })
            })
        });
        return draw;
    },

    createMeasureToolTip : function(){
        if (this.measureTooltipElement) {
          this.measureTooltipElement.parentNode.removeChild(this.measureTooltipElement);
        }
        this.measureTooltipElement = document.createElement('div');
        this.measureTooltipElement.className = 'tooltip tooltip-measure';
        this.measureTooltip = new ol.Overlay({
          element: this.measureTooltipElement,
          offset: [0, -15],
          positioning: 'bottom-center'
        });
        this.mapComponent.maps[0].getFrameworkMap().addOverlay(this.measureTooltip);
        this.overlay.push(this.measureTooltip);
    },
    
    initEvents : function(){
        var me = this;
        this.frameworkObject.on('drawstart',
            function(evt) {
              // set sketch
              this.sketch = evt.feature;

              /** @type {ol.Coordinate|undefined} */
              var tooltipCoord = evt.coordinate;

              this.listener = this.sketch.getGeometry().on('change', function(evt) {
                var geom = evt.target;
                var output;
                if (geom instanceof ol.geom.Polygon) {
                  output = me.formatArea(geom);
                  tooltipCoord = geom.getInteriorPoint().getCoordinates();
                } else if (geom instanceof ol.geom.LineString) {
                  output = me.formatLength(geom);
                  tooltipCoord = geom.getLastCoordinate();
                }
                me.measureTooltipElement.innerHTML = output;
                me.measureTooltip.setPosition(tooltipCoord);
              });
            }, this);
        
        
        
        this.frameworkObject.on('drawend',
            function() {
              me.measureTooltipElement.className = 'tooltip tooltip-static';
              me.measureTooltip.setOffset([0, -7]);

              me.sketch = null;

              me.measureTooltipElement = null;
              me.createMeasureToolTip();
              ol.Observable.unByKey(me.listener);
            }, me);
      },
    
    formatArea : function(polygon){
        var area;
        area = polygon.getArea();
        var output;
        if (area > 10000) {
          output = (Math.round(area / 1000000 * 100) / 100) +
              ' ' + 'km<sup>2</sup>';
        } else {
          output = (Math.round(area * 100) / 100) +
              ' ' + 'm<sup>2</sup>';
        }
        return output;
    },
    
    formatLength : function(line){
        var length;
        length = Math.round(line.getLength() * 100) / 100;
        var output;
        if (length > 1000) {
          output = (Math.round(length / 1000 * 100) / 100) +
              ' ' + 'km';
        } else {
          output = (Math.round(length * 100) / 100) +
              ' ' + 'm';
        }
        return output;
    },
    
    isActive : function(){
        return this.frameworkObject.getActive();
    }
    
});