/* 
 * Copyright (C) 2012 B3Partners B.V.
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
 * Custom configuration object for HTML configuration
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define("viewer.components.CustomConfiguration",{
    extend: "viewer.components.ConfigObject",
    htmlEditor: null,
    constructor: function (parentid,config){
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentid,config);
        //create html Editor
        var value="";
        var title="";
        if (config) {
            if(config.html) value=config.html;
            if(config.title) title=config.title;
        }
        
        Ext.tip.QuickTipManager.init();  // enable tooltips
        this.titleField = Ext.create('Ext.form.field.Text', {
            fieldLabel: 'Titel (optioneel, wordt gebruikt voor tabbladen)',
            name: 'title',
            value: title,
            labelWidth: 275,
            width: 500,
            renderTo: Ext.get(parentid)
        });
        this.htmlEditor=Ext.create('Ext.form.HtmlEditor', {
            width: 750,
            height: 460,
            value: value,
            renderTo: Ext.get(parentid) ,
            plugins: [new Ext.create('Ext.ux.form.HtmlEditor.imageUpload', {
                    dragResize: false,
                    dragWheel: false,
                    disableServerSideEdit: true,
                    submitUrl: actionBeans['imageupload'],
                    managerUrl: Ext.urlAppend(actionBeans['imageupload'], "manage=t"),                    
                    
                    lang: {
                        'Display': 'Weergave',
                        'By Default': 'Standaard',
                        'Inline': 'In regel',
                        'Block': 'Op aparte regel',
                        'Insert/Edit Image': 'Afbeelding invoegen/bewerken',
                        'Upload Image...': 'Uploaden...',
                        'Uploading your photo...': 'Afbeelding wordt geupload...',
                        'Error': 'Fout',
                        'Width': 'Breedte',
                        'Height': 'Hoogte',
                        'Real Size': 'Originele grootte',
                        'Align': 'Uitlijning',
                        'Title': 'Titel',
//                        'Class': '',
//                        'Padding': '',
//                        'Margin': '',
                        'Top': 'Boven',
                        'Bottom': 'Onder',
                        'Right': 'Rechts',
                        'Left': 'Links',
                        'None': 'Geen',
                        'Size & Details': 'Grootte en details',
                        'More Options': 'Meer opties',
                        'Style' : 'Stijl',
//                        'OK' : '',
                        'Cancel': 'Annuleren',
                        'Delete Image':'Afbeelding verwijderen',
                        'Confirmation':'Bevestiging',
                        'Are you sure you want to delete this image?': 'Weet u zeker dat u deze afbeelding wilt verwijderen?',
                        'Your photo has been uploaded.':'Uw afbeelding is geupload.'
                    }
            })] 
        });  
        return this;
    },
    getConfiguration: function(){
        var config = new Object();
        config.html= this.htmlEditor.getValue();
        config.title= this.titleField.getValue();
        return config;
    }
});