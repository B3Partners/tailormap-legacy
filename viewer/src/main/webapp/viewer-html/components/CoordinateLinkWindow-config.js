/*
 * Copyright (C) 2016 B3Partners B.V.
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
Ext.define("viewer.components.CustomConfiguration",{
    extend: "viewer.components.SelectionWindowConfig",
    form: null,
    constructor: function (parentId, configObject, configPage) {
        configObject.showLabelconfig =true;
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentId, configObject, configPage);
      
        var me = this;

        this.form.add([
            {
                xtype: "textfield",
                name: "width",
                value: this.configObject.width,
                width: 500,
                labelWidth:this.labelWidth,
                fieldLabel: i18next.t('coordinatelinkwindow_config_0')
            },
            {
                xtype: "textfield",
                name: "height",
                value: this.configObject.height,
                width: 500,
                labelWidth:this.labelWidth,
                fieldLabel: i18next.t('coordinatelinkwindow_config_1')
            },
            {
                xtype: "textfield",
                name: "url",
                value: this.configObject.url,
                width: 700,
                labelWidth:this.labelWidth,
                fieldLabel: i18next.t('coordinatelinkwindow_config_2')
            }         
        ]);
          var extraText = document.createElement('div');
        extraText.innerHTML=i18next.t('coordinatelinkwindow_config_3');
        document.getElementById("config").appendChild(extraText);
    }
});
