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
Ext.define("viewer.components.sf.SimpleFilter",{
    ready: null,
    minRetrieved: null,
    maxRetrieved: null,
    config:{
        container: null,
        name: null,
        appLayerId: null,
        attributeName: null,
        config: null,
        autoStart: null,
        viewerController:null
    },

    constructor : function(conf){
        this.ready = false;
        this.minRetrieved = false;
        this.maxRetrieved = false;
        this.initConfig(conf);

        this.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_LAYERS_INITIALIZED,this.isReady, this);
    },

    isReady : function(){
        this.viewerController.removeListener(viewer.viewercontroller.controller.Event.ON_LAYERS_INITIALIZED,this.isReady, this);
        this.ready = true;
        this.applyFilter();
    },

    applyFilter : function(){
        this.viewerController.logger.error("SimpleFilter.applyFilter() not yet implemented in subclass");
    },
    getCQL : function(){
        this.viewerController.logger.error("SimpleFilter.getCQL() not yet implemented in subclass");
    },
    setFilter : function(cql){
        var layer = this.viewerController.getAppLayerById(this.appLayerId);

        if (!layer) {
            return;
        }
        this.viewerController.setFilter(Ext.create("viewer.components.CQLFilterWrapper", {
            id: this.config.name,
            cql: cql,
            operator: "AND"
        }), layer);
    },
    getValues: function(operator) {
        if( (operator === "#MIN#" && this.minRetrieved) && (operator === "#MAX#" && this.maxRetrieved)){
            return;
        }
        var me = this;
        var params = {
            attribute: this.attributeName,
            applicationLayer: this.appLayerId,
            attributes: [this.attributeName],
            operator: operator
        };
        if(operator !== "#UNIQUE#"){
            params.getMinMaxValue = 't';
        }
        Ext.Ajax.request({
            url: actionBeans.unique,
            timeout: 10000,
            scope: this,
            params: params,
            success: function ( result, request ) {
                var res = Ext.JSON.decode(result.responseText);
                if(res.success) {
                    me.updateValues(operator, res);
                } else {
                    this.viewerController.logger.warning("Cannot retrieve min/max for attribute: " + this.attributeName + ". Oorzaak: " + res.msg);
                }
            },
            failure: function ( result, request) {
                this.viewerController.logger.warning("Cannot retrieve min/max for attribute: " + this.attributeName + ". " + result.responseText);
            }
        });
    },
    reset : function(){
        var layer = this.viewerController.getAppLayerById(this.appLayerId);

        if (!layer) {
            return;
        }
        this.viewerController.removeFilter(this.config.name, layer);
    },
    getWidth : function(){
        var div = Ext.get(this.config.simpleFilter.div);
        var width = div.getWidth() - 15;
        return width;
    },
    mustEscapeAttribute : function(){
        var appLayer = this.viewerController.getAppLayerById(this.appLayerId);
        var attributes = this.viewerController.getAttributesFromAppLayer(appLayer, null, false);
        if(!attributes){
            return false;
        }
        for (var i = 0 ; i < attributes.length ; i++){
            var attribute = attributes[i];
            if(attribute.name === this.attributeName){
                return attribute.type === "string";
            }
        }
        return false;
    }
});

Ext.define("viewer.components.sf.Reset", {
    constructor : function(config){
        this.initConfig(config);
        var t =
            "<div style=\"color: {steunkleur2}; background: {steunkleur1}; padding-left: 5px; padding-top: 3px; padding-bottom: 16px\">" +
            "<div style=\"color: black; margin-top: 4px; padding: 3px; background-color: #ced3d9\">" +
            "  <table width=\"100%\">" +
            "    <tbody>" +
            (!Ext.isEmpty(config.label) ? "        <tr><td colspan=\"3\" align=\"center\">{label}</td></tr>" : "") +
            "        <tr>" +
            "            <td colspan=\"3\"><div id=\"{name}_reset\"></div></td>" +
            "        </tr>" +
            "    </tbody>" +
            "  </table>" +
            "</div>";

        var vc = this.config.simpleFilter.viewerController;
        new Ext.Template(t).append(this.config.simpleFilter.name, {
            steunkleur1: vc.app.details.steunkleur1,
            steunkleur2: vc.app.details.steunkleur2,
            label: config.label,
            name: this.config.name
        });

        Ext.create("Ext.button.Button", {
            id: "reset" + this.config.name,
            name: "reset" + this.config.name,
            text: this.config.config.label,
            renderTo: this.config.name + "_reset",
            listeners: {
                click:{
                    scope:this,
                    fn: this.reset
                }
            }
        });
    },
    reset : function(){
        var filters = this.config.simpleFilter.simpleFilters;
        for (var i = 0 ; i < filters.length ; i++ ){
            var filter = filters[i];
            filter.reset();
        }
    }
});

