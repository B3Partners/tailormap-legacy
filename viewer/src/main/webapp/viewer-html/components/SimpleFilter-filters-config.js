/*
 * Copyright (C) 2012-2014 B3Partners B.V.
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

Ext.define("viewer.components.sf.Config", {
    configObject: null,
    id: null,
    form: null,
    constructor: function (config) {
        this.configObject = config.configObject;
        this.id = this.configObject.id ? this.configObject.id : Ext.id();
        var items = this.getFormItems();
        this.form = Ext.create("Ext.form.Panel", {
            title: 'Slider',
            width: 325,
            bodyPadding: 5,
            layout: 'anchor',
            defaults: {
                anchor: '100%'
            },
            defaultType: 'textfield',
            items: items
        });

        Ext.getCmp(config.renderTo).items.add(this.form);
    },
    getFormItems: function () {
        var items = [{
            fieldLabel: 'Label',
            name: 'label',
            value: this.configObject.label ? this.configObject.label : ""
        }, {
            fieldLabel: "Beginwaarde(s)",
            name: "start",
            value: this.configObject.start ? this.configObject.start : "min,max",
            qtip: "Vul een vaste waarde in of 'min' of 'max'. Bij een slider voor een bereik geef twee waardes op gescheiden door een komma",
            listeners: {
                render: function (c) {
                    Ext.QuickTips.register({
                        target: c.getEl(),
                        text: c.qtip
                    });
                }
            }
        }];

        return items;
    }

});

Ext.define("viewer.components.sf.SliderConfig", {
    extend: "viewer.components.sf.Config",
    constructor: function(config) {
        viewer.components.sf.SliderConfig.superclass.constructor.call(this, config);
    },
    getFormItems : function(){
        var items = this.callParent();
        items = items.concat([{
            fieldLabel: "Minimale waarde",
            name: "min",
            qtip: "Indien geen waarde ingevuld wordt kleinste attribuutwaarde uit de attribuutlijst gebruikt",
            value: this.configObject.min ? this.configObject.min : "",
            listeners: {
                render: function (c) {
                    Ext.QuickTips.register({
                        target: c.getEl(),
                        text: c.qtip
                    });
                }
            }
        }, {
            fieldLabel: "Maximale waarde",
            name: "max",
            value: this.configObject.max ? this.configObject.max : "",
            qtip: "Indien geen waarde ingevuld wordt grootste attribuutwaarde uit de attribuutlijst gebruikt",
            listeners: {
                render: function (c) {
                    Ext.QuickTips.register({
                        target: c.getEl(),
                        text: c.qtip
                    });
                }
            }
        }, {
            fieldLabel: "Stap",
            name: "step",
            value: this.configObject.step ? this.configObject.step : "1"
        }, {
            xtype: 'combo',
            fieldLabel: "Soort slider",
            name: "sliderType",
            store: Ext.create("Ext.data.Store", {
                fields: ["type", "label"],
                data: [
                    {type: "eq", label: "Attribuut gelijk aan waarde slider"},
                    {type: "gt", label: "Attribuut groter dan waarde slider"},
                    {type: "lt", label: "Attribuut kleiner dan waarde slider"},
                    {type: "range", label: "Attribuut binnen bereik (twee schuifjes)"}
                ]
            }),
            queryModes: "local",
            displayField: "label",
            editable: false,
            valueField: "type",
            value: this.configObject.sliderType ? this.configObject.sliderType : "eq"
        }, {
            fieldLabel: "Waarde format string",
            name: "valueFormatString",
            value: this.configObject.valueFormatString ? this.configObject.valueFormatString : "",
            qtip: "Laat leeg om geen waarde van de schuifjes te tonen. Voorbeelden format strings: '0' (alleen hele getallen), '0 m²' (met eenheid), '0.00' (twee decimalen), '0,000' (met duizendtalscheidingsteken), '€ 0,000.00' (bedrag)",
            listeners: {
                render: function (c) {
                    Ext.QuickTips.register({
                        target: c.getEl(),
                        text: c.qtip
                    });
                }
            }
        }]);
        return items;
    },
    getConfig: function() {
        var config = this.form.getValues();
        config.id = this.id;
        return config;
    }
});