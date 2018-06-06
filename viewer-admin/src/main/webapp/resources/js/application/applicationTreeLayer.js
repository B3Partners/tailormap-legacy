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

Ext.define('vieweradmin.components.ApplicationTreeLayer', {

    requires: [
        'Ext.tree.*',
        'Ext.data.*',
        'Ext.tab.*',
        'Ext.panel.*'
    ],

    config: {
        attributes: [],
        editable: false,
        applicationLayer: "",
        applicationLayerFeatureType: "",
        displayName: "",
        stylesTitleJson: {},
        imagePath: "",
        actionBeans: {
            imageupload: "",
            appTreeLayer: "",
            featureSourceURL: "",
            featureTypesURL: "",
            attributesURL: "",
            getDBValuesUrl: ""
        }
    },

    tabComponents: [],
    namedLayerTitle: "",
    styleTitle: "",
    htmlEditorRendered: false,
    contextHtmlEditorRendered: false,

    constructor: function(config) {
        this.initConfig(config);
        this.defineModels();
        this.initTabpanel();
        this.initToggleHtmlPlaintextEditor();
        this.initSlider();
        this.initListeners();
        this.updateStyleTitles();
        if(this.config.displayName) {
            // If layer was renamed, rename node in tree
            var frameParent = this.getParent();
            if (frameParent && frameParent.renameNode) {
                frameParent.renameNode('s' + this.config.applicationLayer, this.config.displayName);
            }
        }
    },

    defineModels: function() {
        Ext.define('FeatureSourceModel', {
            extend: 'Ext.data.Model',
            fields: [
                {name: 'id', type: 'int' },
                {name: 'status', type: 'string'},
                {name: 'name', type: 'string'},
                {name: 'url', type: 'string'},
                {name: 'protocol', type: 'string'}
            ]
        });
        Ext.define('FeatureTypeModel', {
            extend: 'Ext.data.Model',
            fields: [
                {name: 'id', type: 'int' },
                {name: 'name', type: 'string'}
            ]
        });
        Ext.define('AttributeModel', {
            extend: 'Ext.data.Model',
            fields: [
                {name: 'id', type: 'int' },
                {name: 'attribute', type: 'string' },
                {name: 'alias', type: 'string' },
                {name: 'type', type: 'string'}
            ]
        });
    },

    initTabpanel: function() {
        Ext.select('.tabdiv', true).removeCls('tabdiv').setVisibilityMode(Ext.dom.Element.OFFSETS).setVisible(false);

        var filterItems = this.getFilterTabItems();
        var editItems = this.getEditTabItems();

        var tabconfig = [{
            itemId:'settings-tab',
            contentEl:'settings-tab',
            title: 'Instellingen'
        },{
            itemId:'rights-tab',
            contentEl:'rights-tab',
            title: 'Rechten'
        }];
     if(this.config.attributes.length !== 0) {
            var attributeOrder = Ext.create("vieweradmin.components.ApplicationTreeLayerAttributes", {
                attributes: this.config.attributes,
                imagePath: this.config.imagePath
            });
            this.tabComponents.push({ config: "attributeOrder", component: attributeOrder });
            tabconfig.push({
                xtype: 'container',
                width: '100%',
                title: 'Attributen',
                layout: { type: 'hbox', align: "stretch" },
                items: attributeOrder.getItems()
            });
        }

        if(editItems.length !== 0) {
            tabconfig.push({
                xtype: 'container',
                width: '100%',
                title: 'Edit',
                padding: 10,
                layout: 'auto',
                scrollable: true,
                items: editItems,
                itemId: 'edit-tab'
            });
        } else {
            tabconfig.push({
                itemId:'edit-tab',
                contentEl:'edit-tab',
                title: 'Edit'
            });
        }
        if(filterItems.length !== 0) {
            tabconfig.push({
                xtype: 'container',
                width: '100%',
                title: 'Filter / Selectie',
                padding: 10,
                layout: 'auto',
                scrollable: true,
                items: filterItems,
                itemId:'filter-tab'
            });
        } else {
            tabconfig.push({
                itemId:'filter-tab',
                contentEl:'filter-tab',
                title: 'Filter / Selectie'
            });
        }
        tabconfig.push({
            itemId:'context-tab',
            contentEl:'context-tab',
            title: 'Context'
        });

        var tabpanel = Ext.create('Ext.tab.Panel', {
            title: "Bewerken kaartlaag",
            renderTo: 'tabs',
            width: '100%',
            height: '100%',
            activeTab: 0,
            defaults :{
                bodyPadding: 10,
                scrollable: true
            },
            layoutOnTabChange: false,
            items: tabconfig,
            listeners: {
                tabchange: {
                    fn: function (panel, activetab, previoustab) {
                        if (activetab.getItemId() === 'context-tab' && !this.htmlEditorRendered) {
                            // HTML editor is rendered when the tab is first opened. This prevents a bug where the contents could not be edited
                            Ext.create('Ext.form.field.HtmlEditor', {
                                itemId: 'extContextHtmlEditor',
                                width: 475,
                                maxWidth: 475,
                                height: 400,
                                maxHeight: 400,
                                value: Ext.get('context_textarea').dom.value,
                                plugins: [
                                    new Ext.create('Ext.ux.form.HtmlEditor.imageUpload', Ext.apply(vieweradmin.components.DefaultConfgurations.getDefaultImageUploadConfig(), {
                                        submitUrl: this.config.actionBeans['imageupload'],
                                        managerUrl: Ext.urlAppend(this.config.actionBeans['imageupload'], "manage=t")
                                    })),
                                    new Ext.ux.form.HtmlEditor.Table(vieweradmin.components.DefaultConfgurations.getDefaultHtmlEditorTableConfig())
                                ],
                                renderTo: 'contextHtmlEditorContainer'
                            });
                            this.htmlEditorRendered = true;
                        }
                    },
                    scope: this
                }
            },
            bbar: [
                "->",
                {
                    xtype: 'button',
                    text: 'Opslaan',
                    listeners: {
                        click: {
                            fn: this.doSave,
                            scope: this
                        }
                    }
                }, {
                    xtype: 'button',
                    text: 'Annuleren',
                    listeners: {
                        click: {
                            fn: this.doCancel,
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

    getFilterEditDefaults: function() {
        return {
            width: '100%',
            animCollapse: false,
            collapsible: true,
            titleCollapse: true,
            hideCollapseTool: true,
            bodyPadding: '8px 10px',
            collapsedCls: 'headerCollapsed',
            fieldDefaults: {
                labelWidth: 170,
                size: 40
            },
            listeners: {
                beforeexpand: function(panel){
                    Ext.Array.each(panel.findParentByType('container').items.items, function(item) {
                        if(item.collapse && item.getItemId() !== "autorisatie-panel") {
                            item.collapse();
                        }
                    });
                }
            }
        };
    },

    getFilterTabItems: function() {
        var filterPanelItems = [];
        if(!Ext.isArray(this.config.attributes) || this.config.attributes.length === 0) {
            return filterPanelItems;
        }
        filterPanelItems.push(Ext.create('Ext.container.Container', { html: '<a href="#Dataselectie_Filterfunctie_Per_Kaartlaag_Help" title="Help" class="helplink"></a>' }));
        Ext.Array.each(this.config.attributes, function(attribute, idx) {
            var name = attribute.alias || attribute.name;
            var isEnabled = (attribute.filterable || attribute.selectable) || false;
            var defaultValueHidden = !(attribute.selectable || false);
            filterPanelItems.push(Ext.create('Ext.form.Panel', Ext.apply(this.getFilterEditDefaults(), {
                itemId: 'filter' + attribute.id,
                height: 240,
                title: name + (isEnabled ? ' (&times;)' : ''),
                iconCls: "x-fa fa-wrench",
                collapsed: idx !== 0,
                items: [
                    { fieldLabel: 'Filterbaar / Selecteerbaar', name: 'filterable_selectable', inputValue: 1, checked: isEnabled, xtype: 'checkbox',  labelWidth: 150, listeners: {
                        change: {
                            fn: function (field, newval) {
                                var panel = field.findParentByType('form');
                                var filterRadio = this.getComponentByItemId('#filterable' + attribute.id);
                                filterRadio.setDisabled(!newval);
                                filterRadio.setValue(false);
                                var selectRadio = this.getComponentByItemId('#selectable' + attribute.id);
                                selectRadio.setDisabled(!newval);
                                selectRadio.setValue(false);
                                this.editPanelTitle(panel, name, newval);
                            },
                            scope: this
                        }
                    }},
                    {
                        xtype: 'container',
                        layout: 'hbox',
                        items: [
                            { xtype: 'displayfield', fieldLabel: 'Attribuut gebruiken bij' },
                            {
                                itemId: 'filterable' + attribute.id, fieldLabel: 'Filteren', name: 'filterable' + attribute.id, inputValue: 'filter', checked: attribute.filterable, disabled: !isEnabled, xtype: 'radio', labelAlign: 'right',
                                listeners:{
                                    change: {
                                        fn: function (field, newval) {
                                            var comp = this.getComponentByItemId('#default_filter' + attribute.id);
                                            comp.setVisible(false);
                                            if (newval) {
                                                comp.setVisible(true);
                                            }
                                            this.getComponentByItemId('#filter' + attribute.id).updateLayout();
                                        }
                                    },
                                    scope: this
                                }
                            },
                            {
                                itemId: 'selectable' + attribute.id,
                                fieldLabel: ' &nbsp;Dataselectie',
                                name: 'filterable' + attribute.id,
                                inputValue: 'select',
                                checked: attribute.selectable,
                                disabled: !isEnabled,
                                xtype: 'radio',
                                labelAlign: 'right',
                                listeners: {
                                    change: {
                                        fn: function (field, newval) {
                                            var comp = this.getComponentByItemId('#default' + attribute.id);
                                            comp.setVisible(false);
                                            if (newval) {
                                                comp.setVisible(true);
                                            }
                                            this.getComponentByItemId('#filter' + attribute.id).updateLayout();
                                        },
                                        scope: this
                                    }
                                }
                            }
                        ]
                    },
                    {
                        xtype: 'container',
                        name: 'default_filter' + attribute.id,
                        itemId: 'default_filter' + attribute.id,
                        hidden: !(attribute.filterable || false),
                        hideMode: 'display',
                        items: [
                            {
                                itemId: 'filter_list' + attribute.id,
                                fieldLabel: 'Lijst*',
                                name: 'minmaxlist' + attribute.id,
                                inputValue: 'defaultList',
                                checked: attribute.defaultValue == "filterList",
                                xtype: 'checkbox'
                            },{
                                text: "* Als 'Lijst' is aangevinkt dan zal er voor \n\
                                    het waarde veld van dit attribuut een lijst met alle mogelijke waarden worden gemaakt.",
                                xtype: 'label',
                                hideMode: 'display'
                            }
                        ]
                    },
                    {
                        xtype: 'container',
                        name: 'default' + attribute.id,
                        itemId: 'default' + attribute.id,
                        hidden: defaultValueHidden,
                        hideMode: 'visibility',
                        items:[
                            {
                                xtype: 'container',
                                layout: 'hbox',
                                items:[
                                    {
                                        itemId: 'min' + attribute.id,
                                        fieldLabel: 'Minimale waarde',
                                        name: 'minmaxlist' + attribute.id,
                                        inputValue: 'defaultMin',
                                        checked: attribute.defaultValue == "#MIN#",
                                        xtype: 'radio',
                                        labelAlign: 'right'
                                    },
                                    {
                                        itemId: 'max' + attribute.id,
                                        fieldLabel: 'Maximale waarde',
                                        name: 'minmaxlist' + attribute.id,
                                        inputValue: 'defaultMax',
                                        checked: attribute.defaultValue == "#MAX#",
                                        xtype: 'radio',
                                        labelAlign: 'right'
                                    },
                                    {
                                        itemId: 'list' + attribute.id,
                                        fieldLabel: 'Lijst',
                                        name: 'minmaxlist' + attribute.id,
                                        inputValue: 'defaultList',
                                        checked: attribute.defaultValue != "#MAX#" && attribute.defaultValue != "#MIN#",
                                        xtype: 'radio',
                                        labelAlign: 'right',
                                        listeners: {
                                            change: {
                                                fn: function (field, newval) {
                                                    var comp = this.getComponentByItemId('#defaultList' + attribute.id);
                                                    comp.setVisible(false);
                                                    if (newval) {
                                                        comp.setVisible(true);
                                                    }
                                                    this.getComponentByItemId('#filter' + attribute.id).updateLayout();
                                                },
                                                scope: this
                                            }
                                        }
                                    }
                                ]
                            },
                            {
                                xtype: 'container',
                                itemId: 'defaultList' + attribute.id,
                                layout: 'hbox',
                                hidden: attribute.defaultValue == "#MAX#" || attribute.defaultValue == "#MIN#",
                                hideMode: 'visibility',
                                items:[
                                    {
                                        xtype: 'combobox',
                                        data: [],
                                        queryMode: 'local',
                                        hideMode: 'visibility',
                                        name: 'defaultVal' + attribute.id,
                                        itemId: 'defaultVal' + attribute.id,
                                        fieldLabel: 'Defaultwaarde',
                                        emptyText:'Maak uw keuze',
                                        value: attribute.defaultValue,
                                        displayField: 'id',
                                        valueField: 'id'
                                    },
                                    {
                                        xtype: 'button',
                                        text: 'DB',
                                        style: { marginLeft: '10px' },
                                        hideMode: 'visibility',
                                        listeners: {
                                            click: {
                                                fn: function() {
                                                    this.getDBValues(attribute.name,attribute.id, "dataselection");
                                                },
                                                scope:this
                                            }
                                        }
                                    }
                                ]
                            },
                            {
                                itemId: 'dataselectionLabel' + attribute.id, text: "Bij deze attributen moet een dataselectie component geconfigureerd worden!",
                                xtype: 'label',
                                forId:  'selectable' + attribute.id,
                                hideMode: 'visibility'
                            }
                        ]
                    }
                ]
            })));
        }, this);
        return filterPanelItems;
    },

    getEditTabItems: function() {

        var editPanelItems = [];
        if(!this.config.editable || !Ext.isArray(this.config.attributes) || this.config.attributes.length === 0) {
            return editPanelItems;
        }
        editPanelItems.push(Ext.create('Ext.container.Container', { html: '<a href="#Edit_Per_Kaartlaag_Help" title="Help" class="helplink"></a>' }));
        var data =[];
        Ext.Array.each(this.config.attributes, function(attribute, idx) {
            var name = attribute.alias || attribute.name;
            if(attribute.featureType !== this.config.applicationLayerFeatureType) {
                return;
            }
            editPanelItems.push(Ext.create('Ext.form.Panel', Ext.apply(this.getFilterEditDefaults(), {
                itemId: 'edit' + attribute.id,
                title: name + (attribute.editable ? ' (&times;)' : ''),
                height: this.getAttributeEditHeight(attribute.valueList),
                iconCls: "x-fa fa-wrench",
                collapsed: idx !== 0,
                items: this.getAttributeEditSettings(attribute, name)
            })));
            data.push({
                name: attribute.alias || attribute.name,
                value: attribute.name
            });
        }, this);
        var attributeStore = Ext.create('Ext.data.Store', {
            fields: ['value', 'name'],
            data: data
        });
        var usernameAttrValue = "";
        if (Ext.get('details_editfeature_usernameAttribute')){
            usernameAttrValue = Ext.get('details_editfeature_usernameAttribute').getValue();
        }
        editPanelItems.push({
            xtype: 'panel',
            title: 'Autorisatie',
            itemId: 'autorisatie-panel',
            style: {
                "margin-top": "5px"
            },
            items: [{
                xtype: 'label',
                text: 'Kies een attribuut waarvan de ingelogde username het \n\
zelfde moet zijn als een gebruiker de betreffende feature mag wijzigen. Indien leeg wordt\n\
hier niet op gecontroleerd.'
            },{
                xtype: 'combobox',
                store: attributeStore,
                displayField: 'name',
                queryMode: 'local',
                hideMode: 'visibility',
                fieldLabel: 'Attribuut',
                itemId: 'ext_editfeature_usernameAttribute',
                labelWidth: 150,
                value: usernameAttrValue
            }]
        });


        var upload = false;
        var types = [];
        var uploadCategories = [this.createUploadBox("",0, false)];
        if (Ext.get('details_editfeature_uploadDocument')){
            upload = Ext.get('details_editfeature_uploadDocument').getValue();
            types= Ext.get('details_editfeature_uploadDocument_types').getValue();
            if(types && types.length > 0){
                types = Ext.JSON.decode(types);
                uploadCategories = [];
                for(var i = 0 ; i < types.length;i++){
                    uploadCategories.push(this.createUploadBox(types[i], false,i));
                }
            }
        }

        editPanelItems.push({
            xtype: 'panel',
            title: 'Upload',

            itemId: 'upload-panel',
            id: 'upload-panel',
            style: {
                "margin-top": "5px"
            },
            items: [{
                xtype: 'label',
                text: 'Maak het mogelijk om bestanden te uploaden'
            }, {
                fieldLabel: 'Maak het mogelijk om bestanden te uploaden',
                name: 'uploadDocuments',
                inputValue: false,
                itemId: 'ext_details_editfeature_uploadDocument',
                checked: upload,
                xtype: 'checkbox'
            },
                {
                    xtype: "container",
                    name: "uploadTypes",
                    id: "uploadTypes",
                    items: uploadCategories
                },
                {
                    xtype: 'button',
                    text: '+',
                    style: {
                        marginLeft: '10px'
                    },
                    listeners: {
                        click: {
                            fn: function () {
                                this.createUploadBox("", true);
                            },
                            scope: this
                        }
                    }
                }
            ]
        });

        return editPanelItems;
    },
    createUploadBox: function (value, append, idx) {
        var container = Ext.getCmp("uploadTypes");
        var index = container ? container.items.items.length  : idx;
        var config = {
            fieldLabel: 'Categorie upload',
            name: 'uploadType' + (index),
            value: value,
            xtype: 'textfield'
        };
        if(append){
            container.insert(index -1,Ext.create("Ext.form.field.Text", config));
        }
        return config;
    },

    getAttributeEditSettings: function(attribute, name) {

        var possibleValues = attribute.editValues;
        var possibleValuesFormItems = [
            { fieldLabel: 'Mogelijke waarden', name: 'editvalues', itemId: 'editvalues' + attribute.id, xtype: 'textfield',flex:1,value:possibleValues},
            { xtype: 'button', text: 'DB', style: { marginLeft: '10px' }, listeners: {
                click: {
                    fn: function () {
                        this.getDBValues(attribute.name, attribute.id, "edit");
                    },
                    scope: this
                }
            }}
        ];

        var isGeometry = false;
        if(typeof attribute.featureTypeAttribute !== 'undefined') {
            var type = attribute.featureTypeAttribute.type;
            var geomTypes = ["geometry","point","multipoint","linestring","multilinestring","polygon","multipolygon"];
            var geomTypesStore = Ext.create('Ext.data.Store', {
                fields: ['type', 'label'],
                data : [
                    {"type":"geometry", "label":"Onbekend (alleen bewerken)"},
                    {"type":"point", "label":"Punt"},
                    {"type":"linestring", "label":"Lijn"},
                    {"type":"polygon", "label":"Vlak"}
                ]
            });
            if(Ext.Array.contains(geomTypes, type)) {
                isGeometry = true;
                if(possibleValues) {
                    type = possibleValues[0];
                }
                // edit only for single geometries
                type = type.replace("multi","");
                possibleValuesFormItems = [{
                    fieldLabel: 'Geometrietype',
                    store: geomTypesStore,
                    xtype: 'combobox',
                    name: 'editvalues',
                    itemId: 'editvalues' + attribute.id,
                    queryMode: 'local',
                    displayField: 'label',
                    valueField: 'type',
                    emptyText:'Maak uw keuze',
                    value: type,
                    size: 40
                }];
            }
        }

        var featureSourceStore = Ext.create('Ext.data.Store', {
            model: 'FeatureSourceModel',
            sorters: 'name',
            autoLoad: attribute.valueList === "dynamic",
            proxy: {
                type: 'ajax',
                url: this.config.actionBeans.featureSourceURL,
                reader: {
                    type: 'json',
                    root: 'gridrows',
                    totalProperty: 'totalCount'
                },
                simpleSortMode: true
            },
            listeners: {
                load: {
                    fn: function (store, records) {
                        this.setValueAndEnable('#valueListFeatureSource' + attribute.id, records, attribute.valueListFeatureSource, 'id');
                    },
                    scope: this
                }
            }
        });

        var featureTypeStore = Ext.create('Ext.data.Store', {
            model: 'FeatureTypeModel',
            sorters: 'name',
            proxy: {
                type: 'ajax',
                url: this.config.actionBeans.featureTypesURL,
                reader: {
                    type: 'json'
                },
                simpleSortMode: true
            },
            listeners: {
                load: {
                    fn: function (store, records) {
                        this.setValueAndEnable('#valueListFeatureType' + attribute.id, records, attribute.valueListFeatureType, 'id');
                    },
                    scope: this
                }
            }
        });

        var attributeStore = Ext.create('Ext.data.Store', {
            model: 'AttributeModel',
            sorters: 'name',
            proxy: {
                type: 'ajax',
                limitParam:'',
                url: this.config.actionBeans.attributesURL,
                reader: {
                    root: 'gridrows',
                    type: 'json'
                },
                simpleSortMode: true
            },
            listeners: {
                load: {
                    fn: function (store, records) {
                        this.setValueAndEnable('#valueListValueAttribute' + attribute.id, records, attribute.valueListValueName, 'attribute');
                        this.setValueAndEnable('#valueListLabelAttribute' + attribute.id, records, attribute.valueListLabelName, 'attribute');
                    },
                    scope: this
                }
            }
        });

        // Initial load of store if attribute valuelist is dynamic
        if(attribute.valueList && attribute.valueList === "dynamic") {
            featureSourceStore.load();
        }

        var disableUserEdit = false;
        if (attribute.disableUserEdit) {
            disableUserEdit = true;
        }
        return [
            {
                fieldLabel: 'Toon in Edit component', name: 'editable', inputValue: 1, checked: attribute.editable, xtype: 'checkbox', listeners: {
                change: {
                    fn: function (field, newval) {
                        this.editPanelTitle(field.findParentByType('form'), name, newval);
                    },
                    scope: this
                }
            }
            },
            {
                fieldLabel: 'Bewerkbaar', value: disableUserEdit, name: 'disableUserEdit', store: [[false, 'Ja'], [true, 'Nee (alleen lezen)']], xtype: 'combobox'
            },
            {
                fieldLabel: 'Alias', name: 'editAlias', value: attribute.editAlias, xtype: 'textfield'
            },
            {
                xtype: 'container',
                items: [
                    {
                        xtype: 'container',
                        layout: 'hbox',
                        hidden: isGeometry,
                        items: [
                            {xtype: 'displayfield', fieldLabel: 'Waardelijst', labelWidth: '190px'},
                            {
                                fieldLabel: 'Statisch',
                                name: 'valueList',
                                itemId: 'valueListStatic' + attribute.id,
                                inputValue: 'static',
                                labelAlign: 'right',
                                value: attribute.valueList ? attribute.valueList === "static" : true,
                                xtype: 'radio',
                                listeners: {
                                    change: {
                                        fn: function (field, newval) {
                                            this.toggleStaticDynamic(newval ? 'static' : 'dynamic', attribute);
                                        },
                                        scope: this
                                    }
                                }
                            },
                            {
                                fieldLabel: 'Dynamisch',
                                name: 'valueList',
                                inputValue: 'dynamic',
                                itemId: 'valueListDynamic' + attribute.id,
                                labelAlign: 'right',
                                value: attribute.valueList ? attribute.valueList === "dynamic" : false,
                                xtype: 'radio',
                                listeners: {
                                    change: {
                                        fn: function (field, newval) {
                                            this.toggleStaticDynamic(newval ? 'dynamic' : 'static', attribute);
                                            if (newval) {
                                                featureSourceStore.load();
                                            }
                                        },
                                        scope: this
                                    }
                                }
                            }
                        ]
                    }, {
                        xtype: 'container',
                        itemId: 'staticListValues' + attribute.id,
                        layout: 'hbox',
                        hidden: !isGeometry && attribute.valueList === "dynamic",
                        items: possibleValuesFormItems
                    },
                    {
                        xtype: 'container',
                        layout: 'vbox',
                        itemId: 'dynamicListValues' + attribute.id,
                        hidden: !isGeometry && attribute.valueList !== "dynamic",
                        defaults: {
                            xtype: 'combo',
                            width: 400,
                            queryMode: 'local',
                            hideMode: 'visibility',
                            disabled: true
                        },
                        items: [
                            {
                                store: featureSourceStore,
                                name: 'valueListFeatureSource',
                                itemId: 'valueListFeatureSource' + attribute.id,
                                fieldLabel: 'Attribuutbron',
                                emptyText: 'Maak uw keuze',
                                displayField: 'name',
                                valueField: 'id',
                                listeners:{
                                    change: function(combo, featureSourceId){
                                        featureTypeStore.load({
                                            params: {
                                                featureSourceId: featureSourceId
                                            }
                                        });
                                    }
                                }
                            },
                            {
                                store: featureTypeStore,
                                name: 'valueListFeatureType',
                                itemId: 'valueListFeatureType' + attribute.id,
                                fieldLabel: 'Attribuutlijst',
                                emptyText: 'Maak uw keuze',
                                displayField: 'name',
                                valueField: 'id',
                                listeners: {
                                    change: function (combo, featureTypeId) {
                                        attributeStore.load({
                                            params: {
                                                simpleFeatureTypeId: featureTypeId
                                            }
                                        });
                                    }
                                }
                            },
                            {
                                store: attributeStore,
                                name: 'valueListValueAttribute',
                                itemId: 'valueListValueAttribute' + attribute.id,
                                fieldLabel: 'Waarde attribuut',
                                emptyText: 'Maak uw keuze',
                                displayField: 'attribute',
                                valueField: 'attribute'
                            },
                            {
                                store: attributeStore,
                                name: 'valueListLabelAttribute',
                                itemId: 'valueListLabelAttribute' + attribute.id,
                                fieldLabel: 'Label attribuut',
                                emptyText: 'Maak uw keuze',
                                displayField: 'attribute',
                                valueField: 'attribute'
                            }
                        ]
                    }
                ]
            },
            {
                fieldLabel: 'Hoogte', name: 'editHeight', value: attribute.editHeight, xtype: 'textfield'
            },
            {
                fieldLabel: 'Alleen keuze uit lijst', name: 'allowValueListOnly', inputValue: 1, checked: attribute.allowValueListOnly || 0, xtype: 'checkbox'
            },
            {
                fieldLabel: 'Geen lege waarde toestaan', name: 'disallowNullValue', inputValue: 1, checked: attribute.disallowNullValue || 0, xtype: 'checkbox'
            }
        ];
    },

    initToggleHtmlPlaintextEditor: function() {
        var toggle = document.querySelector('.use-plain-text-editor');
        toggle.addEventListener('change', this.toggleHtmlEditor.bind(this));
        this.toggleHtmlEditor();
    },

    toggleHtmlEditor: function() {
        var toggle = document.querySelector('.use-plain-text-editor');
        var textarea = document.getElementById('details_summary_description');
        var editorcontainer = document.getElementById('details_summary_description_container');
        if(!toggle.checked) {
            textarea.style.display = 'none';
            editorcontainer.style.display = 'block';
            if(!this.contextHtmlEditorRendered) {
                this.initHtmlEditor();
                this.contextHtmlEditorRendered = true;
            }
        } else {
            editorcontainer.style.display = 'none';
            textarea.style.display = 'block';
        }
    },

    initHtmlEditor: function () {
        Ext.create('Ext.form.field.HtmlEditor', {
            itemId: 'extSettingsHtmlEditor',
            width: 475,
            maxWidth: 475,
            height: 150,
            maxHeight: 150,
            value: Ext.get('details_summary_description').dom.value,
            plugins: [
                new Ext.create('Ext.ux.form.HtmlEditor.imageUpload', Ext.apply(vieweradmin.components.DefaultConfgurations.getDefaultImageUploadConfig(), {
                    submitUrl: this.config.actionBeans['imageupload'],
                    managerUrl: Ext.urlAppend(this.config.actionBeans['imageupload'], "manage=t")
                })),
                new Ext.ux.form.HtmlEditor.Table(vieweradmin.components.DefaultConfgurations.getDefaultHtmlEditorTableConfig())
            ],
            renderTo: 'details_summary_description_container'
        });
    },

    initSlider: function() {
        Ext.create('Ext.slider.Single', {
            width: 200,
            value: Ext.get('details_transparency').dom.value || 0,
            increment: 1,
            minValue: 0,
            maxValue: 100,
            margin: '0px 2px 0px 0px',
            renderTo: 'details_transparency_slider',
            listeners: {
                changecomplete: function(slider, val) {
                    Ext.get('details_transparency').dom.value = val;
                }
            }
        });
    },

    initListeners: function() {
        // Ext.get('apptreelayerform').on('submit', this.doSave, this);
        // document.querySelector(".cancel-button").addEventListener("click", this.doCancel.bind(this));
        if(document.getElementById('styleSelect')) {
            document.getElementById('styleSelect').addEventListener("change", this.updateStyleTitles.bind(this));
        }
        document.getElementById('layerTitle').addEventListener("click", (function() {
            this.setTitleAlias('layer');
        }).bind(this));
        document.getElementById('styleTitle').addEventListener("click", (function() {
            this.setTitleAlias('style');
        }).bind(this));
        this.initAttributeGroupClick();
    },

    doSave: function() {
        document.getElementById('attributesJSON').value = this.getJson();
        var settingsHtmlEditor = this.getComponentByItemId('#extSettingsHtmlEditor');
        var toggle = document.querySelector('.use-plain-text-editor');
        if(settingsHtmlEditor && !toggle.checked) {
            document.getElementById('details_summary_description').value = settingsHtmlEditor.getValue();
        }
        var htmlEditor = this.getComponentByItemId('#extContextHtmlEditor');
        if(htmlEditor) {
            document.getElementById('context_textarea').value = htmlEditor.getValue();
        }
        if (document.getElementById('details_editfeature_usernameAttribute') && this.getComponentByItemId('#ext_editfeature_usernameAttribute')){
            document.getElementById('details_editfeature_usernameAttribute').value = this.getComponentByItemId('#ext_editfeature_usernameAttribute').getValue();
        }

        if (document.getElementById('details_editfeature_uploadDocument') && this.getComponentByItemId('#ext_details_editfeature_uploadDocument')){
            document.getElementById('details_editfeature_uploadDocument').value = this.getComponentByItemId('#ext_details_editfeature_uploadDocument').getValue();
            var items = Ext.getCmp("uploadTypes").items.items;
            var typeConfig = [];
            for(var i = 0 ; i < items.length;i++){
                var item = items[i];
                typeConfig.push(item.getValue());
            }
            document.getElementById('details_editfeature_uploadDocument_types').value = Ext.JSON.encode(typeConfig);
        }

        var frm = document.forms[0];
        frm.action = "?save=t";
        frm.submit();
    },

    doCancel: function() {
        document.location.href = this.config.actionBeans.appTreeLayer + '?edit=t&applicationLayer=' + this.config.applicationLayer;
    },

    toggleStaticDynamic: function(type, attribute) {
        this.getComponentByItemId('#dynamicListValues' + attribute.id).setVisible(type === 'dynamic');
        this.getComponentByItemId('#staticListValues' + attribute.id).setVisible(type === 'static');
        this.getComponentByItemId('#edit' + attribute.id).setHeight(this.getAttributeEditHeight(type)).updateLayout();
    },

    getAttributeEditHeight: function(type) {
        var STATIC_HEIGHT = 370;
        var DYNAMIC_HEIGHT = 505;
        return type === 'dynamic' ? DYNAMIC_HEIGHT : STATIC_HEIGHT;
    },

    editPanelTitle: function(panel, name, checked) {
        panel.setTitle(name + (checked ? ' (&times;)' : ''));
    },

    setValueAndEnable: function(id, records, value, recordvalue) {
        var combo = this.getComponentByItemId(id);
        if(typeof value !== "undefined" && typeof records !== "undefined") for(var i = 0; i < records.length; i++) {
            if(records[i].get(recordvalue) === value) {
                combo.setValue(records[i]);
            }
        }
        combo.setDisabled(false);
    },

    getJson: function() {
        var currentAttributes = [];
        Ext.Array.each(this.config.attributes, function(attribute) {
            var newAttribute = attribute;
            var editPanel = this.getComponentByItemId('#edit' + attribute.id);
            if (typeof editPanel !== 'undefined'){
                editPanel.getForm().getFields().each(function(field) {
                    if(field.getXType && field.getXType() === 'displayfield') {
                        return;
                    }
                    newAttribute[field.getName()] = field.getValue();
                });

                if(newAttribute["editvalues"] != undefined && newAttribute["editvalues"] != ""){
                    newAttribute["editvalues"]= newAttribute["editvalues"].split(",");
                }

                var valueList = null;
                var staticRadio = this.getComponentByItemId("#valueListStatic" + attribute.id);
                var dynamicRadio = this.getComponentByItemId("#valueListDynamic" + attribute.id);
                if(staticRadio.getValue() || dynamicRadio.getValue()){
                    valueList = staticRadio.getValue() ? "static" : "dynamic";
                }
                newAttribute.valueList = valueList;
            }
            newAttribute.filterable = this.getComponentByItemId('#filterable' + attribute.id).getValue();
            newAttribute.selectable = this.getComponentByItemId('#selectable' + attribute.id).getValue();
            if(newAttribute.selectable){
                var min = this.getComponentByItemId('#min' + attribute.id);
                var radioChecked = min.getGroupValue();
                if(radioChecked == "defaultList"){
                    var dropdownVal = this.getComponentByItemId('#defaultVal' + attribute.id).getValue();
                    if(dropdownVal == null){
                        dropdownVal = "";
                    }
                    newAttribute.defaultValue = dropdownVal;
                }else{
                    if(radioChecked == "defaultMax"){
                        newAttribute.defaultValue = "#MAX#";
                    }else{
                        newAttribute.defaultValue = "#MIN#";
                    }
                }
            }else if (newAttribute.filterable){
                var checkbox=this.getComponentByItemId("#filter_list"+attribute.id);
                if (checkbox.getValue()){
                    attribute.defaultValue = "filterList";
                }else{
                    attribute.defaultValue = "";
                }
            }else{
                attribute.defaultValue = "";
            }
            currentAttributes.push(newAttribute);
        }, this);
        /** TODO: Use jsonConf to save instead of attributes list */
        var jsonConf = {
            attributeConfig: currentAttributes
        };
        for(var i = 0; i < this.tabComponents.length; i++) {
            jsonConf[this.tabComponents[i].config] = this.tabComponents[i].component.getJson();
        }
        return Ext.JSON.encode(jsonConf);
    },

    getDBValues: function(attribute,id, tab) {
        if(this.config.actionBeans.getDBValuesUrl != '') {
            this.getComponentByItemId("#defaultVal" + id).setLoading(true);
            Ext.Ajax.request({
                url: this.config.actionBeans.getDBValuesUrl,
                params: {
                    attribute: attribute,
                    applicationLayer: this.config.applicationLayer
                },
                scope: this,
                success: function ( result, request ) {
                    var un = Ext.JSON.decode(result.responseText);
                    if(un.success){
                        var values = un.uniqueValues;
                        if(tab == "dataselection"){
                            this.dbValuesToDataselection(values,id);
                        }else{
                            this.dbValuesToEdit(values,id);
                        }
                    }
                },
                failure: function ( result, request) {
                    Ext.MessageBox.alert('Foutmelding', result.responseText);
                }
            });
        }
    },

    dbValuesToDataselection: function(values,id) {
        var records = [];
        for(var i = 0; i < values.length; i++) {
            records.push({ id: values[i] });
        }
        var store = Ext.create('Ext.data.Store', {
            fields: [ { name: 'id' } ],
            data : records
        });
        this.getComponentByItemId("#defaultVal" + id).setStore(store);
        this.getComponentByItemId("#defaultVal" + id).setLoading(false);
    },

    dbValuesToEdit: function(values,id){
        var vals = "";
        for(var i = 0 ; i < values.length ; i++){
            if(i!=0){
                vals += ",";
            }
            vals += values[i];
        }
        var textField = this.getComponentByItemId('#editvalues' + id);
        textField.setValue(vals);
    },

    initAttributeGroupClick: function(){
        var groups = document.querySelectorAll(".attribute-group-toggle");
        for(var i = 0; i < groups.length; i++) {
            groups[i].addEventListener("change", function() {
                var id= this.id;
                var checked = this.checked;
                var checkboxes = Ext.query("."+id);
                checkboxes.forEach(function (e) {
                    e.checked = checked;
                });
            });
        }
    },

    getComponentByItemId: function(itemid) {
        return Ext.ComponentQuery.query(itemid)[0];
    },

    getParent: function() {
        if (window.opener) {
            return window.opener;
        } else if (window.parent) {
            return window.parent;
        } else {
            return window;
        }
    },

    updateStyleTitles: function() {
        if(!document.getElementById('styleSelect')) {
            return;
        }
        var styleId = document.getElementById("styleSelect").value;
        var titles = this.config.stylesTitleJson[styleId] || {};
        this.namedLayerTitle = titles.namedLayerTitle || "";
        this.styleTitle = titles.styleTitle || "";
        Ext.get("layerTitle").dom.innerHTML = Ext.String.htmlEncode(this.namedLayerTitle == "" ? "-" : this.namedLayerTitle);
        Ext.get("styleTitle").dom.innerHTML = Ext.String.htmlEncode(this.styleTitle == "" ? "-" : this.styleTitle);
    },

    setTitleAlias: function(which) {
        Ext.get("titleAlias").dom.value = which == "layer" ? this.namedLayerTitle : this.styleTitle;
    }

});