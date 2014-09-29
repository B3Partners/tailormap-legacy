/*
 * Copyright (C) 2012-2014 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

Ext.define("viewer.components.sf.Slider", {

    config: {
        name: null,
        appLayerId: null,
        attributeName: null,
        config: null,
        container: null,
        autoMinStart: null,
        autoMaxStart: null,
        autoStart: null,
        simpleFilter: null,
        slider: null
    },

    constructor: function(conf) {
        this.initConfig(conf);

        var filterChangeDelay = 500;

        var c = this.config.config;
        var n = this.config.name;

        var autoMin = false, autoMax = false;

        c.step = Number(c.step);
        if(c.min === "") {
            this.getMinMax("#MIN#");
            autoMin = true;
            c.min = 0;
        } else {
            c.min = Number(c.min);
        }
        if(c.max === "") {
            this.getMinMax("#MAX#");
            autoMax = true;
            c.max = 1;
        } else {
            c.max = Number(c.max);
        }

        this.autoMinStart = false;
        this.autoMaxStart = false;
        this.autoStart = false;

        if(c.sliderType === "range") {
            c.start = c.start.split(",");
            if(c.start[0] === "min") {
                this.autoMinStart = autoMin;
                c.start[0] = c.min;
            } else {
                c.start[0] = Number(c.start[0]);
            }
            if(c.start[1] === "max") {
                this.autoMaxStart = autoMax;
                c.start[1] = c.max;
            } else {
                c.start[1] = Number(c.start[1]);
            }
        } else {
            if(c.start === "min" || c.start === "max") {
                this.autoStart = c.start;
                c.start = c[c.start];
            } else {
                c.start = Number(c.start);
            }
        }

        var t =
            "<div style=\"color: {steunkleur2}; background: {steunkleur1}; padding-left: 5px; padding-top: 3px; padding-bottom: 16px\">" +
            "<div style=\"color: black; margin-top: 4px; padding: 3px; background-color: #ced3d9\">" +
            "  <table width=\"100%\">" +
            "    <tbody>" +
            (!Ext.isEmpty(c.label) ? "        <tr><td colspan=\"3\" align=\"center\">{label}</td></tr>" : "") +
            "        <tr>" +
            "            <td colspan=\"3\"><div id=\"{name}_slider\"></div></td>" +
            "        </tr>";

        if(!Ext.isEmpty(c.valueFormatString)) {
            if(c.sliderType === "range") {
                t += "        <tr>" +
                    "            <td><span id=\"" + n + "_min\"></span></td>" +
                    "            <td></td>" +
                    "            <td align=\"right\"><span id=\"{name}_max\"></span></td>" +
                    "        </tr>";
            } else {
                t += "        <tr>" +
                    "            <td align=\"center\"><span id=\"{name}_value\"></span></td>" +
                    "        </tr>";
            }
        }

        t +=
            "        </tr>" +
            "    </tbody>" +
            "  </table>" +
            "</div>";

        var vc = this.config.simpleFilter.viewerController;
        new Ext.Template(t).append(this.config.simpleFilter.name, {
            steunkleur1: vc.app.details.steunkleur1,
            steunkleur2: vc.app.details.steunkleur2,
            label: c.label,
            name: this.config.name
        });

        if(c.sliderType === "range") {
            this.slider = Ext.create('Ext.slider.Multi', {
                id: n + "_extSlider",
                width: 160, // XXX
                values: [c.start[0], c.start[1]],
                increment: c.step,
                minValue: c.min,
                maxValue: c.max,
                constrainThumbs: true,
                renderTo: n + "_slider",
                listeners: {
                    change: {
                        fn: this.sliderChange,
                        buffer: filterChangeDelay,
                        scope: this
                    }
                }
            });
        } else {
        }
    },

    getMinMax: function(minOrMax) {

        var startTime = new Date().getTime();

        var me = this;
        Ext.Ajax.request({
            url: actionBeans.unique,
            timeout: 10000,
            params: {
                attribute: this.attributeName,
                applicationLayer: this.appLayerId,
                getMinMaxValue: 't',
                operator: minOrMax
            },
            success: function ( result, request ) {
                var time = new Date().getTime() - startTime;
                var res = Ext.JSON.decode(result.responseText);
                if(res.success) {
                    //console.log(minOrMax + " " + me.attributeName + ": " + res.value + ", time: " + (time/1000).toFixed(2));
                    me.updateMinMax(minOrMax, res.value);
                } else {
                    //Ext.MessageBox.alert('Foutmelding', "Kan geen min/max waardes ophalen: " + res.msg);
                }
            },
            failure: function ( result, request) {
                //Ext.MessageBox.alert('Foutmelding', "Kan geen min/max waardes ophalen: " + result.responseText);
            }
        });
    },

    updateMinMax: function(minOrMax, value) {
        if(minOrMax === "#MIN#") {
            this.slider.setMinValue(value);
        } else {
            this.slider.setMaxValue(value);
        }

        if(this.config.config.sliderType === "range") {
            if(minOrMax === "#MIN#" && this.autoMinStart) {
                this.slider.setValue(0, value, false);
            }
            if(minOrMax === "#MAX#" && this.autoMaxStart) {
                this.slider.setValue(0, this.slider.getValue(0), false);
                this.slider.setValue(1, value, false);
            }
        } else {
            if(this.autoStart === "min" && minOrMax === "#MIN#") {
                this.slider.setValue(0, value, false);
            }
            if(this.autoStart === "max" && minOrMax === "#MAX#") {
                this.slider.setValue(0, value, false);
            }
        }
    },

    sliderChange: function(slider, newValue, thumb, eOpts) {

        var vc = this.config.simpleFilter.viewerController;

        var layer = vc.getAppLayerById( this.appLayerId);

        if(!layer) {
            return;
        }

        var cql = this.getCQL();

        viewerController.setFilter(Ext.create("viewer.components.CQLFilterWrapper", {
            id: this.config.name,
            cql: cql,
            operator: "AND"
        }), layer);
    },
    getCQL : function(){
        var min = this.slider.getValue(0);
        var max = this.slider.getValue(1);

        var cql = this.config.attributeName + " > " + min + " AND " + this.config.attributeName + " < " + max;
        return cql;
    }
});

Ext.define("viewer.components.SimpleFilter", {
    extend: "viewer.components.Component",
    container: null,
    config: {
        filters: null,
        layers: null,
        name: null
    },
    constructor: function (conf){
        viewer.components.SimpleFilter.superclass.constructor.call(this, conf);
        this.initConfig(conf);
        var parentDiv = Ext.get(this.div);

        this.container = Ext.create('Ext.container.Container', {
            id: this.config.name,
            width: '100%',
            height: '100%',
            renderTo: this.div,
            autoScroll: true
        });

        var me = this;
        Ext.Array.each(this.config.filters, function(filter, index) {
            Ext.create(filter.class, {
                appLayerId: me.config.layers[filter.appLayerId], // convert from index to actual appLayerId
                attributeName: filter.attributeName,
                config: filter.config,
                container: me.container,
                simpleFilter: me,
                name: me.name + "_" + index
            });
        });
        return this;
    },

    getExtComponents: function() {
        return [ this.container.getId() ];
    }
});


