/* 
 * Copyright (C) 2012-2013 B3Partners B.V.
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


Ext.define('Ext.ux.ColorField', {
    extend: 'Ext.form.field.Text',
    alias: 'widget.colorfield',    
    requires: ['Ext.form.field.VTypes'],

    lengthText: "Hexadecimale Kleurwaarde moet of 3 of 6 karakters bevatten.",
    blankText: "Moet een hexacecimale waarden hebben in het format ABCDEF.",
    
    regex: /^[0-9a-f]{3,6}$/i,
    
    triggers: {
        color: {
            handler: function(colorField, trigger, e) {
                colorField.onTriggerClick(e);
            }
        }
    },
    
    validateValue : function(value){
        if(this.showText != undefined && !this.showText){
            return true;
        }
        if(!this.getEl()) {
            return true;
        }
        if(value.length!=3 && value.length!=6) {
            this.markInvalid(Ext.String.format(this.lengthText, value));
            return false;
        }
        if((value.length < 1 && !this.allowBlank) || !this.regex.test(value)) {
            this.markInvalid(Ext.String.format(this.blankText, value));
            return false;
        }
        
        this.markInvalid();
        this.setColor(value);
        return true;
    },

    markInvalid : function( msg ) {
        Ext.ux.ColorField.superclass.markInvalid.call(this, msg);
        this.inputEl.setStyle({
            'background-image': 'url(../resources/themes/images/gray/grid/invalid_line.gif)'
        });
    },
    
    setValue : function(hex){
        if(this.showText == undefined || this.showText){
            Ext.ux.ColorField.superclass.setValue.call(this, hex);
        }
        this.setColor(hex);
    },
    
    setColor : function(hex) {
        Ext.ux.ColorField.superclass.setFieldStyle.call(this, {
            'background-color': '#' + hex,
            'background-image': 'none'
        });
    },

    menuListeners : {
        select: function(m, d){
            this.setValue(d);
            this.fireEvent("select",d);
        },
        show : function(){
            this.onFocus();
        },
        hide : function(){
            this.focus();
            var ml = this.menuListeners;
            this.menu.un("select", ml.select,  this);
            this.menu.un("show", ml.show,  this);
            this.menu.un("hide", ml.hide,  this);
        }
    },
    
    onTriggerClick : function(e){
        if(this.disabled){
            return;
        }
        
        this.menu = new Ext.menu.ColorPicker({
            shadow: true,
            autoShow : true
        });
        this.menu.alignTo(this.inputEl, 'tl-bl?');
        this.menu.updateLayout();
        
        this.menu.on(Ext.apply({}, this.menuListeners, {
            scope:this
        }));
        
        this.menu.show(this.inputEl);
    }
});