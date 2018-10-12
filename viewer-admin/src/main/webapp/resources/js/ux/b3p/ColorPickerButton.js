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

Ext.define('Ext.ux.b3p.ColorPickerButton', {
    regex: /^#([0-9a-fA-F]{3})([0-9a-fA-F]{3})?$/i,
    currentColor: '#FFFFFF',
    textField: null,
    renderTo: '',
    buttonId: '',
    colorPicker: null,
    constructor: function(config) {
        Ext.apply(this, config || {});
        var me = this;
        me.buttonId = Ext.id();
        if(me.startColor) me.currentColor = me.startColor;
        else if(me.defaultColor) me.currentColor = me.defaultColor;
        me.textField = Ext.get(config.textfield);
        
        me.renderColorpicker();
        me.appendTextfieldListener();
        
        if(Ext.Array.contains(me.colorPicker.colors, me.currentColor.substring(1))) {
            me.colorPicker.select(me.currentColor.substring(1));
        }
        
        if(Ext.isDefined(me.openOnLeft) && me.openOnLeft === true) {
            me.colorPicker.el.setStyle({
                marginLeft: '-145px'
            });
        }
        
        if(Ext.isDefined(me.openOnTop) && me.openOnTop === true) {
            me.colorPicker.el.setStyle({
                marginTop: '-90px',
                marginLeft: '0px'
            });
        }
    },
    renderColorpicker: function() {
        var me = this;
        me.button = Ext.create('Ext.button.Button', {
            text: i18next.t('viewer_admin_colorpickerbutton_0'),
            width: 20,
            height: 20,
            style: {
                margin: '4px 1px 1px 3px',
                backgroundColor: '#f3f3f3',
                border: '1px solid #9d9d9d',
                padding: '2px'
            },
            renderTo: me.renderTo,
            handler: function() {
                me.colorPicker.setVisible(!me.colorPicker.isVisible());
            }
        });
        me.colorPicker = Ext.create('Ext.picker.Color', {
            renderTo: me.renderTo,
            hidden: true,
            style: {
                position: 'absolute',
                marginLeft: '23px',
                backgroundColor: '#FFFFFF',
                zIndex: '99999'
            },
            listeners: {
                select: function(picker, selColor) {
                    picker.hide();
                    me.currentColor = '#' + selColor;
                    me.textField.set({
                        'value': '#' + selColor
                    });
                    me.button.btnWrap.setStyle({
                        backgroundColor: '#' + selColor
                    });
                }
            }
        });
    },
    appendTextfieldListener: function() {
        var me = this;
        me.textField.addListener('keyup', function() {
            var color = me.textField.getValue();
            var selColor = me.currentColor;
            if(me.regex.test(color)) selColor = color;
            me.button.btnWrap.setStyle({
                backgroundColor: selColor
            });
        });
    }
});
