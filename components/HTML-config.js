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
        if (config && config.html){
            value=config.html;
        }
        
        Ext.tip.QuickTipManager.init();  // enable tooltips
        this.htmlEditor=Ext.create('Ext.form.HtmlEditor', {
            width: 750,
            height: 490,
            value: value,
            renderTo: Ext.get(parentid)
        });  
        return this;
    },
    getConfiguration: function(){
        var config = new Object();
        config.html= this.htmlEditor.getValue();
        return config;
    }
});