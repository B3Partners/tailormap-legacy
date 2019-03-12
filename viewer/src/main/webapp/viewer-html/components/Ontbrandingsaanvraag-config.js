/* 
 * Copyright (C) 2012-2017 B3Partners B.V.
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
 * Custom configuration object for Ontbrandingsaanvraag config
 * @author <a href="mailto:geertplaisier@b3partners.nl">Geert Plaisier</a>
 */
Ext.define("viewer.components.CustomConfiguration",{
    extend: "viewer.components.SelectionWindowConfig",
    form: null,
    DEFAULT_ZONE_DISTANCES_CONSUMER: {
        "Grondvuurwerk": { distance: 15, fan: false },
        "Luchtvuurwerk met kaliber tot en met 1 inch": { distance: 40, fan: false },
        "Luchtvuurwerk met kaliber van 1 inch tot 2 inch": { distance: 60, fan: false },
        "Luchtvuurwerk met kaliber tot en met 1 inch - fanshape": { distance: 40, fan: true },
        "Luchtvuurwerk met kaliber van 1 inch tot 2 inch - fanshape": { distance: 60, fan: true }
    },
    DEFAULT_ZONE_DISTANCES_PROFESSIONAL: {
        "Vuurpijlen (schietrichting schuin van het publiek af)": {distance: 125, fan: false},
        "Vuurpijlen (schietrichting overig)": {distance: 200, fan: false},
        "Tekstborden": {distance: 15, fan: false},
        "Grondvuurwerk": {distance: 30, fan: false},
        "Romeinse kaarsen met kaliber tot en met 2 inch": {distance: 75, fan: false},
        "Mines tot en met een kaliber van 4 inch": {distance: 60, fan: false},
        "Mines met een kaliber vanaf 4 inch tot en met 6 inch": {distance: 100, fan: false},
        "Dagbommen kleiner dan 21 cm diameter": {distance: 75, fan: false},
        "Romeinse kaarsen, cakeboxen, vuurwerkbommen met een kaliber <3 inch": {distance: 120, fan: false},
        "Romeinse kaarsen, cakeboxen, vuurwerkbommen met een kaliber >3 inch": {distance: 165, fan: false},
        "Romeinse kaarsen, cakeboxen, vuurwerkbommen met een kaliber >4 inch": {distance: 200, fan: false},
        "Romeinse kaarsen, cakeboxen, vuurwerkbommen met een kaliber >5 inch": {distance: 230, fan: false},
        "Romeinse kaarsen, cakeboxen, vuurwerkbommen met een kaliber >6 inch": {distance: 265, fan: false},
        "Romeinse kaarsen, cakeboxen, vuurwerkbommen met een kaliber >8 inch": {distance: 325, fan: false},
        "Romeinse kaarsen, cakeboxen, vuurwerkbommen met een kaliber >10 inch": {distance: 390, fan: false},
        "Romeinse kaarsen, cakeboxen, vuurwerkbommen met een kaliber >12 inch": {distance: 455, fan: false},
        "Romeinse kaarsen, cakeboxen, vuurwerkbommen met een kaliber >18 inch": {distance: 645, fan: false},
        "Romeinse kaarsen, cakeboxen, vuurwerkbommen met een kaliber >24 inch": {distance: 845, fan: false}
    },
    constructor: function (parentId, configObject, configPage) {
        if (configObject === null){
            configObject = {};
        }
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentId, configObject, configPage);
        this.addForm(configObject, "zonedistances_consumer", "Vuurwerkcategoriën consumenten vuurwerk", "Vuurwerkcategorie consumenten vuurwerk", this.DEFAULT_ZONE_DISTANCES_CONSUMER);
        this.addForm(configObject, "zonedistances_professional", "Vuurwerkcategoriën professioneel vuurwerk", "Vuurwerkcategorie professioneel vuurwerk", this.DEFAULT_ZONE_DISTANCES_PROFESSIONAL);
    },
    addForm: function(configObject, paramkey, label, label_singular, defaults) {
        var distances = [];
        var configWaardes = configObject[paramkey];
        if(typeof configWaardes === "undefined") {
            configWaardes = [];
            for(var key in defaults) if(defaults.hasOwnProperty(key)) {
                configWaardes.push({ label: key, distance: defaults[key].distance, fan: defaults[key].fan });
            }
        }
        var containerKey = paramkey + "distancesContainer";
        for (var i = 0 ; i < configWaardes.length ;i++){
            var waarde = configWaardes[i];
            var item = this.createRow(waarde.label, waarde.distance, waarde.fan);
            distances.push(item);
        }
        this.form.add({
            xtype: "panel",
            width: '100%',
            title: label,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            scrollable: true,
            tbar: this.maxSearchConfigs === 1 ? null : [
                "->",
                {
                    xtype:'button',
                    iconCls: 'x-fa fa-plus-circle',
                    text: label_singular + ' toevoegen',
                    listeners: {
                        click: function(){
                            var distancesContainer = Ext.ComponentQuery.query("#" + containerKey)[0];
                            distancesContainer.add(this.createRow('', '', paramkey === 'zonedistances_professional'));
                        },
                        scope:this
                    }
                }
            ],
            name: containerKey,
            itemId: containerKey,
            items: distances
        });
    },
    createRow: function(labelValue, distance, fan_value) {
        return {
            xtype: "container",
            layout: {
                type: "hbox",
                align: "stretch"
            },
            defaults: {
                margin: '0 5 2 0'
            },
            items: [{
                name: "label",
                fieldLabel: "Label",
                value: labelValue,
                xtype: 'textfield',
                labelWidth: 50,
                flex: 1
            }, {
                name: "distance",
                fieldLabel: "Afstand",
                value: distance,
                xtype: 'numberfield',
                allowDecimals:true,
                decimalSeparator:',',
                labelWidth: 50,
                width: 150
            }, {
                xtype: "checkbox",
                fieldLabel: "Fan",
                labelWidth: 50,
                name: "fan",
                value: fan_value
            }, {
                xtype: "button",
                text: " X ",
                listeners:{
                    click: function(btn) {
                        var container = btn.up('.panel');
                        container.remove(btn.up('.container'));
                    }
                }
            }]
        };
    },
    getConfiguration: function() {
        var config = this.callParent(arguments);
        config.zonedistances_consumer = this.getConfigFor("zonedistances_consumer");
        config.zonedistances_professional = this.getConfigFor("zonedistances_professional");
        return config;
    },
    getConfigFor: function(paramkey) {
        var containerKey = paramkey + "distancesContainer";
        var values =  Ext.ComponentQuery.query("#" + containerKey)[0];
        var items = values.items.items;
        var distances = [];
        for (var i = 0 ; i< items.length ; i++){
            var item = items[i];
            var vals = item.items.items;
            var entry = {
                label : vals[0].getValue(),
                distance : +(vals[1].getValue()),
                fan : vals[2].getValue()
            };
            if(entry.label && entry.distance){
                distances.push(entry);
            }
        }
        return distances;
    },
    getDefaultValues: function() {
        return {};
    }
});
