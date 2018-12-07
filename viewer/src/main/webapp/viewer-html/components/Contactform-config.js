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
 * Custom configuration object for Contactform configuration
 * @author <a href="mailto:geertplaisier@b3partners.nl">Geert Plaisier</a>
 */
Ext.define("viewer.components.CustomConfiguration", {
    extend: "viewer.components.SelectionWindowConfig",
    constructor: function (parentId, configObject, configPage) {
        if (configObject === null){
            configObject = {};
        }
        configObject.showLabelconfig = true;
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentId, configObject, configPage);
        this.form.add([
            {
                xtype: 'fieldset',
                title: i18next.t('contactform_config_receiversettings_title'),
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                items: [
                    {
                        xtype: 'textfield',
                        fieldLabel: i18next.t('contactform_config_receiver_to'),
                        name: 'receiverTo',
                        value: this.configObject.receiverTo != undefined ? this.configObject.receiverTo : "",
                        labelWidth: this.labelWidth
                    },
                    {
                        xtype: 'textfield',
                        fieldLabel: i18next.t('contactform_config_receiver_subject'),
                        name: 'receiverSubject',
                        value: this.configObject.receiverSubject != undefined ? this.configObject.receiverSubject : "",
                        labelWidth: this.labelWidth
                    }
                ]
            },
            {
                xtype: 'fieldset',
                title: i18next.t('contactform_config_formsettings_title'),
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                items: [
                    {
                        xtype: 'textfield',
                        fieldLabel: i18next.t('contactform_config_name_label'),
                        name: 'nameLabel',
                        value: this.configObject.nameLabel != undefined ? this.configObject.nameLabel : "",
                        labelWidth: this.labelWidth
                    },
                    {
                        xtype: 'textfield',
                        fieldLabel: i18next.t('contactform_config_email_label'),
                        name: 'emailLabel',
                        value: this.configObject.emailLabel != undefined ? this.configObject.emailLabel : "",
                        labelWidth: this.labelWidth
                    },
                    {
                        xtype: 'textfield',
                        fieldLabel: i18next.t('contactform_config_message_label'),
                        name: 'messageLabel',
                        value: this.configObject.messageLabel != undefined ? this.configObject.messageLabel : "",
                        labelWidth: this.labelWidth
                    },
                    {
                        xtype: 'textfield',
                        fieldLabel: i18next.t('contactform_config_submit_label'),
                        name: 'submitLabel',
                        value: this.configObject.submitLabel != undefined ? this.configObject.submitLabel : "",
                        labelWidth: this.labelWidth
                    },
                    {
                        xtype: 'htmleditor',
                        fieldLabel: i18next.t('contactform_config_text_before'),
                        name: 'textBefore',
                        value: this.configObject.textBefore != undefined ? this.configObject.textBefore : "",
                        labelWidth: this.labelWidth,
                        height: 250,
                        plugins: [
                            new Ext.create('Ext.ux.form.HtmlEditor.imageUpload', Ext.apply(vieweradmin.components.DefaultConfgurations.getDefaultImageUploadConfig(), {
                                submitUrl: this.getActionBeanUrl('imageupload'),
                                managerUrl: Ext.urlAppend(this.getActionBeanUrl('imageupload'), "manage=t")
                            })),
                            new Ext.ux.form.HtmlEditor.Table(vieweradmin.components.DefaultConfgurations.getDefaultHtmlEditorTableConfig())
                        ]
                    },
                    {
                        xtype: 'htmleditor',
                        fieldLabel: i18next.t('contactform_config_text_after'),
                        name: 'textAfter',
                        value: this.configObject.textAfter != undefined ? this.configObject.textAfter : "",
                        labelWidth: this.labelWidth,
                        height: 250,
                        plugins: [
                            new Ext.create('Ext.ux.form.HtmlEditor.imageUpload', Ext.apply(vieweradmin.components.DefaultConfgurations.getDefaultImageUploadConfig(), {
                                submitUrl: this.getActionBeanUrl('imageupload'),
                                managerUrl: Ext.urlAppend(this.getActionBeanUrl('imageupload'), "manage=t")
                            })),
                            new Ext.ux.form.HtmlEditor.Table(vieweradmin.components.DefaultConfgurations.getDefaultHtmlEditorTableConfig())
                        ]
                    }
                ]
            },
            {
                xtype: 'fieldset',
                title: i18next.t('contactform_config_alertsettings_title'),
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                items: [
                    {
                        xtype: 'htmleditor',
                        fieldLabel: i18next.t('contactform_config_thankyoumessage'),
                        name: 'thankyouMessage',
                        value: this.configObject.thankyouMessage != undefined ? this.configObject.thankyouMessage : i18next.t('contactform_config_thankyoumessagedefault'),
                        labelWidth: this.labelWidth,
                        height: 250,
                        plugins: [
                            new Ext.create('Ext.ux.form.HtmlEditor.imageUpload', Ext.apply(vieweradmin.components.DefaultConfgurations.getDefaultImageUploadConfig(), {
                                submitUrl: this.getActionBeanUrl('imageupload'),
                                managerUrl: Ext.urlAppend(this.getActionBeanUrl('imageupload'), "manage=t")
                            })),
                            new Ext.ux.form.HtmlEditor.Table(vieweradmin.components.DefaultConfgurations.getDefaultHtmlEditorTableConfig())
                        ]
                    },
                    {
                        xtype: 'htmleditor',
                        fieldLabel: i18next.t('contactform_config_errormessage'),
                        name: 'errorMessage',
                        value: this.configObject.errorMessage != undefined ? this.configObject.errorMessage : i18next.t('contactform_config_errormessagedefault'),
                        labelWidth: this.labelWidth,
                        height: 250,
                        plugins: [
                            new Ext.create('Ext.ux.form.HtmlEditor.imageUpload', Ext.apply(vieweradmin.components.DefaultConfgurations.getDefaultImageUploadConfig(), {
                                submitUrl: this.getActionBeanUrl('imageupload'),
                                managerUrl: Ext.urlAppend(this.getActionBeanUrl('imageupload'), "manage=t")
                            })),
                            new Ext.ux.form.HtmlEditor.Table(vieweradmin.components.DefaultConfgurations.getDefaultHtmlEditorTableConfig())
                        ]
                    }
                ]
            },
        ]);
    },
    getDefaultValues: function() {
        return {
            details: {
                minWidth: 450,
                minHeight: 250
            }
        }
    }
});

