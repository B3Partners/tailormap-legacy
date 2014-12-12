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

Ext.define ("viewer.components.MobileSlider", {
    extend: "Ext.util.Observable",
    xtype: "mobileslider",
    sliderid: '',
    labelid: '',
	eventTimer: null,
    config: {
        width: '100%',
        value: 0,
        increment: 1,
        fieldLabel: '',
        labelSeparator: ':',
        minValue: 0,
        maxValue: 100,
        renderTo: ''
    },
    constructor: function(conf){
        var me = this;
        this.initConfig(conf);
        this.render();
        this.addEvents('change', 'changecomplete');
        this.listeners = conf.listeners;
        this.callParent(arguments);
    },
    render: function() {
        var me = this;
        // Get new id
        me.sliderid = Ext.id();
        me.labelid = Ext.id();
        // Create the label
        var label = document.createElement('label');
        label.id = me.labelid;
        if(me.config.fieldLabel !== '') {
            label.innerHTML = me.config.fieldLabel;
        }
        if(me.config.labelSeparator !== '') {
            label.innerHTML += me.config.labelSeparator;
        }
        // Create the container
        var sliderContainer = document.createElement('div');
        sliderContainer.className = 'slidercomponent';
        if(me.config.width !== '100%') {
            sliderContainer.style.width = me.config.width;
        }
        // Create + and - controls
        var sliderMinControl = document.createElement('div');
        sliderMinControl.className = 'rangecontrol minrangecontrol';
        var sliderPlusControl = document.createElement('div');
        sliderPlusControl.className = 'rangecontrol plusrangecontrol';
        // Create range input
        var sliderObj = document.createElement('input');
        sliderObj.id = me.sliderid;
        sliderObj.type = 'range';
        sliderObj.min = me.config.minValue;
        sliderObj.max = me.config.maxValue;
        sliderObj.value = me.config.value;
        // Append inputs to container
        sliderContainer.appendChild(sliderMinControl); sliderContainer.appendChild(sliderObj); sliderContainer.appendChild(sliderPlusControl);
        document.getElementById(me.config.renderTo).appendChild(label);
        document.getElementById(me.config.renderTo).appendChild(sliderContainer);
        // Add click-hold functionality to + and - controls
        me.holdButton(sliderMinControl, 'subtract', sliderObj, 100, 2);
        me.holdButton(sliderPlusControl, 'add', sliderObj, 100, 2);
        // Add change listener to slider
        sliderObj.onchange = function() {
            me.sliderChanged( sliderObj, sliderObj.value );
        };
    },
    holdButton: function(btn, action, target, start, speedup) {
        var t, me = this;
        var changeSliderValue = function () {
            if(action == "add" && target.value < 100) target.value++;
            else if(action == "subtract" && target.value > 0) target.value--;
            else {
                clearTimeout(t);
                return;
            }
            t = setTimeout(changeSliderValue, start);
            start = start / speedup;
            me.sliderChanged(target, target.value);
        }
        if(MobileManager.hasHammer()) {
            var hammer = new Hammer(btn);
            hammer.onhold = changeSliderValue;
            hammer.onrelease = function(ev) {
                clearTimeout(t);
            };
        } else {
            btn.onclick = function() {
                changeSliderValue();
                clearTimeout(t);
            };
        }
    },
    sliderChanged:function (obj, value) {
        var me = this;
		// We use a small timer	 to make Android more responsive
		if(me.eventTimer !== null) clearTimeout(me.eventTimer);
        me.eventTimer = setTimeout(function() {
			me.fireEvent('change', obj, value);
            me.fireEvent('changecomplete', obj, value);
            if(me.config.tipText) {
                me.changeLabel(me.config.tipText(obj));
            }
		}, 50);
    },
    changeLabel: function(text) {
        var me = this;
        var newText = '';
        if(me.config.fieldLabel !== '') {
            newText = me.config.fieldLabel + ' ';
        }
        if(me.config.labelSeparator !== '') {
            text += me.config.labelSeparator;
        }
        document.getElementById(me.labelid).innerHTML = newText + text;
    },
    setValue: function(value) {
        var me = this;
        if(me.sliderid !== "") {
            var sliderObj = document.getElementById(me.sliderid);
            sliderObj.value = value;
            me.sliderChanged(sliderObj, value);
        }
    },
    getValue: function() {
        if(this.sliderid !== "") {
            return document.getElementById(this.sliderid).value;
        }
        return 0;
    },
    getId: function() {
        return this.sliderid;
    }
});