Ext.define("viewer.components.sf.Checkbox", {
    extend: "viewer.components.sf.SimpleFilter",
    options:null,
    config:{
        simpleFilter:null
    },
    constructor: function(config){
        viewer.components.sf.Checkbox.superclass.constructor.call(this, config);
        this.initConfig(config);

        var config = this.config.config;
        this.options = config.options;
        var t =
            "<div style=\"color: {steunkleur2}; background: {steunkleur1}; padding-left: 5px; padding-top: 3px; padding-bottom: 16px\">" +
            "<div style=\"color: black; margin-top: 4px; padding: 3px; background-color: #ced3d9\">" +
            "  <table width=\"100%\">" +
            "    <tbody>" +
            (!Ext.isEmpty(config.label) ? "        <tr><td colspan=\"3\" align=\"center\">{label}</td></tr>" : "") +
            "        <tr>" +
            "            <td colspan=\"3\"><div id=\"{name}_checkbox\"></div></td>" +
            "        </tr>" +
            "    </tbody>" +
            "  </table>" +
            "</div>";

        var vc = this.config.simpleFilter.viewerController;
        new Ext.Template(t).append(this.config.simpleFilter.name, {
            steunkleur1: vc.app.details.steunkleur1,
            steunkleur2: vc.app.details.steunkleur2,
            label: config.label,
            name: this.config.name
        });

        this.createCheckboxes();

    },
    createCheckboxes : function(){
        var items = [];
        for (var i = 0 ; i < this.options.length ;i++){
            var option = this.options[i];
            var item = this.createElement(option);
            items.push(item);
        }

        Ext.create("Ext.container.Container", {
            height: this.options.length * 22,
            id: "checkboxcontainer" + this.config.name,
            name: "checkboxcontainer" + this.config.name,
            layout: {
                type: 'vbox',
                align: "left"
            },
            renderTo: this.config.name + "_checkbox",
            items: items
        });
    },

    createElement : function (option){
        var item = {
            boxLabel  : option.label,
            name      : option.value,
            checked: this.config.config.start ? this.config.config.start === option.value : false,
            inputValue: true,
            xtype: "checkbox",
            id        : this.config.name + option.id,
            listeners: {
                change: {
                    scope: this,
                    fn: this.applyFilter
                }
            }
         };
         return item;
    },

    applyFilter : function(){
        if(!this.ready){
            // This function will be called via eventlistener
            return;
        }

        var cql = this.getCQL();
        if(cql.length > 0){
            this.setFilter(cql);
        }else{
            this.reset();
        }
    },
    getCQL : function(){
        var cql = "";
        var mustEscape = this.mustEscapeAttribute();
        for (var i = 0 ; i < this.options.length ;i++){
            var checkbox = Ext.getCmp(this.config.name + this.options[i].id);
            if(checkbox.getValue()){
                cql += cql !== "" ? " OR " : "";
                cql += this.config.attributeName +  " = " +  (mustEscape ? "'" : "")  +checkbox.getName() + (mustEscape ? "'" : "");
            }
        }
        return cql;
    },
    reset : function(){
        this.ready = false;
        for (var i = 0 ; i < this.options.length ;i++){
            var checkbox = Ext.getCmp(this.config.name + this.options[i].id);
            checkbox.reset();
        }
        this.ready = true;
        this.callParent();
    }
});


Ext.define("viewer.components.sf.Radio", {
    extend: "viewer.components.sf.Checkbox",
    constructor : function(config){
        viewer.components.sf.Radio.superclass.constructor.call(this, config);

    },
    createElement : function (option){
        var item = {
            boxLabel  : option.label,
            name      :  this.config.name,
            checked: this.config.config.start ? this.config.config.start === option.value : false,
            inputValue: option.value,
            xtype: "radio",
            id        : this.config.name + option.id,
            listeners: {
                change: {
                    scope: this,
                    fn: function(radio, newValue){
                        if(newValue){
                            this.applyFilter();
                        }
                    }
                }
            }
         };
         return item;
    },
    getCQL: function () {
        var checkbox = Ext.getCmp(this.config.name + this.options[0].id);
        var cql = "";
        var mustEscape = this.mustEscapeAttribute();
        if (checkbox.getGroupValue()) {
            cql = this.config.attributeName + " = " + (mustEscape ? "'" : "") + checkbox.getGroupValue() + (mustEscape ? "'" : "");
        }
        return cql;
    }
});


