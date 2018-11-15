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

Ext.define("vieweradmin.components.ConfigPage", {

    propertyGrid: null,
    customConfiguration: null,
    layoutForm: null,

    config: {
        applicationId: "",
        className: "",
        name: "",
        currentRegion: "",
        contextPath: "",
        metadata: {},
        configObject: {},
        details: {
            changeablePosition: true,
            changeableSize: true
        },
        appConfig: {},
        actionBeans: {}
    },

    constructor: function(config) {
        this.initConfig(config);
        // Create the form for the main tab
        this.createMainTab();
        // Create the form for the Layout tab
        this.createLayoutTab();
        // Create the form for the Responsive tab
        this.createResponsiveConfig();
        // Create the form for the Help tab
        if(this.showHelp()) {
            this.createHelpTab();
        }
        // Create the form for Layout tab (in case of left/right region)
        if(this.showConfigureHeight()) {
            this.createHeightLayoutTab();
        }
        // Initialize DOM as tabpanel
        this.initTabpanel();

        Ext.get('compHelpLink').set({
            href: '#' + this.config.className.replace(/\./g, '_') + '_Help'
        });
    },

    initTabpanel: function() {
        // Select all tabs and set to invisible first
        Ext.select('.tabdiv', true).removeCls('tabdiv').setVisibilityMode(Ext.dom.Element.OFFSETS).setVisible(false);

        var tabs = [{
            itemId: 'config-tab',
            contentEl:'config',
            title: i18next.t('viewer_admin_configpage_0'),
            autoScroll: true
        },{
            itemId: 'rights-tab',
            contentEl:'rights',
            title: i18next.t('viewer_admin_configpage_1')
        }];
        tabs.push({
            itemId: 'layout-tab',
            contentEl:'layout',
            title: i18next.t('viewer_admin_configpage_2')
        });
        if(this.showHelp()){
            tabs.push({
                itemId: 'help-tab',
                contentEl:'help',
                title: i18next.t('viewer_admin_configpage_3')
            });
        }

        var htmlEditorRendered = false;
        Ext.widget('tabpanel', {
            renderTo: 'tabs',
            width: '100%',
            height: '100%',
            activeTab: 0,
            defaults :{
                bodyPadding: 10,
                autoScroll: true
            },
            layoutOnTabChange: true,
            items: tabs,
            listeners: {
                tabchange: {
                    scope: this,
                    fn: function(panel, activetab, previoustab) {
                        if(activetab.getItemId() === 'help-tab' && !htmlEditorRendered) {
                            // HTML editor is rendered when the tab is first opened. This prevents a bug where the contents could not be edited
                            Ext.create('Ext.form.field.HtmlEditor', {
                                id: 'helpText',
                                name: 'helpText',
                                width: 600,
                                maxWidth: 600,
                                height: 400,
                                maxHeight: 400,
                                value: this.config.configObject.helpText ? this.config.configObject.helpText : '',
                                fieldLabel: i18next.t('viewer_admin_configpage_4'),
                                labelWidth: 100,
                                plugins: [
                                    new Ext.create('Ext.ux.form.HtmlEditor.imageUpload', Ext.apply(vieweradmin.components.DefaultConfgurations.getDefaultImageUploadConfig(), {
                                        submitUrl: this.getActionBeanUrl('imageupload'),
                                        managerUrl: Ext.urlAppend(this.getActionBeanUrl('imageupload'), "manage=t")
                                    })),
                                    new Ext.ux.form.HtmlEditor.Table(vieweradmin.components.DefaultConfgurations.getDefaultHtmlEditorTableConfig())
                                ],
                                renderTo: 'helpHtmlEditorContainer'
                            });
                            htmlEditorRendered = true;
                        }
                    }
                }
            },
            bbar: ["->", {
                xtype: 'button',
                text: i18next.t('viewer_admin_configpage_5'),
                id: 'cancalConfigButton',
                iconCls: 'x-fa fa-times',
                listeners: {
                    click: {
                        fn: function() {
                            window.location.reload();
                        },
                        scope: this
                    }
                }
            }, {
                xtype: 'button',
                text: i18next.t('viewer_admin_configpage_6'),
                id: 'saveConfigButton',
                iconCls: 'x-fa fa-floppy-o',
                listeners: {
                    click: {
                        fn: this.save,
                        scope: this
                    }
                }
            }]
        });
    },

    createMainTab: function() {
        if(this.config.metadata.hasOwnProperty("configSource")) {
            this.customConfiguration = new Ext.create("viewer.components.CustomConfiguration", "config", this.config.configObject, this);
        } else {
            this.createPropertyGrid();
        }
    },

    getApplicationId: function() {
        return this.config.applicationId;
    },

    getActionBeanUrl: function(name) {
        return this.config.actionBeans[name] || "";
    },

    getContextpath: function() {
        return this.config.contextPath;
    },

    getAppConfig: function() {
        return this.config.appConfig;
    },

    createPropertyGrid: function() {
        var source = this.config.configObject;
        if(source == null && this.hasPropertyGridConfig()) {
            /* set source to from component metadata  (default config) */
            source = this.config.metadata.extPropertyGridConfigs.source;
        }
        if(source != null) {
            var propertyNames = {};
            if(this.hasPropertyGridConfig() && this.config.metadata.extPropertyGridConfigs.hasOwnProperty("propertyNames")) {
                propertyNames = this.config.metadata.extPropertyGridConfigs.propertyNames;
            }
            /*
             * Check if all source config items exist in the metadata source items,
             * sometimes other items like isPopup would show up in the property grid,
             * because they are added to the configuration automatically, while these
             * are not configurable options. All configurable options should be in the
             * metadata source items
             */
            var extConfigSource = {};
            if(this.hasPropertyGridConfig() && this.config.metadata.extPropertyGridConfigs.hasOwnProperty("source")) {
                Ext.applyIf(source, this.config.metadata.extPropertyGridConfigs.source);
                Ext.Object.each(source, (function(key, value) {
                    if(this.config.metadata.extPropertyGridConfigs.source.hasOwnProperty(key)) {
                        extConfigSource[key] = value;
                    }
                }).bind(this));
            } else {
                extConfigSource = source;
            }
            this.propertyGrid = Ext.create('Ext.grid.property.Grid', {
                title: i18next.t('viewer_admin_configpage_7'),
                renderTo: "config",
                hideHeaders:true,
                scroll: 'vertical',
                nameColumnWidth: 290,
                columnWidth: 450,
                source: extConfigSource,
                propertyNames: propertyNames,
                width: 740
            });
        }
        if(this.config.metadata.hasOwnProperty('helpText') && this.config.metadata.helpText) {
            var helpDiv = document.createElement('div');
            helpDiv.className = 'extra-help-text';
            helpDiv.innerHTML = this.config.metadata.helpText;
            document.getElementById('config').appendChild(helpDiv);
        }
    },
    
    hasPropertyGridConfig: function() {
        return this.config.metadata.hasOwnProperty("extPropertyGridConfigs");
    },

    createHelpTab: function () {
        var showHelpButton = false; // Default is to show help button
        var helpForm = new Ext.form.FormPanel({
            frame: false,
            border: 0,
            items: [{
                xtype:'fieldset',
                columnWidth: 0.5,
                title: i18next.t('viewer_admin_configpage_8'),
                collapsible: false,
                defaultType: 'textfield',
                layout: 'anchor',
                defaults: {
                    width: 400
                },
                items:[
                    {
                        xtype: 'checkbox',
                        fieldLabel: i18next.t('viewer_admin_configpage_9'),
                        id: "showHelpButton",
                        name: 'showHelpButton',
                        checked: this.parseBooleanValue(this.config.configObject.showHelpButton),
                        labelWidth:100
                    },
                    {
                        xtype: 'textfield',
                        fieldLabel: i18next.t('viewer_admin_configpage_10'),
                        id: "helpUrl",
                        name: 'helpUrl',
                        value: this.config.configObject.helpUrl ? this.config.configObject.helpUrl : '',
                        labelWidth:100
                    },
                    {
                        xtype: 'container',
                        html: { tag: 'div', id: 'helpHtmlEditorContainer', style: 'width: 700px; height: 500px;' }
                    }]
            }],
            renderTo: "help"
        });
    },

    createLayoutTab: function () {
        if(!this.config.metadata.hasOwnProperty('type') || this.config.metadata.type !== "popup") {
            return;
        }
        if(this.config.currentRegion && Ext.Array.indexOf(['header', 'leftmargin_top', 'leftmargin_bottom', 'rightmargin_top', 'rightmargin_bottom', 'footer'], this.config.currentRegion) !== -1) {
            return;
        }

        var labelWidth = 300;
        var alignStore = Ext.create('Ext.data.ArrayStore', {
            autoDestroy: true,
            idIndex: 0,
            fields: [{
                name: 'name',
                type: 'string'
            }, {
                name: 'value',
                type: 'string'
            }],
            data: [
                ['Links-boven', 'tl'],
                ['Rechts-boven', 'tr'],
                ['Links-onder', 'bl'],
                ['Rechts-onder', 'br']
            ]
        });

        var defaults = {};
        if(this.customConfiguration) {
            defaults = this.customConfiguration.getDefaultValues().details || {};
        }

        this.layoutForm = new Ext.form.FormPanel({
            frame: false,
            width: 480,
            border: 0,
            items: [{
                xtype:'fieldset',
                columnWidth: 0.5,
                title: i18next.t('viewer_admin_configpage_12'),
                collapsible: false,
                defaultType: 'textfield',
                layout: 'anchor',
                items:[
                    {
                        xtype: 'radiogroup',
                        name: 'position',
                        columns: 1,
                        vertical: true,
                        value: this.config.details.position,
                        labelWidth:350,
                        items: [
                            {
                                boxLabel: i18next.t('viewer_admin_configpage_13'),
                                name: 'position',
                                inputValue: 'center' ,
                                checked: this.config.details.position === "center"
                            },
                            {
                                boxLabel: i18next.t('viewer_admin_configpage_14'),
                                name: 'position',
                                checked: this.config.details.position === "fixed",
                                inputValue: 'fixed',
                                listeners: {
                                    change: {
                                        fn: function (el) {
                                            this.toggleXY(el.getValue());
                                        },
                                        scope: this
                                    }
                                }
                            }
                        ]
                    },
                    {
                        xtype: 'textfield',
                        fieldLabel: i18next.t('viewer_admin_configpage_15'),
                        id: "x",
                        name: 'x',
                        value: this.config.details.x,
                        hidden : true,
                        labelWidth:100
                    },
                    {
                        xtype: 'textfield',
                        fieldLabel: i18next.t('viewer_admin_configpage_16'),
                        id: "y",
                        name: 'y',
                        value: this.config.details.y,
                        hidden : true,
                        labelWidth:100
                    },
                    {
                        xtype: 'combobox',
                        fieldLabel: i18next.t('viewer_admin_configpage_17'),
                        id: "alignposition",
                        name: 'alignposition',
                        value: this.config.details.alignposition,
                        hidden : true,
                        labelWidth:100,
                        store: alignStore,
                        displayField: 'name',
                        valueField: 'value',
                        queryMode: 'local'
                    },
                    {
                        xtype: 'checkbox',
                        fieldLabel: i18next.t('viewer_admin_configpage_18'),
                        inputValue: true,
                        name: 'changeablePosition',
                        checked: this.parseBooleanValue(this.config.details.changeablePosition),
                        labelWidth:labelWidth
                    }]
            },
                {
                    xtype:'fieldset',
                    columnWidth: 0.5,
                    title: i18next.t('viewer_admin_configpage_19'),
                    collapsible: false,
                    defaultType: 'textfield',
                    layout: 'anchor',
                    items:[{
                            xtype: 'textfield',
                            fieldLabel: i18next.t('viewer_admin_configpage_20'),
                            name: 'width',
                            value: this.config.details.width || defaults.minWidth || defaults.width,
                            labelWidth:100,
                            validator: function(value) {
                                // Always allow percentages and ignore if where is no minHeight
                                if(value.indexOf("%") !== -1 || !defaults.minWidth) {
                                    return true;
                                }
                                if(parseInt(value) < defaults.minWidth) {
                                    return "Minimale breedte is " + defaults.minWidth;
                                }
                                return true;
                            }
                        },
                        {
                            xtype: 'container',
                            html: defaults.minWidth ? 'Minimale breedte is ' + defaults.minWidth : '',
                            padding: defaults.minWidth ? '2 0 5 0' : 0,
                            style: {
                                color: '#666666'
                            }
                        },
                        {
                            xtype: 'textfield',
                            fieldLabel: i18next.t('viewer_admin_configpage_21'),
                            name: 'height',
                            value: this.config.details.height || defaults.minHeight || defaults.height,
                            labelWidth:100,
                            validator: function(value) {
                                // Always allow percentages and ignore if where is no minHeight
                                if(value.indexOf("%") !== -1 || !defaults.minHeight) {
                                    return true;
                                }
                                if(parseInt(value) < defaults.minHeight) {
                                    return "Minimale hoogte is " + defaults.minHeight;
                                }
                                return true;
                            }
                        },
                        {
                            xtype: 'container',
                            html: defaults.minHeight ? 'Minimale hoogte is ' + defaults.minHeight : '',
                            padding: defaults.minWidth ? '2 0 5 0' : 0,
                            style: {
                                color: '#666666'
                            }
                        },
                        {
                            xtype: 'checkbox',
                            fieldLabel: i18next.t('viewer_admin_configpage_22'),
                            inputValue: true,
                            name: 'changeableSize',
                            checked: this.parseBooleanValue(this.config.details.changeableSize),
                            labelWidth:labelWidth
                        }]
                }],

            renderTo: "layout"//(2)
        });
        if(this.config.details.position === "fixed"){
            this.toggleXY(true);
        }
    },

    createResponsiveConfig: function () {
        var minWidth = '';
        if(this.config.configObject.hasOwnProperty('requiredScreenWidth')) {
            minWidth = this.config.configObject.requiredScreenWidth;
        }
        this.responsiveLayoutForm = new Ext.form.FormPanel({
            frame: false,
            width: 520,
            border: 0,
            items: [{
                xtype:'fieldset',
                title: i18next.t('viewer_admin_configpage_23'),
                collapsible: false,
                items:[{
                    xtype: 'numberfield',
                    fieldLabel: i18next.t('viewer_admin_configpage_24'),
                    id: "requiredScreenWidth",
                    name: 'requiredScreenWidth',
                    value: minWidth,
                    labelWidth: 180
                },{
                    xtype: 'container',
                    html: i18next.t('viewer_admin_configpage_25') +
                    'te bepalen of een component wel of niet getoond moet worden. Als de schermafmetingen op dat' +
                    'moment kleiner zijn dan bovenstaande waarde dan wordt het component niet getoond.<br /><br />' +
                    'Bij een lege waarde (of 0) wordt het component altijd getoond'
                }]
            }],
            renderTo: "layout"
        });
    },

    createHeightLayoutTab: function () {
        var compHeight = '';
        if(this.config.configObject.hasOwnProperty('componentHeight')) {
            compHeight = this.config.configObject.componentHeight;
        }
        var componentLayoutForm = new Ext.form.FormPanel({
            frame: false,
            width: 480,
            border: 0,
            items: [{
                xtype:'fieldset',
                columnWidth: 0.5,
                title: i18next.t('viewer_admin_configpage_26'),
                collapsible: false,
                defaultType: 'textfield',
                layout: 'anchor',
                items:[{
                    xtype: 'numberfield',
                    fieldLabel: i18next.t('viewer_admin_configpage_27'),
                    id: "componentHeight",
                    name: 'componentHeight',
                    value: compHeight,
                    labelWidth:100
                }]
            }],
            renderTo: "layout"
        });
    },

    parseBooleanValue: function (val) {
        if (val === true || val === false) {
            return val;
        }
        if(typeof val === "undefined") {
            return false;
        }
        return ("true" === val);
    },

    toggleXY: function (show) {
        if(show){
            Ext.getCmp('x').show();
            Ext.getCmp('y').show();
            Ext.getCmp('alignposition').show();
        }else{
            Ext.getCmp('x').hide();
            Ext.getCmp('y').hide();
            Ext.getCmp('alignposition').hide();
        }
    },

    save: function (btn) {
        btn.focus();
        window.setTimeout(this._save.bind(this), 0);
    },

    _save: function() {
        if(this.config.metadata.configSource != undefined){
            var config = this.customConfiguration.getConfiguration();
            this.continueSave(config);
        }else{
            this.getPropertyGridConfig();
        }
    },

    getPropertyGridConfig: function () {
        var config = this.propertyGrid.getSource();
        this.continueSave(config);
    },

    continueSave: function (config) {
        if(this.config.metadata.hasOwnProperty("type") && this.config.metadata.type == "popup") {
            config.isPopup = true;
            var layout = {};
            var defaults = {};
            if(this.customConfiguration) {
                defaults = this.customConfiguration.getDefaultValues().details || {};
            }
            if(this.layoutForm) {
                var formFields = this.layoutForm.query("field");
                var radiogroups = this.layoutForm.query("radiogroup");
                // Iterate over all the fields to add the value to the layout object
                Ext.Array.each(formFields, function(field) {
                    var value = field.getValue();
                    var name = field.getName();
                    if(value !== "" && value !== "null") {
                        if(name === "width" || name === "height") {
                            var minKey = "min" + this.capitalizeFirstLetter(name);
                            if(defaults[minKey] && value.indexOf("%") === -1 && value < defaults[minKey]) {
                                value = defaults[minKey];
                            }
                        }
                        layout[name] = value;
                    }
                }, this);
                // Iterate over the radiogroups (position) and apply the value of the group to the layout object
                Ext.Array.each(radiogroups, function(group) {
                    Ext.apply(layout, group.getValue());
                });
            }
            var layoutFormObject = Ext.get("componentLayout");
            layoutFormObject.dom.value =  JSON.stringify(layout);
        }else{
            config.isPopup = false;
        }
        if(this.showHelp()) {
            var helpUrl = Ext.getCmp('helpUrl'), helpText = Ext.getCmp('helpText'), showHelpButton = Ext.getCmp('showHelpButton');
            if(helpUrl && helpUrl.getValue() !== '') {
                config['helpUrl'] = helpUrl.getValue();
            }
            if(helpText && helpText.getValue() !== '') {
                config['helpText'] = helpText.getValue();
            }
            if(showHelpButton) {
                config['showHelpButton'] = showHelpButton.getValue() ? "true" : "false";
            }
        }
        if(this.showConfigureHeight()) {
            var heightConfig = Ext.getCmp('componentHeight');
            if(heightConfig && heightConfig.getValue() !== '') {
                config['componentHeight'] = parseInt(heightConfig.getValue(), 10);
            }
        }
        var responsiveWidthConfig = Ext.getCmp('requiredScreenWidth');
        if(responsiveWidthConfig && responsiveWidthConfig.getValue() !== '') {
            config['requiredScreenWidth'] = parseInt(responsiveWidthConfig.getValue(), 10);
        }
        var configFormObject = Ext.get("configObject");
        configFormObject.dom.value = JSON.stringify(config);
        document.getElementById('configForm').submit();
    },

    capitalizeFirstLetter: function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    showHelp: function () {
        return this.config.metadata.hasOwnProperty("showHelp") && this.config.metadata.showHelp;
    },

    showConfigureHeight: function () {
        var heightRegions = ["leftmargin_top", "leftmargin_bottom", "rightmargin_top", "rightmargin_bottom"];
        if(!this.config.metadata.hasOwnProperty('restrictions')) {
            return false;
        }
        for(var i = 0; i < this.config.metadata.restrictions.length; i++) {
            for(var j = 0; j < heightRegions.length; j++) {
                if(this.config.metadata.restrictions[i] === heightRegions[j]) {
                    return true;
                }
            }
        }
        return false;
    }

});