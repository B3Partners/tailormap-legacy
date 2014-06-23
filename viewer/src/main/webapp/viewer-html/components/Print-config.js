/* 
 * Copyright (C) 2012-2013 B3Partners B.V.
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
 * Custom configuration object for AttributeList configuration
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
/* Modified: 2014, Eddy Scheper, ARIS B.V.
 *           - A5 and A0 pagesizes added.
*/
Ext.define("viewer.components.CustomConfiguration",{
    extend: "viewer.components.SelectionWindowConfig",
    constructor: function (parentId,configObject){
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentId,configObject);        
        //this.createCheckBoxes(this.configObject.layers);
        this.addFormItems(configObject);
    },
    addFormItems: function(){
        var me =this;        
        this.form.add([{
                xtype: "label",
                text: "Standaard Oriëntatie",
                style: "font-weight: bold;"                
            },{                           
                xtype: 'radiogroup',
                columns: 1,
                vertical: true,
                name: "orientation",
                items: [{
                    boxLabel: 'Liggend', 
                    name: 'orientation', 
                    inputValue: 'landscape', 
                    checked: me.configObject.orientation=="landscape"
                },{
                    boxLabel: 'Staand', 
                    name: 'orientation', 
                    inputValue: 'portrait', 
                    checked: !(me.configObject.orientation=="landscape")
                }]
            },{
                xtype: "label",
                text: "Standaard paginaformaat",
                style: "font-weight: bold;"                
            },{
                xtype: "combo",
                fields: ['value','text'],
                value: me.configObject.default_format ? me.configObject.default_format : "a4",
                name: "default_format",
                emptyText:'Maak uw keuze',
                store: [
                    ["a5","A5"],
                    ["a4","A4"],
                    ["a3","A3"],
                    ["a0","A0"]
                ],
                width : 75
            },{
                xtype: "label",
                text: "Standaard legenda",
                style: "font-weight: bold;"                
            },{
                xtype: "checkbox",
                name: "legend",
                checked: me.configObject.legend,
                boxLabel: "Standaard de legenda toevoegen"
            },{
                xtype: "label",
                text: "Maximale grote plaatje",
                style: "font-weight: bold;"                
            },{
                xtype: "textfield",
                name: "max_imagesize",
                value: me.configObject.max_imagesize ? me.configObject.max_imagesize :"2048"
            },{
                xtype: "label",
                text: "RTF-Knop",
                style: "font-weight: bold;"                
            },{
                xtype: "checkbox",
                name: "showPrintRtf",
                checked: me.configObject.showPrintRtf ? me.configObject.showPrintRtf : true,
                boxLabel: "Laat de print via RTF knop zien"
            },{
                xtype: "label",
                text: "Overzichtskaart",
                style: "font-weight: bold;"                
            },{
                xtype: "checkbox",
                name: "overview",
                checked: me.configObject.overview ? me.configObject.overview : false,
                boxLabel: "Neem de overzichtskaart op als de overzichtskaart aanwezig is"
            }
        ]);
                 
    }
});

