/* 
 * Copyright (C) 2012 B3Partners B.V.
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
 * Custom configuration object for LayerContext configuration
 * @author <a href="mailto:geertplaisier@b3partners.nl">Geert Plaisier</a>
 */
Ext.define("viewer.components.CustomConfiguration",{
    extend: "viewer.components.SelectionWindowConfig",
    htmlEditor: null,
    constructor: function (parentId, configObject, configPage) {        
        if (configObject === null){
            configObject = {};
        }
        configObject.showLabelconfig = false;
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentId, configObject, configPage);
        
        var defaultText="";
        if (configObject && configObject.defaultText) {
            defaultText = configObject.defaultText;
        }
        this.htmlEditor=Ext.create('Ext.form.HtmlEditor', {
            width: 700,
            height: 400,
            margin: '10 0 0 0',
            value: defaultText,
            name: 'defaultText',
            fieldLabel: i18next.t('viewer_components_customconfiguration_101'),
            labelWidth: 100,
            plugins: [
                new Ext.create('Ext.ux.form.HtmlEditor.imageUpload', Ext.apply(vieweradmin.components.DefaultConfgurations.getDefaultImageUploadConfig(), {
                    submitUrl: this.getActionBeanUrl('imageupload'),
                    managerUrl: Ext.urlAppend(this.getActionBeanUrl('imageupload'), "manage=t")
                })),
                new Ext.ux.form.HtmlEditor.Table(vieweradmin.components.DefaultConfgurations.getDefaultHtmlEditorTableConfig())
            ]
        });
        this.form.add(this.htmlEditor);
        this.htmlEditor.focus(false, true);
        return this;
    },
    windowHide: function() {
        // IE8 still showed HTML editor iframe after closing window so we manually hide the HTML editor
        this.htmlEditor.hide();
    },
    getDefaultValues: function() {
        return {
            details: {
                minWidth: 400,
                minHeight: 250
            }
        }
    }
});

