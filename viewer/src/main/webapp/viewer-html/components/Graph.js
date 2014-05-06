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
 * Graph component
 * Creates a Graph component
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define("viewer.components.Graph", {
    extend: "viewer.components.Component",
    panel: null,
    config: {
        title: null,
        iconUrl: null,
        tooltip: null,
        label: null
    },
    constructor: function(conf) {
        viewer.components.Graph.superclass.constructor.call(this, conf);
        this.initConfig(conf);

        var me = this;
        this.renderButton({
            handler: function() {
                // me.buttonClick();
            },
            text: me.title,
            icon: me.iconUrl,
            tooltip: me.tooltip,
            label: me.label
        });
        return this;
    },
    getExtComponents: function() {
        return [];
    }
});
