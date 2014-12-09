/*
 * Copyright (C) 2012-2013 Geert Plaisier
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

Ext.define ("viewer.components.MobileCombobox", {
    extend: "Ext.form.field.Base",
    alias: "widget.mobilecombo",
    options: null,
    fieldSubTpl: ['<select id="{id}" ', '<tpl if="name">name="{name}" </tpl>', '<tpl if="tabIdx">tabIndex="{tabIdx}" </tpl>', 'class="{fieldCls} {typeCls}">{options}</select>', {compiled: true, disableFormats: true}],
    inputType: 'select',
    focusCls: '',
    emptyIndex: null,
    inputEl: {
        dom: {}
    },
    prevValue: null,
    renderComplete: false,
    config: {
        // Label before select
        fieldLabel: '',
        // First (empty) option
        emptyText: '',
        // Ext.data.Store, array or Ext.data.Store config object
        store: null,
        // Name of the field that holds the select-display value in the store
        displayField: 'text',
        // Name of the field that holds the select-value value in the store
        valueField: 'id',
        // Add listeners to config
        listeners: {},
        // Optional to render field to an element (provide id)
        renderTo: '',
        // optional default value
        value: '',
        // optional width
        width: '100%',
        // boolean for default disabled
        disabled: false,
        // element id
        id: '',
        // element name
        name: '',
        // element labelwidth
        labelWidth: 150,
        // element style
        style: {},
        // hidden or not
        hidden: false,
        // default empty text class
        emptyCls: 'x-form-empty-field'
    },
    constructor: function(conf){
        // init config
        this.initConfig(conf);
        // set id
        if(this.id === '') this.id = Ext.id();
        // bind listeners
        this.listeners = conf.listeners;
        // bind the store, get config back
        conf = this.bindStore(conf);
        // call parent with provided arguments
        this.callParent(arguments);
        // bind change event
        this.bindChangeEvent();
        // set render complete
        this.renderComplete = true;
    },
    /**
     * Bind the store. Converts arrays or config objects to stores.
     */
    bindStore: function(conf) {
        var me = this;
        if(Ext.isArray(me.store)) {
            var fields = [ me.valueField, me.displayField ];
            // store can be a 1-or-2-dimensional array, so create store from array
            if(me.store.length > 0 && !Ext.isArray(me.store[0])) {
                // if the store is a 1-dimensional array, make display and value field the same
                // and add convert function (needed by Ext to support 1-dimensional arrays)
                me.displayField = me.valueField;
                fields = [ {name: me.valueField, convert: function(value, record) {
                    return record.raw;
                }} ];
            }
            // store is now always a 2-dimensional array so we can create a store from it
            me.store = Ext.create('Ext.data.ArrayStore', {
                fields: fields,
                data: me.store
            });
        } else if(!(me.store instanceof Ext.data.AbstractStore)) {
            // provided store can also be a store config object, create store from it
            me.store = Ext.create('Ext.data.ArrayStore', me.store);
        }
        // update the selectbox when the array store changes
        me.store.on('datachanged', function() {
            me.updateSelect();
        });
        // create options from the loaded store
        me.createOptionsFromStore();
        // we have to set the conf store to our newly created store (in case of arrays)
        // to provide the parent with the right store
        conf.store = me.store;
        return conf;
    },
    /**
     * Apply styles, disabled, hidden after render
     */
    afterRender: function() {
        var me = this;
        if(me.width) {
            me.inputEl.setWidth(me.width);
        }
        if(me.style && !me.style.width) {
            me.inputEl.setStyle(me.style);
        }
        if(me.disabled) {
            me.setDisabled(me.disabled);
        }
        if(me.hidden) {
            me.inputEl.setVisible(!me.hidden);
        }
    },
    onFocus: function() {
        // do nothing on focus, otherwise gives error when using renderTo
    },
    bindChangeEvent: function() {
        var me = this;
        if (me.inputEl.dom.addEventListener) {
          me.inputEl.dom.addEventListener('change', function() { me.fireChangeEvent(); }, false);
        } else if (me.inputEl.dom.attachEvent)  {
          me.inputEl.dom.attachEvent('change', function() { me.fireChangeEvent(); });
        }
        me.prevValue = me.getValue();
    },
    fireChangeEvent: function() {
        this.fireEvent('change', this, this.getValue(), this.prevValue, {});
    },
    /**
     * Iterate over the store and create option fields from it
     * @return array options
     */
    createOptionsFromStore: function() {
        var me = this, counter = 0, currentValue = me.getValue();
        me.options = [];
        // if there is an emptytext specified, add emptytext as first option
        if(me.emptyText) {
            me.emptyIndex = counter;
            me.options.push({
                index: counter++,
                display: me.emptyText,
                value: '',
                html: '<option value="" class="'+this.emptyCls+'">' + me.emptyText + '</option>'
            });
        }
        // iterate over store and create options item for each value
        me.store.each(function(record) {
            var value = record.get(me.valueField), display = record.get(me.displayField), htmlValue = Ext.isObject(value) ? Ext.id() : value;
            me.options.push({
                index: counter++,
                display: display,
                value: value,
                html: '<option value="' + htmlValue + '"' + (value == currentValue ? ' selected="selected"' : '') + '>' + display + '</option>'
            });
        });
        me.prevValue = currentValue;
        return me.options;
    },
    /**
     * Create HTML from options array
     * @return string optionsHtml
     */
    getOptionsHTML: function() {
        var me = this;
        if(me.options === null) me.createOptionsFromStore();
        var optionsHTML = '';
        for(var i = 0; i < me.options.length; i++) {
            optionsHTML += me.options[i].html;
        }
        return optionsHTML;
    },
    /**
     * Get template data
     * @return object
     */
    getSubTplData: function() {
        var me = this, inputId = me.getInputId();
        return {
            id: inputId,
            cmpId: me.id,
            name: this.name || '',
            tabIdx: this.tabIndex || null,
            fieldCls: '',
            typeCls: '',
            options: this.getOptionsHTML()
        };
    },
    /**
     * Updates the select field. Triggered when the store changes
     */
    updateSelect: function() {
        this.createOptionsFromStore();
        this.inputEl.dom.innerHTML = this.getOptionsHTML();
    },
    /**
     * Return the store
     * @return Ext.data.Store
     */
    getStore: function() {
        return this.store;
    },
    /**
     * Set the value of the selectbox. If the value is not present in one of the
     * options, nothing happens
     */
    setValue: function(value) {
        if(value == null){
            this.clearValue();
        }else{
            var me = this;
            for(var i = 0; i < me.options.length; i++) {
                if(me.options[i].value == value) me.inputEl.dom.selectedIndex = me.options[i].index;
            }
            if(this.rendered) me.fireChangeEvent();
        }
    },
    /**
     * Alternative for setValue function
     * @return string select value
     */
    select: function(value) {
        this.setValue(value);
    },
    /**
     * Get the value from the selectbox
     * @return string select value
     */
    getValue: function() {
        if(!this.rendered) return null;
        for(var i = 0; i < this.options.length; i++) {
            if(this.options[i].index === this.inputEl.dom.selectedIndex) return this.options[i].value;
        }
        return null;
    },
    /**
     * Get the raw HTML value
     */
    getRawValue: function() {
        if(this.inputEl.dom.selectedIndex === -1) return '';
        var selectValue = this.inputEl.dom[this.inputEl.dom.selectedIndex];
        if(typeof selectValue === "undefined") return '';
        return selectValue.value;
    },
    /**
     * Clears the selectbox and selects first item
     * @return {[type]} [description]
     */
    clearValue: function() {
        this.inputEl.dom.selectedIndex = 0;
    },
    /**
     * Disables/Enables select box
     * @param boolean true to disabled, false to enable
     */
    setDisabled: function(bool) {
        this.inputEl.dom.disabled = bool;
        if(this.rendered) this.callParent(arguments);
    },
    /**
     * Get the id
     * @return string id
     */
    getId: function() {
        return this.sliderid;
    },
    /**
     * Set the element visible
     */
    setVisible: function(visible) {
        viewer.components.MobileCombobox.superclass.setVisible.call(this, visible);
        this.inputEl.setVisible(visible);
    }
});