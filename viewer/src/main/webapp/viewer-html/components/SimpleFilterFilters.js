/*
 * Copyright (C) 2012-2014 B3Partners B.V.
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
/* global Ext, actionBeans */

Ext.define("viewer.components.sf.SimpleFilterBase", {
    extend: "Ext.util.Observable",
    filterID: null,
    visible: true,
    constructor: function(config){
        this.initConfig(config);
        viewer.components.sf.SimpleFilterBase.superclass.constructor.call(this, this.config);
        return this;
    },
    /**
     * @param visible boolean
     */
    setVisible: function(visible) {
        if(!this.filterID) {
            return;
        }
        var container = document.getElementById(this.filterID);
        if(visible && !this.visible) {
            container.style.display = 'block';
            this.visible = true;
            if(this.applyFilterWhenReady) {
                this.applyFilterWhenReady();
            }
        } else if(!visible && this.visible) {
            this.visible = false;
            container.style.display = 'none';
            if(this.reset && !(this instanceof viewer.components.sf.Reset)) {
                // Call reset to remove filter
                // Skip in case of Reset buttons or this would reset all filters
                this.reset();
            }
        }
    },
    wrapSimpleFilter: function(label, contents, className) {
        this.filterID = Ext.id();
        var contentBefore = [
            "<div id=\"", this.filterID, "\" class=\"simple-filter-container steunkleur1 steunkleur2", (className ? " " + className : "") ,"\">",
                "<div class=\"simple-filter-inner\">",
                    "<table>",
                        "<tbody>"
        ];
        var labelContent = [];
        if(!Ext.isEmpty(label)) {
            labelContent.push("<tr><td colspan=\"3\" align=\"center\">{label}</td></tr>");
        }
        var contentAfter = [
                        "</tbody>",
                    "</table>",
                "</div>",
            "</div>"
        ];
        return contentBefore.concat(labelContent, contents, contentAfter).join("");
    }
});
Ext.define("viewer.components.sf.SimpleFilter",{
    extend: "viewer.components.sf.SimpleFilterBase",
    ready: null,
    layersLoaded:null,
    attributesLoaded:null,
    minRetrieved: null,
    maxRetrieved: null,
    parentFilterInstance:null,
    childFilters:null,
    config:{
        container: null,
        name: null,
        appLayerId: null,
        attributeName: null,
        filterConfig: null,
        id:null,
        label:null,
        autoStart: null,
        viewerController:null,
        linkedFilterAttribute:null,
        linkedFilter:null
    },
    constructor : function(conf){
        this.childFilters = [];
        this.ready = false;
        this.minRetrieved = false;
        this.maxRetrieved = false;
        this.initConfig(conf);
        this.loadAttributes();
        this.config.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_LAYERS_INITIALIZED,this.layersInitialized, this);
        viewer.components.sf.SimpleFilter.superclass.constructor.call(this, this.config);
    },
    layersInitialized: function(){
        this.layersLoaded = true;
        this.config.viewerController.removeListener(viewer.viewercontroller.controller.Event.ON_LAYERS_INITIALIZED,this.layersInitialized, this);
        this.applyFilterWhenReady();
    },
    applyFilterWhenReady : function(){
        if(this.attributesLoaded && this.layersLoaded){
            this.ready = true;
            this.applyFilter();
        }
    },
    applyFilter : function(){
        this.config.viewerController.logger.error("SimpleFilter.applyFilter() not yet implemented in subclass");
    },
    getCQL : function(){
        this.config.viewerController.logger.error("SimpleFilter.getCQL() not yet implemented in subclass");
    },
    setFilter : function(cql,linked,isReset){
        var layer = this.config.viewerController.getAppLayerById(this.config.appLayerId);
        if (!layer || !layer.checked) {
            return;
        }
        this.config.viewerController.setFilter(Ext.create("viewer.components.CQLFilterWrapper", {
            id: this.config.name + (linked ? "_linked" : ""),
            cql: cql,
            operator: "AND"
        }), layer);
        if(!isReset){
            this.fireEvent(viewer.viewercontroller.controller.Event.ON_FILTER_ACTIVATED,this,this);
        }
    },
    getValues: function(operator, extraFilter) {
        if( (operator === "#MIN#" && this.minRetrieved) && (operator === "#MAX#" && this.maxRetrieved)){
            return;
        }
        var me = this;
        var params = {
            attribute: this.config.attributeName,
            applicationLayer: this.config.appLayerId,
            attributes: [this.config.attributeName],
            operator: operator,
            maxFeatures:this.config.filterConfig.maxFeatures ? this.config.filterConfig.maxFeatures : 1000
        };
        if(operator !== "#UNIQUE#"){
            params.getMinMaxValue = 't';
        }
        if(extraFilter){
            params["filter"] = extraFilter;
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
                    this.fireEvent(viewer.viewercontroller.controller.Event.ON_FILTER_VALUES_UPDATED,this,this);
                } else {
                    this.config.viewerController.logger.warning("Cannot retrieve min/max for attribute: " + this.config.attributeName + ". Oorzaak: " + res.msg);
                }
            },
            failure: function ( result, request) {
                this.config.viewerController.logger.warning("Cannot retrieve min/max for attribute: " + this.config.attributeName + ". " + result.responseText);
            }
        });
    },
    reset : function(){
        var layer = this.config.viewerController.getAppLayerById(this.config.appLayerId);
        if (!layer) {
            return;
        }
        this.config.viewerController.removeFilter(this.config.name, layer);
        this.config.viewerController.removeFilter(this.config.name + "_linked", layer);
    },
    mustEscapeAttribute : function(attr){
        if(!attr){
            attr = this.config.attributeName;
        }
        var appLayer = this.config.viewerController.getAppLayerById(this.config.appLayerId);
        var attributes = this.config.viewerController.getAttributesFromAppLayer(appLayer, null, false);
        if(!attributes){
            return false;
        }
        for (var i = 0 ; i < attributes.length ; i++){
            var attribute = attributes[i];
            if(attribute.name === attr){
                return attribute.type === "string";
            }
        }
        return false;
    },
    loadAttributes: function() {
        var appLayer = this.config.viewerController.getAppLayerById(this.config.appLayerId);

        var me = this;
        if(appLayer !== null) {
            var featureService = this.config.viewerController.getAppLayerFeatureService(appLayer);

            // check if featuretype was loaded
            if(appLayer.attributes === undefined) {
                featureService.loadAttributes(appLayer, function(attributes) {
                    me.attributesLoaded = true;
                    me.applyFilterWhenReady();
                },this);
            } else {
                this.attributesLoaded = true;
                this.applyFilterWhenReady();
            }
        }
    },
    sanitizeValue : function (val, mustEscape){
        if(mustEscape){
            val = val.replace(/\'/g,'\'\'');
        }
        return val;
    },
    handleLinkedfilterChanged: function(reset){
        if(!this.parentFilterInstance){
            return;
        }
        this.reset();
        var extraFilter = reset ? "" : this.parentFilterInstance.getCQL(this.config.filterConfig.linkedFilterAttribute, this.parentFilterInstance.getValue(),true);
        this.initCalculatedValues(extraFilter);
        
        this.addListener(viewer.viewercontroller.controller.Event.ON_FILTER_VALUES_UPDATED,function(){
            this.setFilter(extraFilter,true,reset);
        }, this,{single:true});
        
    },
    getValue: function(){
        this.config.viewerController.logger.error("SimpleFilter.getValue() not yet implemented in subclass");
    },
    initCalculatedValues: function(){
        this.config.viewerController.logger.error("SimpleFilter.initCalculatedValues() not yet implemented in subclass");
    }
});

