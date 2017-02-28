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
 * HTML component
 * Creates a html component
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define ("viewer.components.Divider",{
    extend: "viewer.components.Component",
    container: null,
    config: {
        title: "",
        margin: "3px 0 3px 0",
        padding: "5px",
        backgroundColor: "transparent",
        border: "1px 0 1px 0",
        borderColor: "D0D0D0",
        textColor: "000000",
        fontWeight: "bold"
    },
    constructor: function (conf){        
        this.initConfig(conf);
		viewer.components.Divider.superclass.constructor.call(this, this.config);
        this.createLabel();
        return this;
    },
    createLabel : function() {
        // Add dash before hex-coded colors
        var colorregex = /^[0-9a-f]{3,6}$/i;
        if(colorregex.test(this.config.backgroundColor)) this.config.backgroundColor = '#' + this.config.backgroundColor;
        if(colorregex.test(this.config.borderColor)) this.config.borderColor = '#' + this.config.borderColor;
        if(colorregex.test(this.config.textColor)) this.config.textColor = '#' + this.config.textColor;

        this.container = Ext.create('Ext.container.Container', {
            width: '100%',
            html: this.config.title,
            margin: this.config.margin,
            padding: this.config.padding,
            renderTo: this.div,
            style: {
                'background-color': this.config.backgroundColor,
                'border-width': this.config.border,
                'border-color': this.config.borderColor,
                'border-style': 'solid',
                'color': this.config.textColor,
                'font-weight': this.config.fontWeight,
                'line-height': '15px'
            }
        });
    },
    getExtComponents: function() {
        return [ this.container.getId() ];
    }
});