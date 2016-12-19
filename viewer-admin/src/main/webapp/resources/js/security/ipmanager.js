/*
 * Copyright (C) 2011-2016 B3Partners B.V.
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

Ext.define('vieweradmin.components.IpManager', {

    config: {
        container: 'ip-list',
        ipList: []
    },

    constructor: function(conf) {
        this.initConfig(conf);
        this.initForm();
        if(this.config.ipList.length !== 0) {
            for(var i = 0; i < this.config.ipList.length; i++) {
                this.addIpField(this.config.ipList[i]);
            }
        } else {
            this.addIpField();
        }
    },

    initForm: function() {
        this.formPanel = Ext.create('Ext.form.Panel', {
            title: 'IP adressen',
            width: 300,
            maxHeight: 300,
            autoScroll: true,
            bodyPadding: 10,
            renderTo: this.config.container,
            items: [{
                xtype: 'button',
                name: 'add-ip',
                text: 'IP adres toevoegen',
                handler: function() {
                    this.addIpField();
                },
                scope: this
            }]
        });
    },

    addIpField: function(val) {
        var idx = this.formPanel.items.length - 1;
        this.formPanel.insert(idx, {
            xtype: 'textfield',
            name: "ips",
            value: val || '0.0.0.0',
            regex: /[0-2][0-9]{0,2}\.[0-2][0-9]{0,2}\.[0-2][0-9]{0,2}\.[0-2][0-9]{0,2}/
        });
    },

    getIpAddress: function() {
        var ipList = [];
        this.formPanel.query('textfield').each(function(field) {
            if(field.validate()) {
                ipList.push(field.value);
            }
        });
        return ipList;
    }

});