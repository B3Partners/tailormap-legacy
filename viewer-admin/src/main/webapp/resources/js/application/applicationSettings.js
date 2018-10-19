/* 
 * Copyright (C) 2012-2016 B3Partners B.V.
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

Ext.define('vieweradmin.components.ApplicationSettings', {

    config: {
        actionBeans: {},
        steunkleur1: "",
        steunkleur2: ""
    },

    htmlEditor: null,

    constructor: function(config) {
        this.initConfig(config);
        Ext.tip.QuickTipManager.init();
        vieweradmin.components.Menu.setActiveLink('menu_instellingen');
        this.initTabPanel();
        this.initializeFields();
    },

    initTabPanel: function() {
        var headerdiv = document.getElementById("headertext");
        var headercontent = headerdiv.innerText || headerdiv.textContent;
        headerdiv.style.display = 'none';
        Ext.select('.tabdiv', true).removeCls('tabdiv').setVisibilityMode(Ext.dom.Element.OFFSETS).setVisible(false);
        var tabpanel = Ext.create('Ext.tab.Panel', {
            title: headercontent,
            renderTo: 'tabs',
            width: '100%',
            height: '100%',
            activeTab: 0,
            defaults :{
                bodyPadding: 10,
                autoScroll: true
            },
            layoutOnTabChange: true,
            items: [{
                itemId: "config-tab",
                contentEl:'config',
                title: i18next.t('viewer_admin_applicationsettings_0')
            },{
                itemId: "security-tab",
                contentEl:'security',
                title: i18next.t('viewer_admin_applicationsettings_1')
            },{
                itemId: "remarks-tab",
                contentEl:'remarks',
                title: i18next.t('viewer_admin_applicationsettings_2')
            }],
            listeners: {
                tabchange: {
                    scope: this,
                    fn: function(panel, activetab, previoustab) {
                        if(activetab.getItemId() === 'remarks-tab' && this.htmlEditor === null) {
                            this.initHtmlEditor();
                        }
                    }
                }
            },
            bbar: [
                {
                    xtype: 'button',
                    text: i18next.t('viewer_admin_applicationsettings_3'),
                    listeners: {
                        click: {
                            fn: this.confirmCopy,
                            scope: this
                        }
                    }
                },
                {
                    xtype: 'button',
                    text: i18next.t('viewer_admin_applicationsettings_4'),
                    listeners: {
                        click: {
                            fn: this.confirmMashup,
                            scope: this
                        }
                    }
                },
                "->",
                {
                    xtype: 'button',
                    text: i18next.t('viewer_admin_applicationsettings_5'),
                    listeners: {
                        click: {
                            fn: this.confirmPublish,
                            scope: this
                        }
                    }
                }, {
                    xtype: 'button',
                    text: i18next.t('viewer_admin_applicationsettings_6'),
                    listeners: {
                        click: {
                            fn: this.save,
                            scope: this
                        }
                    }
                }, {
                    xtype: 'button',
                    text: i18next.t('viewer_admin_applicationsettings_7'),
                    listeners: {
                        click: {
                            fn: this.cancel,
                            scope: this
                        }
                    }
                }
            ]
        });
        Ext.on('resize', function() {
            tabpanel.updateLayout();
        });
    },

    initializeFields: function() {
        Ext.create('Ext.ux.b3p.ColorPickerButton', {
            startColor: this.config.steunkleur1,
            defaultColor: '#FFFFFF',
            renderTo: 'steunkleur_colorpicker1',
            textfield: 'steunkleur1'
        });
        Ext.create('Ext.ux.b3p.ColorPickerButton', {
            startColor: this.config.steunkleur2,
            defaultColor: '#000000',
            renderTo: 'steunkleur_colorpicker2',
            textfield: 'steunkleur2'
        });
    },

    initHtmlEditor: function() {
        this.htmlEditor = Ext.create('Ext.form.HtmlEditor', {
            width: 525,
            height: 350,
            value: Ext.get('details_opmerkingen').dom.value,
            renderTo: 'details_opmerkingen_container',
            plugins: [
                new Ext.create('Ext.ux.form.HtmlEditor.imageUpload', Ext.apply(vieweradmin.components.DefaultConfgurations.getDefaultImageUploadConfig(), {
                    submitUrl: this.config.actionBeans.imageupload,
                    managerUrl: Ext.urlAppend(this.config.actionBeans.imageupload, "manage=t")
                })),
                new Ext.ux.form.HtmlEditor.Table(vieweradmin.components.DefaultConfgurations.getDefaultHtmlEditorTableConfig())
            ]
        });
    },

    save: function() {
        if(this.htmlEditor !== null) {
            Ext.get('details_opmerkingen').dom.value = this.htmlEditor.getValue();
        }
        var frm = document.forms[0];
        frm.action = "?save=t";
        frm.submit();
    },

    cancel: function() {
        var frm = document.forms[0];
        frm.action = "?cancel=t";
        frm.submit();
    },

    confirmCopy: function () {
        Ext.MessageBox.show({
            title: i18next.t('viewer_admin_applicationsettings_8'),
            msg: i18next.t('viewer_admin_applicationsettings_9'),
            buttons: Ext.MessageBox.OKCANCEL,
            prompt:true,
            value: document.forms[0].name.value + " (kopie)",
            fn: function(btn, text){
                if(btn=='ok' && text){
                    var frm = document.forms[0];
                    frm.name.value = text;
                    frm.action = "?copy=t";
                    frm.submit();
                }
            }
        });
    },

    confirmMashup: function () {
        Ext.MessageBox.show({
            title: i18next.t('viewer_admin_applicationsettings_10'),
            width: 300,
            msg: i18next.t('viewer_admin_applicationsettings_11')+
            '<input type="text" id="mashupNameText" width="200px"><br/>' +
            '<label><input type="checkbox" id="mustUpdateComponents">' + ___("Moeten wijzigingen aan de componenten in de moederapplicatie ook doorwerken in de mashup?") + '</label><br/>'  ,
            buttons: Ext.MessageBox.OKCANCEL,
            fn: function(btn, text){
                if(btn=='ok'){
                    var text = Ext.get("mashupNameText").getValue();
                    var mustUpdateComponents = Ext.get("mustUpdateComponents").getValue() === "on";
                    if(text){
                        var frm = document.forms[0];
                        frm.mashupName.value = text;
                        frm.mustUpdateComponents.value = mustUpdateComponents;
                        frm.action = "?mashup=t";
                        frm.submit();
                    }
                }
            }
        });
    },

    confirmPublish: function () {
        Ext.MessageBox.show({
            title: i18next.t('viewer_admin_applicationsettings_12'),
            msg: i18next.t('viewer_admin_applicationsettings_13'),
            buttons: Ext.MessageBox.YESNOCANCEL,
            fn: function(btn, text){
                if(btn === 'yes' || btn === 'no'){
                    var mashupMustPointToPublishedVersion = btn === 'yes';
                    var frm = document.forms[0];
                    frm.action = "?publish=t&mashupMustPointToPublishedVersion=" + mashupMustPointToPublishedVersion;
                    frm.submit();
                }
            }
        });
    }

});