Ext.define("viewer.components.sf.Reset", {
    extend: "viewer.components.sf.SimpleFilterBase",
    constructor : function(config){
        this.initConfig(config);
        var t = this.wrapSimpleFilter(config.label, [
            "<tr>",
                "<td colspan=\"3\"><div id=\"{name}_reset\"></div></td>",
            "</tr>"
        ]);
        new Ext.Template(t).append(this.config.container, {
            label: config.label,
            name: this.config.name
        });
        Ext.create("Ext.button.Button", {
            id: "reset" + this.config.name,
            name: "reset" + this.config.name,
            text: this.config.filterConfig.label,
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
            filter.handleLinkedfilterChanged(true);
        }
    }
});

Ext.define("viewer.components.sf.Textlabel", {
    extend: "viewer.components.sf.SimpleFilterBase",
    constructor : function(config){
        this.initConfig(config);
        var t = this.wrapSimpleFilter(config.filterConfig.textlabel, [], "simple-filter-textlabel");
        new Ext.Template(t).append(this.config.container, {
            label: config.filterConfig.textlabel
        });
    }
});

Ext.define("viewer.components.sf.Checkbox", {
    extend: "viewer.components.sf.SimpleFilter",
    options:null,
    config:{
        simpleFilter:null
    },
    constructor: function(config){
        this.initConfig(config);
		viewer.components.sf.Checkbox.superclass.constructor.call(this, this.config);

        var filterConfig = this.config.filterConfig;
        this.options = filterConfig.options;
        var t = this.wrapSimpleFilter(filterConfig.label, [
            "<tr>",
                "<td colspan=\"3\"><div id=\"{name}_checkbox\"></div></td>",
            "</tr>"
        ]);
        new Ext.Template(t).append(this.config.container, {
            label: filterConfig.label,
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
            columns: 1,
            id: "checkboxcontainer" + this.config.name,
            name: "checkboxcontainer" + this.config.name,
            defaults: {
                height: 18
            },
            layout: {
                type: 'vbox',
                align: "stretch"
            },
            renderTo: this.config.name + "_checkbox",
            items: items
        });
    },

    createElement : function (option){
        var item = {
            boxLabel  : option.label,
            name      : option.value,
            checked: option.defaultVal || (this.config.filterConfig.start ? this.config.filterConfig.start === option.value : false),
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
        this.setFilter(this.getCQL());
    },
    getCQL : function(){
        var cql = "";
        var mustEscape = this.mustEscapeAttribute();
        for (var i = 0 ; i < this.options.length ;i++){
            var checkbox = Ext.getCmp(this.config.name + this.options[i].id);
            if(checkbox.getValue()){
                cql += cql !== "" ? " OR " : "";
                var name = checkbox.getName();
                var operator = name.indexOf('%') === -1 ? ' = ' : ' ILIKE ';
                cql += this.config.attributeName +  operator + (mustEscape ? "'" : "")  + this.sanitizeValue(name,mustEscape) + (mustEscape ? "'" : "");
            }
        }
        if(cql.length > 0 && this.options.length > 1){
            cql = "(" + cql + ")";
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
        this.applyFilter();
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
            checked: this.config.filterConfig.start ? this.config.filterConfig.start === option.value : false,
            inputValue: option.value,
            xtype: "radio",
            id        : this.config.name + option.id,
            listeners: {
                change: {
                    scope: this,
                    fn: function(radio, newValue){
                        if(newValue !== null){
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
            cql = this.config.attributeName + " = " + (mustEscape ? "'" : "") + this.sanitizeValue(checkbox.getGroupValue(),mustEscape) + (mustEscape ? "'" : "");
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
        simpleFilter: null,
        comboType:null,
        max:null,
        min:null,
        ownValues:null,
        maxFeatures:null,
        start:null
    },

    constructor: function(conf) {
        viewer.components.sf.Combo.superclass.constructor.call(this, conf);
        this.uniqueValues = [];
        this.initConfig(conf);

        var config = this.config.filterConfig;
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
        var t = this.wrapSimpleFilter(config.label, [
            "<tr>",
                "<td colspan=\"3\"><div id=\"{name}_combo\"></div></td>",
            "</tr>"
        ]);
        new Ext.Template(t).append(this.config.container, {
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
            width: "100%",
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
        if( this.config.filterConfig.start !== -1 ){
            this.combo.setValue (this.config.filterConfig.start);
        }
    },

    getData : function(){
        var data = [];
        var config = this.config.filterConfig;
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
            this.config.filterConfig.min = value;
        } else if(operator === "#MAX#") {
            this.config.filterConfig.max = value;
        }else if (operator === "#UNIQUE#"){
            var values = response.uniqueValues[this.config.attributeName];
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

    getCQL : function(attribute, value, allIfValueIsNull){
        if(!attribute){
            attribute = this.config.attributeName;
        }
        if(!value){
            value = this.combo.getValue();
        }
        var mustEscape = this.mustEscapeAttribute(attribute);
        if(value !== null){
            var cql = attribute + " = " + (mustEscape ? "'" : "") + this.sanitizeValue(value,mustEscape) + (mustEscape ? "'" : "");
            return cql;
        }else{
            if(allIfValueIsNull){
                var data = this.getData();
                var cql = attribute + " IN (";
                for(var i = 0 ; i < data.length ;i++){
                    var val = data[i];
                    val = (mustEscape ? "'" : "") + this.sanitizeValue(val.value,mustEscape) + (mustEscape ? "'" : "");
                    if( i > 0){
                        cql += ",";
                    }
                    cql += val;
                }
                cql += ")";
                return cql;
            }else{
                return null;
            }
        }
    },
    reset : function() {
        this.combo.setValue(null);
        this.callParent();
        this.applyFilter();
    },
    initCalculatedValues: function(extraFilter){
        this.getValues("#UNIQUE#", extraFilter);
    },
    getValue: function(){
        return this.combo.getValue();
    }
});

Ext.define("viewer.components.sf.Number", {
    extend: "viewer.components.sf.SimpleFilter",
    config: {
        simpleFilter: null,
        filterConfig: null
    },
    numberField: null,
    constructor: function(conf) {
        this.initConfig(conf);
		viewer.components.sf.Number.superclass.constructor.call(this, this.config);
        var templatecontents = [
            "<tr>",
                "<td width=\"100\"><div id=\"{name}_field\">{value}</div></td>",
                "<td colspan=\"2\">{fieldLabel}</td>",
            "</tr>"
        ];
        var t = this.wrapSimpleFilter(this.config.filterConfig.label, templatecontents);
        new Ext.Template(t).append(this.config.container, {
            label: this.config.filterConfig.label,
            name: this.config.name,
            fieldLabel: this.config.filterConfig.fieldLabel || ""
        });
        this.numberField = this.createElement();
    },
    createElement : function () {
        var filterChangeDelay = 500;
        return Ext.create("Ext.form.field.Number", {
            renderTo: this.config.name + "_field",
            name:  this.config.name,
            value: this.config.filterConfig.start ? this.config.filterConfig.start : "",
            maxValue: this.config.filterConfig.max || Number.MAX_VALUE,
            minValue: this.config.filterConfig.min || 0,
            width: 100,
            listeners: {
                change: {
                    scope: this,
                    fn: function(){
                        this.applyFilter();
                    },
                    buffer: filterChangeDelay
                }
            }
         });
    },
    applyFilter : function(){
        if(!this.ready){
            // This function will be called via eventlistener
            return;
        }
        var cql = this.getCQL();
        if (cql.length > 0) {
            this.setFilter(cql);
        }
    },
    getCQL : function(){
        var cql = "";
        var type = this.config.filterConfig.numberType;
        var mustEscape = this.mustEscapeAttribute();
        var value = (mustEscape ? "'" : "") + this.numberField.getValue() + (mustEscape ? "'" : "");
        if (Ext.isNumeric(value)) {
            if (type === "eq") {
                cql = this.config.attributeName + " = " + value;
            } else if (type === "gt") {
                cql = this.config.attributeName + " >= " + value;
            } else if (type === "lt") {
                cql = this.config.attributeName + " <= " + value;
            }
        }
        return cql;
    },
    reset : function(){
        this.numberField.setValue(this.config.filterConfig.start || "");
        this.callParent();
        this.applyFilter();
    }
});


Ext.define("viewer.components.sf.Text", {
    extend: "viewer.components.sf.SimpleFilter",
    config: {
        simpleFilter: null,
        filterConfig: null
    },
    textField: null,
    constructor: function(conf) {
        this.initConfig(conf);
		viewer.components.sf.Text.superclass.constructor.call(this, this.config);
        var templatecontents = [
            "<tr>",
                "<td><div id=\"{name}_field\">{value}</div></td>",
            "</tr>"
        ];
        var t = this.wrapSimpleFilter(this.config.filterConfig.label, templatecontents);
        new Ext.Template(t).append(this.config.container, {
            label: this.config.filterConfig.label,
            name: this.config.name
        });
        this.textField = this.createElement();
    },
    createElement : function () {
        var filterChangeDelay = 500;
        return Ext.create("Ext.form.field.Text", {
            renderTo: this.config.name + "_field",
            name:  this.config.name,
            value: this.config.filterConfig.start ? this.config.filterConfig.start : "",
            width: "100%",
            listeners: {
                change: {
                    scope: this,
                    fn: function(){
                        this.applyFilter();
                    },
                    buffer: filterChangeDelay
                }
            }
         });
    },
    applyFilter : function(){
        if(!this.ready){
            // This function will be called via eventlistener
            return;
        }
        var cql = this.getCQL();
        this.setFilter(cql);
    },
    getCQL : function(){
        var cql = "";
        var type = this.config.filterConfig.filterType;
        var mustEscape = this.mustEscapeAttribute();
        var val = this.textField.getValue();
        if (val && val.length > 0) {
            var value = (mustEscape ? "'" : "") + val + (mustEscape ? "'" : "");
            if (type === "eq") {
                cql = this.config.attributeName + " = " + value;
            } else if (type === "ilike") {
                value = (mustEscape ? "'%" : "%") + val + (mustEscape ? "%'" : "%");;
                cql = this.config.attributeName + " ILIKE " + value;
            }
        }
        return cql;
    },
    reset: function () {
        this.textField.setValue(this.config.filterConfig.start || "");
        this.callParent();
        this.applyFilter();
    }
});

Ext.define("viewer.components.sf.Slider", {
    extend: "viewer.components.sf.SimpleFilter",
    slider:null,

    retrieveStartMinVal: null,
    retrieveStartMaxVal: null,
    retrieveMinVal: null,
    retrieveMaxVal: null,
    sliderType:null,
    startValues:null,
    config: {
        filterConfig: {
            max: null,
            min: null,
            sliderType: null,
            start: null,
            step: null,
            valueFormatString: null
        }
    },
    constructor: function(conf) {
        this.initConfig(conf);
        viewer.components.sf.Slider.superclass.constructor.call(this, this.config);
        var c = conf.filterConfig;
        var n = this.config.name;

        var templatecontents = [
            "<tr>",
            "<td colspan=\"3\"><div id=\"{name}_slider\"></div></td>",
            "</tr>"
        ];
        this.sliderType = c.sliderType;
        if(!Ext.isEmpty(c.valueFormatString)) {
            if (this.sliderType === "range") {
                templatecontents.push(
                    "<tr>",
                    "<td><span id=\"{name}_min\"></span></td>",
                    "<td></td>",
                    "<td align=\"right\"><span id=\"{name}_max\">{value}</span></td>",
                    "</tr>"
                );
            } else {
                templatecontents.push(
                    "<tr>",
                    "<td width=\"33%\"><span id=\"{name}_min\">{minvalue}</span></td>",
                    "<td width=\"33%\" align=\"center\"><span id=\"{name}_value\">{value}</span></td>",
                    "<td width=\"34%\" align=\"right\"><span id=\"{name}_max\">{maxvalue}</span></td>",
                    "</tr>"
                );
            }
        }
        var t = this.wrapSimpleFilter(c.label, templatecontents);
        new Ext.Template(t).append(this.config.container, {
            label: c.label,
            name: n,
            value: c.start,
            minvalue: c.min,
            maxvalue: c.max
        });

        this.retrieveStartMinVal = false, this.retrieveStartMaxVal = false;
        this.retrieveMinVal = false, this.retrieveMaxVal = false;
        this.startValues = [];
        this.initCalculatedValues();
    },
    
    initCalculatedValues: function(filter){
        var c = this.config.filterConfig;
        this.createSlider();
        var values = [];
        var min = 0, max = 0;
        // min/max zijn geldend
        // start waardes zijn alleen maar de values, niet de min/max

        if (this.sliderType === "range") {
            c.start = c.start.split(",");
            var vals = c.start;

            if(vals[0] === "min"){
                values[0] = 0;
                this.retrieveStartMinVal = true;
            }else {
                values[0] = vals[0];
            }
            if(vals[1] === "max"){
                values[1] = 0;
                this.retrieveStartMaxVal = true;
            }else {
                values[1] = vals[1];
            }
        }else{
            var vals = c.start;

            if(vals === "min"){
                values[0] = 0;
                this.retrieveStartMinVal = true;
            }else if(vals === "max"){
                values[0] = 0;
                this.retrieveStartMaxVal = true;
            }else {
                values[0] = vals
            }
        }

        if(c.min === "min" || c.min === ""){
            min = 0;
            this.retrieveMinVal = true;
        }else{
            min = c.min;
        }

        if(c.max === "max" || c.max === ""){
            max = 0;
            this.retrieveMaxVal = true;
        }else{
            max = c.max;
        }

        this.slider.setMinValue(min);
        this.slider.setMaxValue(max);
        this.slider.setValue(values);
        if(this.retrieveMaxVal || this.retrieveStartMaxVal){
            this.getValues("#MAX#", filter);
        }
        if(this.retrieveMinVal || this.retrieveStartMinVal){
            this.getValues("#MIN#", filter);
        }
    },

    createSlider: function() {
        if (!this.slider) {
            var n = this.config.name;
            this.slider = Ext.create('Ext.slider.Multi', {
                id: n + "_extSlider",
                width: "100%",
                values: this.sliderType === "range" ? [0,0] : [0],
                increment: parseInt(this.config.filterConfig.step),
                minValue: 1,
                maxValue: 1,
                constrainThumbs: true,
                renderTo: n + "_slider",
                listeners: {
                    change: {
                        fn: this.sliderChange,
                        buffer: 500,
                        scope: this
                    }
                }
            });
        }
    },

    updateValues: function(minOrMax, response) {
        var value = parseInt(response.value);
        var values = this.slider.getValue();
        var c = this.config.filterConfig;

        if(minOrMax === "#MAX#"){
            if(this.retrieveMaxVal){
                this.slider.setMaxValue(value);
            }

            if(this.retrieveStartMaxVal){
                values[(this.sliderType === "range" ? 1 : 0)] = value;
            }else{
                if(this.retrieveMaxVal) {
                    // als de startwaarde niet wordt opgehaald, maar wel de grenswaarde, zal initieel de startwaarde op 0 staan doordat het wordt beperkt door de maxValue van de slider.
                    // zet daarom nogmaals de slider op de startwaarde
                    if(this.sliderType === "range"){
                        values [1] = c.start[1];
                    }else{
                        values[0] = c.start;
                    }
                }
            }
        }

        if(minOrMax === "#MIN#"){
            if(this.retrieveMinVal){
                this.slider.setMinValue(value);
            }

            if(this.retrieveStartMinVal){
                values [0] = value;
            }else{
                if(this.retrieveMinVal) {
                    // als de startwaarde niet wordt opgehaald, maar wel de grenswaarde, zal initieel de startwaarde op 0 staan doordat het wordt beperkt door de minValue van de slider.
                    // zet daarom nogmaals de slider op de startwaarde
                    values [0] = c.start[0];
                }
            }
        }
        this.startValues = values;
        this.slider.setValue(values);
    },
    applyFilter : function(){
        this.sliderChange();
    },
    sliderChange: function(slider) {
        if(!this.ready){
            // This function will be called via eventlistener
            return;
        }
        this.updateValueString(slider);
        var cql = this.getCQL();
        this.setFilter(cql);
    },
    updateValueString : function (slider){
        var formatString = this.config.filterConfig.valueFormatString;
        if(!slider || !formatString){
            return;
        }

        var name = this.config.name;
        var value = slider.getValue();

        var spanMin = name + "_min";
        var spanMax = name + "_max";
        var min = Ext.get(spanMin);
        var max = Ext.get(spanMax);
        if(this.sliderType === "range"){
            min.dom.innerHTML = Ext.util.Format.number(value[0],formatString);
            max.dom.innerHTML = Ext.util.Format.number(value[1],formatString);
        }else{
            var spanId = name+ "_value";
            var span = Ext.get(spanId);
            span.dom.innerHTML = Ext.util.Format.number(value,formatString);

            min.dom.innerHTML = this.slider.minValue;
            max.dom.innerHTML = this.slider.maxValue;
        }
    },
    getCQL : function(){
        var cql = "";
        var sliderType = this.config.filterConfig.sliderType ;
        var mustEscape = this.mustEscapeAttribute();
        if(sliderType === "range"){
            var min = (mustEscape ? "'" : "") + this.sanitizeValue(this.slider.getValue(0),mustEscape) + (mustEscape ? "'" : "");
            var max = (mustEscape ? "'" : "") + this.sanitizeValue(this.slider.getValue(1),mustEscape) + (mustEscape ? "'" : "");

            cql = this.config.attributeName + " >= " + min + " AND " + this.config.attributeName + " <= " + max;
        }else{
            var value = (mustEscape ? "'" : "") + this.sanitizeValue(this.slider.getValue(),mustEscape) + (mustEscape ? "'" : "");
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
    reset: function () {
        this.slider.setValue(this.startValues);
        this.callParent();
    }
});

Ext.define("viewer.components.sf.Numberrange", {
    extend: "viewer.components.sf.SimpleFilter",
    minField: null,
    maxField: null,
    config: {
        simpleFilter: null,
        name: "",
        label: "",
        attributeName: "",
        defaultValues: {
            Min: "",
            Max: ""
        }
    },
    constructor: function(conf) {
        this.initConfig(conf);
        viewer.components.sf.Numberrange.superclass.constructor.call(this, this.config);
        this.setDefaultValues();
        var templatecontents = [
            "<tr>",
                "<td colspan=\"3\">",
                    "<div class=\"simple-filter-field-label\">",
                        "<div id=\"{name}_fieldMin\"></div>",
                        "<div class=\"label\">{fieldLabelMin}</div>",
                    "</div>",
                    "<div class=\"simple-filter-field-label\">",
                        "<div id=\"{name}_fieldMax\"></div>",
                        "<div class=\"label\">{fieldLabelMax}</div>",
                    "</div>",
                "</td>",
            "</tr>"
        ];
        var t = this.wrapSimpleFilter(this.config.filterConfig.label, templatecontents);
        new Ext.Template(t).append(this.config.container, {
            label: this.config.filterConfig.label,
            name: this.config.name,
            fieldLabelMin: this.config.filterConfig.fieldLabelMin || "",
            fieldLabelMax: this.config.filterConfig.fieldLabelMax || ""
        });
        this.minField = this.createElement("Min");
        this.maxField = this.createElement("Max");
    },
    setDefaultValues: function() {
        if(!this.config.filterConfig.start) {
            this.config.filterConfig.start = "";
        }
        if(this.config.filterConfig.start === "min,max") {
            this.getValues("#MIN#");
            this.getValues("#MAX#");
            return;
        }
        var defaultValues = this.config.filterConfig.start.split(",");
        if(defaultValues.length === 1) {
            this.config.defaultValues.Min = defaultValues[0];
        } else if(defaultValues.length === 2) {
            this.config.defaultValues.Min = defaultValues[0];
            this.config.defaultValues.Max = defaultValues[1];
        }
    },
    updateValues: function(operator, response) {
        if(operator === "#MIN#") {
            this.config.defaultValues.Min = response.value;
            this.minField.setValue(response.value);
        }
        if(operator === "#MAX#") {
            this.config.defaultValues.Max = response.value;
            this.maxField.setValue(response.value);
        }
    },
    createElement : function (type) {
        var filterChangeDelay = 500;
        return Ext.create("Ext.form.field.Number", {
            renderTo: this.config.name + "_" + "field" + type,
            value: this.config.defaultValues[type],
            maxValue: (type === "Max" && this.config.filterConfig.max) ?  this.config.filterConfig.max : Number.MAX_VALUE,
            minValue: (type === "Min" && this.config.filterConfig.min) ?  this.config.filterConfig.min : 0,
            width: 75,
            listeners: {
                change: {
                    scope: this,
                    fn: function(){
                        this.applyFilter();
                    },
                    buffer: filterChangeDelay
                }
            }
        });
    },
    applyFilter : function(){
        var cql = this.getCQL();
        this.setFilter(cql);
    },
    getCQL : function(){
        var cql = [];
        var mustEscape = this.mustEscapeAttribute();
        var minVal = this.sanitizeValue(this.minField.getRawValue(),mustEscape);
        var maxVal = this.sanitizeValue(this.maxField.getRawValue(),mustEscape);
        if(minVal !== "" && Ext.isNumeric(minVal)) {
            minVal = (mustEscape ? "'" : "") + minVal + (mustEscape ? "'" : "");
            cql.push([this.config.attributeName, minVal].join(" >= "));
        }
        if(maxVal !== "" && Ext.isNumeric(maxVal)) {
            maxVal = (mustEscape ? "'" : "") + maxVal + (mustEscape ? "'" : "");
            cql.push([this.config.attributeName, maxVal].join(" <= "));
        }
        if(cql.length === 0) {
            return "";
        }
        return cql.join(" AND ");
    },
    reset : function(){
        this.minField.setValue(this.config.defaultValues.Min);
        this.maxField.setValue(this.config.defaultValues.Max);
        this.callParent();
        this.applyFilter();
    }
});


Ext.define("viewer.components.sf.Date", {
    extend: "viewer.components.sf.SimpleFilter",
    from:null,
    to:null,
    config: {
        name: "",
        label: "",
        attributeName: ""
    },
    constructor: function(conf) {
        this.initConfig(conf);
        viewer.components.sf.Date.superclass.constructor.call(this, this.config);
        var filterConfig = this.config.filterConfig;
        this.options = filterConfig.options;
        var t = this.wrapSimpleFilter(filterConfig.label, [
            "<tr>",
            "<td colspan=\"3\"><div id=\"{name}_datefrom\"></div></td>",
            "</tr>",
            "<tr>",
            "<td colspan=\"3\"><div id=\"{name}_dateto\"></div></td>",
            "</tr>"
        ]);
        new Ext.Template(t).append(this.config.container, {
            label: filterConfig.label,
            name: this.config.name
        });

        this.createDates();
    },
    createDates : function() {
        var pickers = [];
        var start = new Date(), end = new Date();
        if(this.config.filterConfig.start === 'curweek'){
            var curr = new Date; // get current date
            var first = curr.getDate() - curr.getDay()+ 1; // First day is the day of the month - the day of the week
            var last = first + 6; // last day is the first day + 6

            start = new Date(curr.setDate(first));
            end = new Date(curr.setDate(last));

        }
        if (this.config.filterConfig.datepickerType === "gt" || this.config.filterConfig.datepickerType === "bt"){
            this.from = Ext.create({
                xtype: 'datefield',
                anchor: '100%',
                fieldLabel: i18next.t('viewer_components_sf_simplefilterbase_0'),
                name: 'from_date',
                format:'d-m-Y',
                value: start,
                listeners: {
                    scope: this,
                    select: this.applyFilter
                }
            });
            pickers.push(this.from);
        }

        if (this.config.filterConfig.datepickerType === "lt" || this.config.filterConfig.datepickerType === "bt") {
            this.to = Ext.create({
                xtype: 'datefield',
                anchor: '100%',
                fieldLabel: i18next.t('viewer_components_sf_simplefilterbase_1'),
                name: 'to_date',
                value: end,
                format:'d-m-Y',
                listeners: {
                    scope: this,
                    select: this.applyFilter
                }
            });
            pickers.push(this.to);
        }
        Ext.create('Ext.form.Panel', {
            renderTo:  this.config.name + "_datefrom",/// Ext.getBody(),
            width: "100%",
            bodyPadding: 10,
            items: pickers
        });
    },
    applyFilter : function(){
        var cql = this.getCQL();
        this.setFilter(cql);
    },
    getCQL : function(){
        var cql = [];
        var mustEscape = this.mustEscapeAttribute();

        if(this.from){
            var val = Ext.Date.format(this.from.getValue(), "Y-m-d") + "T00:00:00";
            var c = this.config.attributeName + " >= " + val;
            cql.push(c);
        }

        if(this.to){
            var val = Ext.Date.format(this.to.getValue(), "Y-m-d") + "T00:00:00";
            var c = this.config.attributeName + " <= " + val;
            cql.push(c);
        }
        return cql.join(" AND ");
    },
    reset : function(){
        this.minField.setValue(this.config.defaultValues.Min);
        this.maxField.setValue(this.config.defaultValues.Max);
        this.callParent();
        this.applyFilter();
    }
});