Ext.define("viewer.components.sf.Combo", {
    extend: "viewer.components.sf.SimpleFilter",
    combo: null,
    store:null,
    uniqueValues:null,
    config: {
        simpleFilter: null
    },

    constructor: function(conf) {
        viewer.components.sf.Combo.superclass.constructor.call(this, conf);
        this.uniqueValues = [];
        this.initConfig(conf);

        var config = this.config.config;
        var name = this.config.name;
        if(config.comboType === "range"){
            if(config.min === "") {
                this.getValues("#MIN#");
                config.min = -1;
            } else {
                config.min = Number(config.min);
            }
            if(config.max === "") {
                this.getValues("#MAX#");
                config.max = -1;
            } else {
                config.max = Number(config.max);
            }
        } else {
            config.min = -1;
            config.max = -1;
            if (config.comboType === "unique") {
                this.getValues("#UNIQUE#");
            } else if (config.comboType === "own") {
                this.ownValues = config.ownValues;
            }
        }

        this.autoStart = false;

        if(config.start === "min" || config.start === "max") {
            this.autoStart = config.start;
            this.getValues(config.start === "min" ? "#MIN#" : "#MAX#");
            config.start = config[config.start];
        } else {
            config.start = config.start !== "" ? Number(config.start) : -1;
        }

        var t =
            "<div style=\"color: {steunkleur2}; background: {steunkleur1}; padding-left: 5px; padding-top: 3px; padding-bottom: 16px\">" +
            "<div style=\"color: black; margin-top: 4px; padding: 3px; background-color: #ced3d9\">" +
            "  <table width=\"100%\">" +
            "    <tbody>" +
            (!Ext.isEmpty(config.label) ? "        <tr><td colspan=\"3\" align=\"center\">{label}</td></tr>" : "") +
            "        <tr>" +
            "            <td colspan=\"3\"><div id=\"{name}_combo\"></div></td>" +
            "        </tr>" +
            "    </tbody>" +
            "  </table>" +
            "</div>";

        var vc = this.config.simpleFilter.viewerController;
        new Ext.Template(t).append(this.config.simpleFilter.name, {
            steunkleur1: vc.app.details.steunkleur1,
            steunkleur2: vc.app.details.steunkleur2,
            label: config.label,
            name: this.config.name
        });

        this.createCombo();
        if(!this.autoStart){
            this.applyFilter();
        }
    },

    createCombo: function () {
        var filterChangeDelay = 500;
        var data= this.getData();
        this.store = Ext.create('Ext.data.Store', {
            fields: ['value'],
            data: data
        });
        this.combo = Ext.create("Ext.form.field.ComboBox", {
            store: this.store,
            queryMode: 'local',
            width: this.getWidth(),
            displayField: 'value',
            valueField: 'value',
            renderTo: this.config.name + "_combo",
            listeners: {
                select: {
                    fn: this.applyFilter,
                    buffer: filterChangeDelay,
                    scope: this
                }
            }
        });
        if( this.config.config.start !== -1 ){
            this.combo.setValue (this.config.config.start);
        }
    },

    getData : function(){
        var data = [];
        var config = this.config.config;
        if (config.comboType === "range") {
            for (var i = config.min; i <= config.max; i++) {
                var entry = {
                    value: i
                };
                data.push(entry);
            }
        }else if (config.comboType === "unique" || config.comboType === "own"){
            var vals = config.comboType === "unique"? this.uniqueValues : this.ownValues.split(",");
            for (var i = 0 ; i < vals.length ; i++){
                var entry = {
                    value : vals[i]
                };
                data.push(entry);
            }
        }
        return data;
    },

    updateValues: function(operator, response) {
        var value = response.value;
        if(operator === "#MIN#") {
            this.config.config.min = value;
        } else if(operator === "#MAX#") {
            this.config.config.max = value;
        }else if (operator === "#UNIQUE#"){
            var values = response.uniqueValues[this.attributeName];
            this.uniqueValues = values;
        }
        var data = this.getData();
        this.store.removeAll();
        this.store.add(data);
        if (this.autoStart === "min" && operator === "#MIN#") {
            this.combo.setValue( value);
        }
        if (this.autoStart === "max" && operator === "#MAX#") {
            this.combo.setValue(value);
        }
    },
    applyFilter : function(){
        if(!this.ready){
            // This function will be called via eventlistener
            return;
        }
        if (this.combo.getValue() !== null) {
            var cql = this.getCQL();
            this.setFilter(cql);
        }
    },

    getCQL : function(){
        var mustEscape = this.mustEscapeAttribute();
        var cql = this.config.attributeName + " = " + (mustEscape ? "'" : "") + this.combo.getValue() + (mustEscape ? "'" : "");
        return cql;
    },
    reset : function(){
        this.callParent();
        this.combo.setValue(null);
    }
});

