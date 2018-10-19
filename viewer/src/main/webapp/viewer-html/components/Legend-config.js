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
 * Custom configuration object for Legend configuration
 * @author <a href="mailto:geertplaisier@b3partners.nl">Geert Plaisier</a>
 */
Ext.define("viewer.components.CustomConfiguration",{
    extend: "viewer.components.ConfigObject",
    htmlEditor: null,
    constructor: function (parentId, configObject, configPage) {
        if (configObject === null){
            configObject = {};
        }
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentId, configObject, configPage);

        this.htmlEditor = Ext.create('Ext.form.HtmlEditor', {
            width: 700,
            height: 400,
            margin: '10 0 0 0',
            value: configObject.infoText || '',
            name: 'infoText',
            fieldLabel: i18next.t('legend_config_0'),
            labelWidth: 100,
            plugins: [
                new Ext.create('Ext.ux.form.HtmlEditor.imageUpload', Ext.apply(vieweradmin.components.DefaultConfgurations.getDefaultImageUploadConfig(), {
                    submitUrl: this.getActionBeanUrl('imageupload'),
                    managerUrl: Ext.urlAppend(this.getActionBeanUrl('imageupload'), "manage=t")
                })),
                new Ext.ux.form.HtmlEditor.Table(vieweradmin.components.DefaultConfgurations.getDefaultHtmlEditorTableConfig())
            ]
        });

        this.form = new Ext.form.FormPanel({
            frame: false,
            bodyPadding: this.formPadding,
            width: this.formWidth,
            /*defaults: {
                anchor: '100%'
            },*/
            items: [{
                xtype: 'textfield',
                fieldLabel: i18next.t('legend_config_1'),
                name: 'title',
                value: configObject.hasOwnProperty("title") ? configObject.title : ___('Legenda'),
                labelWidth: this.labelWidth
            },
            {
                xtype: 'textfield',
                fieldLabel: i18next.t('legend_config_2'),
                name: 'margin',
                value: configObject.margin || '0px',
                labelWidth: this.labelWidth
            },
            { 
                xtype: 'checkbox',
                fieldLabel: i18next.t('legend_config_3'),
                name: 'showBackground',
                inputValue: true,
                value: configObject.showBackground || false,
                labelWidth: this.labelWidth
            },
            { 
                xtype: 'checkbox',
                fieldLabel: i18next.t('legend_config_4'),
                name: 'showInlineLegend',
                inputValue: true,
                value: configObject.showInlineLegend || false,
                labelWidth: this.labelWidth
            },
            this.htmlEditor],
            renderTo: this.parentId//(2)
        });
        return this;
    },
    windowHide: function() {
        // IE8 still showed HTML editor iframe after closing window so we manually hide the HTML editor
        this.htmlEditor.hide();
    }
});

