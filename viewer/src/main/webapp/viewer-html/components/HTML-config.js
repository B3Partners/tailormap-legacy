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
/**
 * Custom configuration object for HTML configuration
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define("viewer.components.CustomConfiguration",{
    extend: "viewer.components.ConfigObject",
    htmlEditor: null,
    constructor: function (parentId, configObject, configPage) {
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentId, configObject, configPage);
        //create html Editor
        var value="";
        var title="";
        if(this.configObject.html) value=this.configObject.html;
        if(this.configObject.title) title=this.configObject.title;
        
        Ext.tip.QuickTipManager.init();  // enable tooltips
        this.titleField = Ext.create('Ext.form.field.Text', {
            fieldLabel: i18next.t('html_config_0'),
            name: 'title',
            value: title,
            labelWidth: 275,
            width: 500,
            renderTo: Ext.get(parentId)
        });
        this.loadScriptsField = Ext.create('Ext.form.field.Checkbox', {
            fieldLabel: i18next.t('html_config_1'),
            name: 'loadScripts',
            checked: this.configObject && this.configObject.loadScripts != undefined ? this.configObject.loadScripts : false,
            inputValue: true,
            labelWidth: 275,
            width: 500,
            renderTo: Ext.get(parentId)
        });        
        this.htmlEditor=Ext.create('Ext.form.HtmlEditor', {
            width: 750,
            height: 460,
            value: value,
            renderTo: Ext.get(parentId) ,
            plugins: [
                new Ext.create('Ext.ux.form.HtmlEditor.imageUpload', Ext.apply(vieweradmin.components.DefaultConfgurations.getDefaultImageUploadConfig(), {
                    submitUrl: this.getActionBeanUrl('imageupload'),
                    managerUrl: Ext.urlAppend(this.getActionBeanUrl('imageupload'), "manage=t")
                })),
                new Ext.ux.form.HtmlEditor.Table(vieweradmin.components.DefaultConfgurations.getDefaultHtmlEditorTableConfig())
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