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
 * Custom configuration object for Buffer configuration
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define("viewer.components.CustomConfiguration",{
    extend: "viewer.components.SelectionWindowConfig",
    defaultMaxFeatures: 250,
    constructor: function (parentId, configObject, configPage) {
        if(configObject === null) {
            configObject = {};
            configObject.maxFeatures = this.defaultMaxFeatures;
        }
        configObject.showLabelconfig =true;
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentId, configObject, configPage);
        this.createCheckBoxes(this.configObject.layers,{
            bufferable:true
        }); 
        this.addFormItems(configObject);
    },
    addFormItems: function(configObject){
        this.form.add([
        {
            xtype: "textfield",
            name: "maxFeatures",
            fieldLabel: i18next.t('viewer_components_customconfiguration_22'),
            labelWidth:this.labelWidth,
            width: 500,
            id: "maxFeatures",
            value: configObject.maxFeatures ? configObject.maxFeatures : this.defaultMaxFeatures
        }
        ]);
    },
    getDefaultValues: function() {
        return {
            details: {
                minWidth: 300,
                minHeight: 175
            }
        };
    }
});

