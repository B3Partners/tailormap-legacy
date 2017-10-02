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
 * Direct Search
 * @author <a href="mailto:geertplaisier@b3partners.nl">Geert Plaisier</a>
 */
Ext.define ("viewer.components.DirectSearch",{
    extend: "viewer.components.Search",
    showSearchButtons: false,
    simpleSearchResults: true,
    margin: 0,
    /**
     * Constructor for DirectSearch
     * @constructor
     */
    constructor: function (conf) {
        conf.isPopup = false;
        var me = this;
        // Add search trigger
        this.searchFieldTriggers = {
            picker: {
                cls: 'x-form-search-trigger',
                handler: function() {
                    me.search();
                }
            }
        };
        viewer.components.DirectSearch.superclass.constructor.call(this, conf);
    },
    renderButton: function() {},
    loadWindow : function() {
        var me = this;

        this.form = Ext.create("Ext.form.Panel", {
            frame: false,
            items: this.getFormItems(),
            padding: 0,
            border: 0,
            margin: 0,
            layout: 'fit',
            bodyStyle: {
                backgroundColor: 'transparent'
            },
            style: {
                backgroundColor: 'transparent'
            }
        });

        this.mainContainer = Ext.create('Ext.container.Container', {
            itemId: this.name + 'Container',
            width: 300,
            padding: 0,
            border: 0,
            margin: 0,
            floating: true,
            renderTo: Ext.getBody(),
            layout: 'fit',
            cls: 'round-shadows',
            style: {
                backgroundColor: 'transparent'
            },
            items: [
                this.form
            ]
        });

        this.alignContainer();
        this.loadingContainer = this.mainContainer;
    },
    
    alignContainer: function() {
        if(!this.config.left) {
            this.config.left = 10;
        }
        if(!this.config.top) {
            this.config.top = 10;
        }
        var pos = [Number(this.config.left), Number(this.config.top)];
        var align = 'tl';
        if(this.config.alignposition) {
            align = this.config.alignposition;
        }
        if(align.substr(0, 1) === 'b') {
            pos[1] = pos[1] * -1;
        }
        if(align.substr(1) === 'r') {
            pos[0] = pos[0] * -1;
        }
        this.mainContainer.alignTo(this.config.viewerController.getWrapperId(), [align, align].join('-'), pos);
        this.config.viewerController.anchorTo(
            this.mainContainer, this.config.viewerController.getWrapperId(), [align, align].join('-'), pos
        );
    }
});
