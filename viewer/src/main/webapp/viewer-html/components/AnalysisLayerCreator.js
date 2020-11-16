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
    constructor: function (conf) {
        this.initConfig(conf);
        viewer.components.AnalysisLayerCreator.superclass.constructor.call(this, this.config);
        return this;
    },
    addButton: function(buttonContainer) {
        var btn = document.createElement('tailormap-analysis-button');
        buttonContainer.appendChild(btn);
    }
});
