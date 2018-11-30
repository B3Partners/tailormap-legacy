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
                xtype: 'textfield',
                fieldLabel: i18next.t('contactform_config_name_label'),
                name: 'nameLabel',
                value: this.configObject.nameLabel != undefined ? this.configObject.nameLabel : "",
                labelWidth: this.labelWidth,
                width: 500
            },
            {
                xtype: 'textfield',
                fieldLabel: i18next.t('contactform_config_email_label'),
                name: 'emailLabel',
                value: this.configObject.emailLabel != undefined ? this.configObject.emailLabel : "",
                labelWidth: this.labelWidth,
                width: 500
            },
            {
                xtype: 'textfield',
                fieldLabel: i18next.t('contactform_config_message_label'),
                name: 'messageLabel',
                value: this.configObject.messageLabel != undefined ? this.configObject.messageLabel : "",
                labelWidth: this.labelWidth,
                width: 500
            },
            {
                xtype: 'textfield',
                fieldLabel: i18next.t('contactform_config_submit_label'),
                name: 'submitLabel',
                value: this.configObject.submitLabel != undefined ? this.configObject.submitLabel : "",
                labelWidth: this.labelWidth,
                width: 500
            }
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

