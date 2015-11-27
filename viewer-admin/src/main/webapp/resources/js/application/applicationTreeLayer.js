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

Ext.tip.QuickTipManager.init();
Ext.Loader.setConfig({enabled:true});
Ext.require([
    'Ext.tree.*',
    'Ext.data.*',
    'Ext.tab.*',
    'Ext.panel.*'
]);
Ext.onReady(function() {
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

    var collapsed = false;
    var editPanelItems = [
        Ext.create('Ext.container.Container', { html: '<a href="#Edit_Per_Kaartlaag_Help" title="Help" class="helplink" onclick="helpController.showHelp(this); return false;"></a>' })
    ];
    var filterPanelItems = [
        Ext.create('Ext.container.Container', { html: '<a href="#Dataselectie_Filterfunctie_Per_Kaartlaag_Help" title="Help" class="helplink" onclick="helpController.showHelp(this); return false;"></a>' })
    ];
    Ext.select('.tabdiv', true).removeCls('tabdiv').setVisibilityMode(Ext.dom.Element.OFFSETS).setVisible(false);

    var defaults = {
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
                    if(item.collapse){
                        item.collapse();
                    }
                });
            }
        }
    };

    var editAllowed = false;
    var filterAllowed = false;
    if(Ext.isArray(attributes) && attributes.length > 0) {
        editAllowed = true;
        filterAllowed = true;
        Ext.Array.each(attributes, function(attribute) {
            var name = attribute.alias || attribute.name;
            if(editable && attribute.featureType === applicationLayerFeatureType) {
                editPanelItems.push(Ext.create('Ext.form.Panel', Ext.apply(defaults, {
                    itemId: 'edit' + attribute.id,
                    title: name + (attribute.editable ? ' (&times;)' : ''),
                    height: getAttributeEditHeight(attribute.valueList),
                    iconCls: "edit-icon-bw",
                    collapsed: collapsed,
                    items: getAttributeEditSettings(attribute, name)
                })));
            }
            var isEnabled = (attribute.filterable || attribute.selectable) || false;
            var defaultValueHidden = !(attribute.selectable || false);
            filterPanelItems.push(Ext.create('Ext.form.Panel', Ext.apply(defaults, {
                itemId: 'filter' + attribute.id,
                height: 180,
                title: name + (isEnabled ? ' (&times;)' : ''),
                iconCls: "edit-icon-bw",
                collapsed: collapsed,
                items: [
                    { fieldLabel: 'Filterbaar / Selecteerbaar', name: 'filterable_selectable', inputValue: 1, checked: isEnabled, xtype: 'checkbox',  labelWidth: 150, listeners: {
                        change: function(field, newval) {
                            var panel = field.findParentByType('form');
                            var filterRadio = getComponentByItemId('#filterable' + attribute.id);
                            filterRadio.setDisabled(!newval); filterRadio.setValue(false);
                            var selectRadio = getComponentByItemId('#selectable' + attribute.id);
                            selectRadio.setDisabled(!newval); selectRadio.setValue(false);
                            editPanelTitle(panel, name, newval);
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
                                    change: function(field,newval){
                                        var comp = getComponentByItemId('#default_filter' + attribute.id);
                                        comp.setVisible(false);
                                        if(newval){
                                            comp.setVisible(true);
                                        }
                                        getComponentByItemId('#filter' + attribute.id).doLayout();
                                    }
                                }
                            },
                            {
                                itemId: 'selectable' + attribute.id, fieldLabel: ' &nbsp;Dataselectie', name: 'filterable' + attribute.id, inputValue: 'select', checked: attribute.selectable, disabled: !isEnabled, xtype: 'radio',  labelAlign: 'right',
                                listeners: {change: function(field, newval) {var comp = getComponentByItemId('#default' + attribute.id);comp.setVisible(false); if(newval){ comp.setVisible(true);}getComponentByItemId('#filter' + attribute.id).doLayout();}}
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
                                xtype: 'checkbox',
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
                                        listeners: {change:
                                                function(field, newval) {
                                                    var comp = getComponentByItemId('#defaultList' + attribute.id);
                                                    comp.setVisible(false);
                                                    if(newval){
                                                        comp.setVisible(true);
                                                    }
                                                    getComponentByItemId('#filter' + attribute.id).doLayout();
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
                                    { xtype: 'button', text: 'DB', style: { marginLeft: '10px' },hideMode: 'visibility', listeners: {
                                            click: {fn: function() {getDBValues(attribute.name,attribute.id, "dataselection");},scope:this}}
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
            collapsed = true;
        });

        if (editAllowed && editable){
            var data =[];
            Ext.Array.each(attributes, function(attribute) {
                data.push({
                    name: attribute.alias || attribute.name,
                    value: attribute.name
                });
            });
            var attributeStore=Ext.create('Ext.data.Store', {
                fields: ['value', 'name'],
                data: data
            });
            var usernameAttrValue="";
            if (Ext.get('details_editfeature_usernameAttribute')){
                usernameAttrValue=Ext.get('details_editfeature_usernameAttribute').getValue();
            }
            editPanelItems.push({
                xtype: 'panel',
                title: 'Autorisatie',
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
        }
    }
    var tabconfig = [{
        contentEl:'settings-tab',
        title: 'Instellingen'
    },{
        contentEl:'rights-tab',
        title: 'Rechten'
    },{
        contentEl:'attributes-tab',
        title: 'Attributen'
    }];
    if(editAllowed && editable) {
        tabconfig.push({
            xtype: 'container',
            width: '100%',
            title: 'Edit',
            padding: 10,
            height: 475,
            layout: 'auto',
            autoScroll: true,
            items: editPanelItems
        });
    } else {
        tabconfig.push({
            contentEl:'edit-tab',
            title: 'Edit'
        });
    }
    if(filterAllowed) {
        tabconfig.push({
            xtype: 'container',
            width: '100%',
            title: 'Filter / Selectie',
            padding: 10,
            height: 475,
            layout: 'auto',
            autoScroll: true,
            items: filterPanelItems
        });
    } else {
        tabconfig.push({
            contentEl:'filter-tab',
            title: 'Filter / Selectie'
        });
    }
    tabconfig.push({
        contentEl:'context-tab',
        title: 'Context'
    });

    var htmlEditorRendered = false;
    Ext.create('Ext.tab.Panel', {
        renderTo: 'tabs',
        width: '100%',
        activeTab: 0,
        defaults :{
            bodyPadding: 10
        },
        layoutOnTabChange: false,
        items: tabconfig,
        listeners: {
            tabchange: function(panel, activetab, previoustab) {
                if(activetab.contentEl && activetab.contentEl === 'context-tab' && !htmlEditorRendered) {
                    // HTML editor is rendered when the tab is first opened. This prevents a bug where the contents could not be edited
                    Ext.create('Ext.form.field.HtmlEditor', {
                        itemId: 'extContextHtmlEditor',
                        width: 475,
                        maxWidth: 475,
                        height: 400,
                        maxHeight: 400,
                        value: Ext.get('context_textarea').dom.value,
                        plugins: [
                            new Ext.create('Ext.ux.form.HtmlEditor.imageUpload', Ext.apply(defaultImageUploadConfig, {
                                submitUrl: actionBeans['imageupload'],
                                managerUrl: Ext.urlAppend(actionBeans['imageupload'], "manage=t")
                            })),
                            new Ext.ux.form.HtmlEditor.Table(defaultHtmleditorTableConfig)
                        ],
                        renderTo: 'contextHtmlEditorContainer'
                    });
                    htmlEditorRendered = true;
                }
            }
        }
    });

    Ext.create('Ext.form.field.HtmlEditor', {
        itemId: 'extSettingsHtmlEditor',
        width: 475,
        maxWidth: 475,
        height: 150,
        maxHeight: 150,
        value: Ext.get('details_summary_description').dom.value,
        plugins: [
            new Ext.create('Ext.ux.form.HtmlEditor.imageUpload', Ext.apply(defaultImageUploadConfig, {
                submitUrl: actionBeans['imageupload'],
                managerUrl: Ext.urlAppend(actionBeans['imageupload'], "manage=t")
            })),
            new Ext.ux.form.HtmlEditor.Table(defaultHtmleditorTableConfig)
        ],
        renderTo: 'details_summary_description_container'
    });
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

    Ext.get('apptreelayerform').on('submit', function(e) {
        Ext.get('attributesJSON').dom.value = getJson();
        if( getComponentByItemId('#extSettingsHtmlEditor')){
            Ext.get('details_summary_description').dom.value = getComponentByItemId('#extSettingsHtmlEditor').getValue();
        }
        var htmlEditor = getComponentByItemId('#extContextHtmlEditor');
        if(htmlEditor) {
            Ext.get('context_textarea').dom.value = htmlEditor.getValue();
        }
        if (Ext.get('details_editfeature_usernameAttribute') && getComponentByItemId('#ext_editfeature_usernameAttribute')){
            Ext.get('details_editfeature_usernameAttribute').dom.value= getComponentByItemId('#ext_editfeature_usernameAttribute').getValue();
        }
    });

});

function getAttributeEditSettings(attribute, name) {
    
    var possibleValues = attribute.editValues;
    var possibleValuesFormItems = [
        { fieldLabel: 'Mogelijke waarden', name: 'editvalues', itemId: 'editvalues' + attribute.id, xtype: 'textfield',flex:1,value:possibleValues},
        { xtype: 'button', text: 'DB', style: { marginLeft: '10px' }, listeners: {click: function() {
            getDBValues(attribute.name, attribute.id, "edit");
        }}}
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
            url: featureSourceURL,
            reader: {
                type: 'json',
                root: 'gridrows',
                totalProperty: 'totalCount'
            },
            simpleSortMode: true
        },
        listeners: {
            load: function(store, records) {
                setValueAndEnable('#valueListFeatureSource' + attribute.id, records, attribute.valueListFeatureSource, 'id');
            }
        }
    });

    var featureTypeStore = Ext.create('Ext.data.Store', {
        model: 'FeatureTypeModel',
        sorters: 'name',
        proxy: {
            type: 'ajax',
            url: featureTypesURL,
            reader: {
                type: 'json'
            },
            simpleSortMode: true
        },
        listeners: {
            load: function(store, records) {
                setValueAndEnable('#valueListFeatureType' + attribute.id, records, attribute.valueListFeatureType, 'id');
            }
        }
    });

    var attributeStore = Ext.create('Ext.data.Store', {
        model: 'AttributeModel',
        sorters: 'name',
        proxy: {
            type: 'ajax',
            limitParam:'',
            url: attributesURL,
            reader: {
                root: 'gridrows',
                type: 'json'
            },
            simpleSortMode: true
        },
        listeners: {
            load: function(store, records) {
                setValueAndEnable('#valueListValueAttribute' + attribute.id, records, attribute.valueListValueName, 'attribute');
                setValueAndEnable('#valueListLabelAttribute' + attribute.id, records, attribute.valueListLabelName, 'attribute');
            }
        }
    });
    
    // Initial load of store if attribute valuelist is dynamic
    if(attribute.valueList && attribute.valueList === "dynamic") {
        featureSourceStore.load();
    }

    var disableUserEdit = false;
    if(atribute.disableUserEdit) {
        disableUserEdit = true;
    }
    return [
        {
            fieldLabel: 'Toon in Edit component', name: 'editable', inputValue: 1, checked: attribute.editable, xtype: 'checkbox', listeners: {
                change: function (field, newval) {
                    editPanelTitle(field.findParentByType('form'), name, newval);
                }
            }
        },
        {
            fieldLabel: 'Bewerkbaar', value: disableUserEdit, name: 'disableUserEdit', store: [[false,'Ja'],[true,'Nee (alleen lezen)']], xtype: 'combobox', width: 250
        },
        {
            fieldLabel: 'Alias', name: 'editAlias', value: attribute.editAlias, xtype: 'textfield'
        },
        {
            hidden: isGeometry,
            xtype: 'container',
            items: [
                {
                    xtype: 'container',
                    layout: 'hbox',
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
                                change: function (field, newval) {
                                    toggleStaticDynamic(newval ? 'static' : 'dynamic', attribute);
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
                                change: function (field, newval) {
                                    toggleStaticDynamic(newval ? 'dynamic' : 'static', attribute);
                                    if(newval) {
                                        featureSourceStore.load();
                                    }
                                }
                            }

                        }
                    ]
                }, {
                    xtype: 'container',
                    itemId: 'staticListValues' + attribute.id,
                    layout: 'hbox',
                    hidden: attribute.valueList === "dynamic",
                    items: possibleValuesFormItems
                },
                {
                    xtype: 'container',
                    layout: 'vbox',
                    itemId: 'dynamicListValues' + attribute.id,
                    hidden: attribute.valueList !== "dynamic",
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
}

function toggleStaticDynamic(type, attribute) {
    getComponentByItemId('#dynamicListValues' + attribute.id).setVisible(type === 'dynamic');
    getComponentByItemId('#staticListValues' + attribute.id).setVisible(type === 'static');
    getComponentByItemId('#edit' + attribute.id).setHeight(getAttributeEditHeight(type)).updateLayout();
}

function getAttributeEditHeight(type) {
    var STATIC_HEIGHT = 250;
    var DYNAMIC_HEIGHT = 350;
    return type === 'dynamic' ? DYNAMIC_HEIGHT : STATIC_HEIGHT;
}

function setValueAndEnable(id, records, value, recordvalue) {
    var combo = getComponentByItemId(id);
    if(typeof value !== undefined) for(var i = 0; i < records.length; i++) {
        if(records[i].get(recordvalue) === value) {
            combo.setValue(records[i]);
        }
    }
    combo.setDisabled(false);
}

function editPanelTitle(panel, name, checked) {
    panel.setTitle(name + (checked ? ' (&times;)' : ''));
}

function getJson() {
    var currentAttributes = [];
    Ext.Array.each(attributes, function(attribute) {
        var newAttribute = attribute;
        var editPanel = getComponentByItemId('#edit' + attribute.id);
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
            var staticRadio = getComponentByItemId("#valueListStatic" + attribute.id);
            var dynamicRadio = getComponentByItemId("#valueListDynamic" + attribute.id);
            if(staticRadio.getValue() || dynamicRadio.getValue()){
                valueList = staticRadio.getValue() ? "static" : "dynamic";
            }
            newAttribute.valueList = valueList;
        }
        newAttribute.filterable = getComponentByItemId('#filterable' + attribute.id).getValue();
        newAttribute.selectable = getComponentByItemId('#selectable' + attribute.id).getValue();
        if(newAttribute.selectable){
            var min = getComponentByItemId('#min' + attribute.id);
            var radioChecked = min.getGroupValue()
            if(radioChecked == "defaultList"){
                var dropdownVal = getComponentByItemId('#defaultVal' + attribute.id).getValue();
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
            var checkbox=getComponentByItemId("#filter_list"+attribute.id);
            if (checkbox.getValue()){
                attribute.defaultValue = "filterList";
            }else{
                attribute.defaultValue = "";
            }
        }else{
            attribute.defaultValue = "";
        }
        currentAttributes.push(newAttribute);
    });
    return Ext.JSON.encode(currentAttributes);
}

function getDBValues(attribute,id, tab) {
    if(getDBValuesUrl != '') {
        getComponentByItemId("#defaultVal" + id).setLoading(true);
        Ext.Ajax.request({
            url: getDBValuesUrl,
            params: {
                attribute: attribute,
                applicationLayer: applicationLayer
            },
            success: function ( result, request ) {
                var un = Ext.JSON.decode(result.responseText);
                if(un.success){
                    var values = un.uniqueValues;
                    if(tab == "dataselection"){
                        dbValuesToDataselection(values,id);
                    }else{
                        dbValuesToEdit(values,id);
                    }
                }
            },
            failure: function ( result, request) {
                Ext.MessageBox.alert('Foutmelding', result.responseText);
            }
        });
    }
}

function dbValuesToDataselection(values,id) {
    var records = [];
    for(var i = 0; i < values.length; i++) {
        records.push({ id: values[i] });
    };
    var store = Ext.create('Ext.data.Store', {
        fields: [ { name: 'id' } ],
        data : records
    });
    getComponentByItemId("#defaultVal" + id).setStore(store);
    getComponentByItemId("#defaultVal" + id).setLoading(false);
}

function dbValuesToEdit(values,id){
    var vals = "";
    for(var i = 0 ; i < values.length ; i++){
        if(i!=0){
            vals += ",";
        }
        vals += values[i];
    }
    var textField = getComponentByItemId('#editvalues' + id);
    textField.setValue(vals);
}

function cancelFunction(){
    var url = actionBeans.appTreeLayer + '?edit=t&applicationLayer=' + applicationLayer;
    document.location.href = url;
}

function attributeGroupClick(el){
    var id= el.id;
    var checked = el.checked;
    var checkboxes = Ext.query("."+id);
    checkboxes.forEach(function (e){
        e.checked=checked;
    });
}

function getComponentByItemId(itemid) {
    var item = Ext.ComponentQuery.query(itemid)[0];
    return item;
}