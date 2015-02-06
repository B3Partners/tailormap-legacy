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
/**
 * Custom configuration object for HTML configuration
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define("viewer.components.CustomConfiguration",{
    extend: "viewer.components.ConfigObject",
    htmlEditor: null,
    constructor: function (parentid,config){
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentid,config);
        //create html Editor
        var value="";
        var title="";
        if (config) {
            if(config.html) value=config.html;
            if(config.title) title=config.title;
        }
        
        Ext.tip.QuickTipManager.init();  // enable tooltips
        this.titleField = Ext.create('Ext.form.field.Text', {
            fieldLabel: 'Titel (optioneel, wordt gebruikt voor tabbladen)',
            name: 'title',
            value: title,
            labelWidth: 275,
            width: 500,
            renderTo: Ext.get(parentid)
        });
        this.loadScriptsField = Ext.create('Ext.form.field.Checkbox', {
            fieldLabel: 'JavaScript in HTML bron uitvoeren',
            name: 'loadScripts',
            checked: config && config.loadScripts != undefined ? config.loadScripts : false,
            inputValue: true,
            labelWidth: 275,
            width: 500,
            renderTo: Ext.get(parentid)
        });        
        this.htmlEditor=Ext.create('Ext.form.HtmlEditor', {
            width: 750,
            height: 460,
            value: value,
            renderTo: Ext.get(parentid) ,
            plugins: [
                new Ext.create('Ext.ux.form.HtmlEditor.imageUpload', Ext.apply(defaultImageUploadConfig, {
                    submitUrl: actionBeans['imageupload'],
                    managerUrl: Ext.urlAppend(actionBeans['imageupload'], "manage=t")
                })),
                new Ext.ux.form.HtmlEditor.Table(defaultHtmleditorTableConfig)
            ]
        });
        this.htmlEditor.focus(false, true);
        return this;
    },
    getConfiguration: function(){
        var config = new Object();
        config.html= this.htmlEditor.getValue();
        config.title= this.titleField.getValue();
        config.loadScripts = this.loadScriptsField.getValue();
        return config;
    },
    windowHide: function() {
        // IE8 still showed HTML editor iframe after closing window so we manually hide the HTML editor
        this.htmlEditor.hide();
    }
});