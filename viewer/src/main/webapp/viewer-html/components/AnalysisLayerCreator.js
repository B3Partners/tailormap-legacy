/*
 * Copyright (C) 2020 B3Partners B.V.
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
Ext.define ("viewer.components.AnalysisLayerCreator", {
    extend: "viewer.components.Component",
    statics: {
        buttonCreated: false,
    },
    constructor: function (conf) {
        this.initConfig(conf);
        viewer.components.AnalysisLayerCreator.superclass.constructor.call(this, this.config);
        this.addPanel();
        return this;
    },
    addPanel: function() {
        var panel = document.createElement('tailormap-create-layer-panel');
        document.body.appendChild(panel);
    },
    addButton: function(buttonContainer, extContainer) {
        var btn = document.createElement('tailormap-analysis-button');
        buttonContainer.appendChild(btn);
        window.setTimeout(function() { extContainer.updateLayout(); }, 250);
    }
});
