/* 
 * Copyright (C) 2013 B3Partners B.V.
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
 * Custom configuration object for FeatureInfo configuration
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define("viewer.components.CustomConfiguration",{
    extend: "viewer.components.SelectionWindowConfig",
    form: null,
    constructor: function (parentId,configObject){
        if (configObject==undefined || configObject==null){
            configObject={};
        }
        configObject.layerFilter=this.layerFilter;
        configObject.showLabelconfig = false;
        
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentId,configObject);        
       
        this.form.add([{
            xtype: 'textfield',
            fieldLabel: 'Link naar meer',
            name: 'moreLink',
            /*columnWidth : 0.5,*/
            value: this.configObject.moreLink != undefined ? this.configObject.moreLink : 'Meer',
            labelWidth:this.labelWidth
        },{
            xtype: 'textfield',
            fieldLabel: 'Samenvatting hoogte',
            name: 'height',
            /*columnWidth : 0.5,*/
            value: this.configObject.height != undefined ? this.configObject.height : 300,
            labelWidth:this.labelWidth
        },{
            xtype: 'textfield',
            fieldLabel: 'Samenvatting breedte',
            name: 'width',
            /*columnWidth : 0.5,*/
            value: this.configObject.width != undefined ? this.configObject.width : 300,
            labelWidth:this.labelWidth
        }
        ]);
        
        this.createCheckBoxes(this.configObject.layers,{});
        
    },
    layerFilter: function(layers){
        var filteredLayers=[];
        for (var i in layers){
            var l = layers[i];
            //check if layer has something to show in the maptip
            if (l && l.details !=undefined &&
                (!Ext.isEmpty(l.details["summary.description"]) ||
                    !Ext.isEmpty(l.details["summary.image"]) ||
                    !Ext.isEmpty(l.details["summary.link"]) ||
                    !Ext.isEmpty(l.details["summary.title"]))){
                filteredLayers.push(l);
            }
        }
        return filteredLayers;
    }
});