Ext.define("viewer.components.sf.Slider", {
    extend: "viewer.components.sf.SimpleFilter",
    config: {
        autoMinStart: null,
        autoMaxStart: null,
        simpleFilter: null,
        slider: null
    },

    constructor: function(conf) {
        viewer.components.sf.Slider.superclass.constructor.call(this, conf);
        this.initConfig(conf);

        var filterChangeDelay = 500;

        var c = this.config.config;
        var n = this.config.name;

        var autoMin = false, autoMax = false;

        c.step = Number(c.step);
        if(c.min === "") {
            this.getValues("#MIN#");
            autoMin = true;
            c.min = 0;
        } else {
            c.min = Number(c.min);
        }
        if(c.max === "") {
            this.getValues("#MAX#");
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
                width: this.getWidth(),
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
        } else if(c.sliderType === "eq" || c.sliderType === "gt" || c.sliderType === "lt" )  {
            this.slider = Ext.create('Ext.slider.Single', {
                id: n + "_extSlider",
                width: this.getWidth(),
                value: c.start,
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
        }

        if(!this.autoStart){
            this.sliderChange();
        }
    },

    updateValues: function(minOrMax, response) {
        var value = response.value;
        if(minOrMax === "#MIN#") {
            this.slider.setMinValue(value);
        } else {
            this.slider.setMaxValue(value);
        }

        if(this.config.config.sliderType === "range") {
            if(minOrMax === "#MIN#" && this.autoMinStart) {
                this.config.config.start[0] = value;
                this.slider.setValue(0, value, false);
            }
            if(minOrMax === "#MAX#" && this.autoMaxStart) {
                this.config.config.start[1] = value;
                this.slider.setValue(0, this.slider.getValue(0), false);
                this.slider.setValue(1, value, false);
            }
        } else {
            this.config.config.start = value;
            if(this.autoStart === "min" && minOrMax === "#MIN#") {
                this.slider.setValue(0, value, false);
            }
            if(this.autoStart === "max" && minOrMax === "#MAX#") {
                this.slider.setValue(0, value, false);
            }
        }
    },
    applyFilter : function(){
        this.sliderChange();
    },
    sliderChange: function() {
        if(!this.ready){
            // This function will be called via eventlistener
            return;
        }
        var cql = this.getCQL();
        this.setFilter(cql);
    },
    getCQL : function(){
        var cql = "";
        var sliderType = this.config.config.sliderType ;
        var mustEscape = this.mustEscapeAttribute();
        if(sliderType === "range"){
            var min = (mustEscape ? "'" : "") + this.slider.getValue(0) + (mustEscape ? "'" : "");
            var max = (mustEscape ? "'" : "") + this.slider.getValue(1) + (mustEscape ? "'" : "");

            cql = this.config.attributeName + " >= " + min + " AND " + this.config.attributeName + " <= " + max;
        }else{
            var value = (mustEscape ? "'" : "") + this.slider.getValue() + (mustEscape ? "'" : "");
            if (sliderType === "eq"){
                cql = this.config.attributeName + " = " + value;
            }else if (sliderType === "gt"){
                cql = this.config.attributeName + " >= " + value;
            }else if (sliderType === "lt"){
                cql = this.config.attributeName + " <= " + value;
            }
        }
        return cql;
    },
    reset : function(){

        if(this.config.config.sliderType === "range") {
            this.slider.setValue(0, this.config.config.start[0]);
            this.slider.setValue(1, this.config.config.start[1]);
        }else{
            this.slider.setValue(this.config.config.start);
        }
        this.callParent();
    }
});
