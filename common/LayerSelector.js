/* 
 * Copyright (C) 2012 Expression organization is undefined on line 4, column 61 in Templates/Licenses/license-gpl30.txt.
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
 * LayerSelector
 * A generic component to retrieve the layers
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define ("viewer.components.LayerSelector",{
    popupWin:null,
    layerList : null,
    combobox : null,
    div: null,
    config: {
        viewerController: new Object(),
        restriction : null
    }, 
    constructor: function (conf,div){        
        this.initConfig(conf);   
        this.div = div;
        var layerList = this.viewerController.app.appLayers;
        var layerArray = new Array();
        for (var layer in layerList){
            var l = layerList[layer];
            l.layer = l;
            layerArray.push(l);
        }
        var layers = Ext.create('Ext.data.Store', {
            fields: ['id', 'layerName','layer'],
            data : layerArray
        });

        this.combobox = Ext.create('Ext.form.ComboBox', {
            fieldLabel: 'Kies kaartlaag',
            store: layers,
            queryMode: 'local',
            displayField: 'layerName',
            valueField: 'layer',
            renderTo: this.div
        });
        return this;
    },
    getValue : function (){
        return this.combobox.getValue();
    }
});