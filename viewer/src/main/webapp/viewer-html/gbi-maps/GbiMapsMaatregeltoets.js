/*
 * Copyright (C) 2012-2021 B3Partners B.V.
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
 * Creates an Angular GbiMaps Maatregeltoets component
 */
Ext.define ("viewer.components.GbiMapsMaatregeltoets",{
    extend: "viewer.components.Component",
    container: null,
    config: {
        layers: null,
        title: "",
        iconUrl: null,
        tooltip: null,
        label: ""
    },
    constructor: function (conf){
        this.initConfig(conf);
        this.config.isPopup = false;
        viewer.components.GbiMapsMaatregeltoets.superclass.constructor.call(this, this.config);
        this.addPopup();
        this.renderAttributelistButton();
    },
    addPopup: function(){
        var popup = document.createElement("gbi-maps-maatregeltoets-popup");
        document.body.appendChild(popup);
    },
    renderAttributelistButton: function() {
        var btn = document.createElement('gbi-maps-maatregeltoets-menu-button');

        var dummyConfig = {
            maatregelLijstId: 1,
            maatregelLijstName: 'Wegen',
            databron: 'gb_wegvakonderdeel',
            planningsBron: 'gb_wegvakonderdeel_planning',
            labelFields: ['std_beheercluster', 'std_structuurelement', 'std_verhardingssoort', 'std_verhardingsfunctie', 'aanlegjaar'],
            hoeveelheidKolom: 'hoeveelheid',
            kenmerk_1: 'std_verhardingssoort',
            kenmerk_2: 'binnen_kom',
            kenmerk_3: 'wegtype',
            kenmerk_4: 'verhardingstype',
        };

        btn.setAttribute('maatregeltoets-config', JSON.stringify([dummyConfig]));

        document.getElementById(this.getContentDiv()).appendChild(btn);
    }
});
