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
        textBefore: "",
        textAfter: "",
        thankyouMessage: "",
        errorMessage: "",
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
        var formItems = [
            {
                xtype: 'container',
                itemId: 'textBeforeContainer',
                cls: 'contactform-text-before',
                html: ''
            },
            {
                xtype: 'textfield',
                fieldLabel: this.config.nameLabel || i18next.t('viewer_components_contactform_name'),
                name: 'name',
                allowBlank: false
            },
            {
                xtype: 'textfield',
                fieldLabel: this.config.emailLabel || i18next.t('viewer_components_contactform_email'),
                name: 'email',
                vtype: 'email',
                allowBlank: false
            },
            {
                xtype: 'textarea',
                fieldLabel: this.config.messageLabel || i18next.t('viewer_components_contactform_message'),
                name: 'message',
                allowBlank: false,
                height: 80
            },
            {
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    pack: 'end'
                },
                items: [
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
                ]
            },
            {
                xtype: 'container',
                itemId: 'textAfterContainer',
                cls: 'contactform-text-after',
                html: ''
            }
        ];

        this.form = Ext.create('Ext.form.Panel', {
            frame: false,
            border: 0,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: formItems,
            cls: 'contactform'
        });

        this.messageContainer = Ext.create('Ext.container.Container', {
            cls: 'contactform-message',
            html: ''
        });

        this.container = Ext.create('Ext.container.Container', {
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            scrollable: true,
            padding: '5px',
            items: [
                this.messageContainer,
                this.form
            ]
        })

        this.getContentContainer().setHtml('');
        this.getContentContainer().removeAll();
        this.getContentContainer().add(this.container);

        if (this.config.textBefore) Ext.ComponentQuery.query("#textBeforeContainer")[0].setHtml(this.config.textBefore);
        if (this.config.textAfter) Ext.ComponentQuery.query("#textAfterContainer")[0].setHtml(this.config.textAfter);
    },
    sendMessage: function() {
        if(!this.form.isValid()) {
            return;
        }
        Ext.Ajax.request({
            url: actionBeans["contact"],
            params: {
                application: FlamingoAppLoader.get("appId"),
                params: Ext.JSON.encode(this.form.getValues())
            },
            success: function(result) {
                var response = Ext.JSON.decode(result.responseText);
                if (!response.success) {
                    this.showError(response.message);
                    return;
                }
                this.form.setVisible(false);
                this.messageContainer.removeCls('alert-message error');
                this.messageContainer.addCls('alert-message success');
                this.messageContainer.setHtml(this.config.thankyouMessage || i18next.t('viewer_components_contactform_success_message'));
            },
            failure: function(result) {
                this.showError();
            },
            scope: this
        });
    },
    showError: function(message) {
        this.messageContainer.removeCls('alert-message success');
        this.messageContainer.addCls('alert-message error');
        this.messageContainer.setHtml(message || this.config.errorMessage || i18next.t('viewer_components_contactform_failed_message'));
    },
    getExtComponents: function() {
        return [ this.form.getId() ];
    }
});