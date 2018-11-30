/* 
 * Copyright (C) 2012-2018 B3Partners B.V.
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
 * Contactform component
 * @author <a href="mailto:geertplaisier@b3partners.nl">Geert Plaisier</a>
 */
Ext.define ("viewer.components.Contactform",{
    extend: "viewer.components.Component",
    form: null,
    config:{
        title: null,
        titlebarIcon: null,
        tooltip: null,
        label: "",
        nameLabel: "",
        emailLabel: "",
        messageLabel: "",
        submitLabel: "",
        details: {
            minWidth: 450,
            minHeight: 330,
            useExtLayout: true
        }
    },
    constructor: function (conf) {
        if(!Ext.isDefined(conf.showLabels)) conf.showLabels = true; 
        this.initConfig(conf);
		viewer.components.Contactform.superclass.constructor.call(this, this.config);
		this.loadWindow();
        return this;
    },
    loadWindow: function() {
        var formItems=[
            {
                xtype: 'textfield',
                fieldLabel: this.config.nameLabel || i18next.t('viewer_components_contactform_name'),
                name: 'name',
                required: true
            },
            {
                xtype: 'textfield',
                fieldLabel: this.config.emailLabel || i18next.t('viewer_components_contactform_email'),
                name: 'email',
                required: true
            },
            {
                xtype: 'textarea',
                fieldLabel: this.config.messageLabel || i18next.t('viewer_components_contactform_message'),
                name: 'message',
                required: true,
                height: 80
            },
            {
                xtype: 'button',
                text: this.config.submitLabel || i18next.t('viewer_components_contactform_submit'),
                listeners: {
                    click: {
                        scope: this,
                        fn: this.sendMessage
                    }
                }
            }
        ];
        this.form = new Ext.form.FormPanel({
            frame: false,
            border: 0,
            width: '100%',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            padding: '5px',
            items: formItems,
            scrollable: true
        });
        this.getContentContainer().add(this.form);
    },
    sendMessage: function() {
        Ext.Ajax.request({
            url: actionBeans["contact"],
            params: {
                application: FlamingoAppLoader.get("appId"),
                params: Ext.JSON.encode(this.form.getValues())
            },
            success: function(result) {
                var response = result.responseText;
                Ext.MessageBox.alert(i18next.t('viewer_components_contactform_success_title'), i18next.t('viewer_components_contactform_success_message'));
            },
            failure: function(result) {
                Ext.MessageBox.alert(i18next.t('viewer_components_contactform_failed_title'), i18next.t('viewer_components_contactform_failed_message'));
            }
        });
    },
    getExtComponents: function() {
        return [ this.form.getId() ];
    }
});