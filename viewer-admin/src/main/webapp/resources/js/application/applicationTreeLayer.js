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
            labelWidth: 150,
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
    
    var geomTypesStore = Ext.create('Ext.data.Store', {
        fields: ['type', 'label'],
        data : [
            {"type":"geometry", "label":"Onbekend (alleen bewerken)"},
            {"type":"point", "label":"Punt"},
            {"type":"linestring", "label":"Lijn"},
            {"type":"polygon", "label":"Vlak"}
        ]
    });
    
    var editAllowed = false;
    var filterAllowed = false;
    if(Ext.isArray(attributes) && attributes.length > 0) {
        editAllowed = true;
        filterAllowed = true;        
        Ext.Array.each(attributes, function(attribute) {
            var name = attribute.alias || attribute.name;
            if(editable) {
                var possibleValues =attribute.editValues;
                
                var possibleValuesFormItems = [
                                { fieldLabel: 'Mogelijke waarden', name: 'editvalues', id: 'editvalues' + attribute.id, xtype: 'textfield',flex:1,value:possibleValues},
                                { xtype: 'button', text: 'DB', style: { marginLeft: '10px' }, listeners: {click: function() {getDBValues(attribute.name, attribute.id,"edit");}}}
                            ];
                
                if(attribute.featureTypeAttribute != undefined) {
                    var type = attribute.featureTypeAttribute.type;
                    
                    var geomTypes = ["geometry","point","multipoint","linestring","multilinestring","polygon","multipolygon"];
                    
                    if(Ext.Array.contains(geomTypes, type)) {
                        
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
                            id: 'editvalues' + attribute.id, 
                            queryMode: 'local',
                            displayField: 'label',
                            valueField: 'type',
                            emptyText:'Maak uw keuze',
                            value: type, 
                            size: 40 
                            }
                        ];
                    }
                }
                
                editPanelItems.push(Ext.create('Ext.form.Panel', Ext.apply(defaults, {
                    id: 'edit' + attribute.id,
                    title: name + (attribute.editable ? ' (&times;)' : ''),
                    iconCls: "edit-icon-bw",
                    collapsed: collapsed,
                    items: [
                        { fieldLabel: 'Bewerkbaar', name: 'editable', inputValue: 1, checked: attribute.editable, xtype: 'checkbox', listeners: {
                                change: function(field, newval) {
                                    editPanelTitle(field.findParentByType('form'), name, newval)
                                }
                            }
                        },
                        { fieldLabel: 'Alias', name: 'editalias', value: attribute.editAlias, xtype: 'textfield' },
                        {
                            xtype: 'container',
                            layout: 'hbox',
                            items: possibleValuesFormItems
                        },
                        { fieldLabel: 'Hoogte', name: 'editHeight', value: attribute.editHeight, xtype: 'textfield' }
                    ]
                })));
            }
            var isEnabled = (attribute.filterable || attribute.selectable) || false;
            var defaultValueHidden = !(attribute.selectable || false);
            filterPanelItems.push(Ext.create('Ext.form.Panel', Ext.apply(defaults, {
                id: 'filter' + attribute.id,
                height: 180,
                title: name + (isEnabled ? ' (&times;)' : ''),
                iconCls: "edit-icon-bw",
                collapsed: collapsed,
                items: [
                    { fieldLabel: 'Filterbaar / Selecteerbaar', name: 'filterable_selectable', inputValue: 1, checked: isEnabled, xtype: 'checkbox',  labelWidth: 150, listeners: {
                        change: function(field, newval) {
                            var panel = field.findParentByType('form');
                            var filterRadio = Ext.getCmp('filterable' + attribute.id);
                            filterRadio.setDisabled(!newval); filterRadio.setValue(false);
                            var selectRadio = Ext.getCmp('selectable' + attribute.id);
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
                                id: 'filterable' + attribute.id, fieldLabel: 'Filteren', name: 'filterable' + attribute.id, inputValue: 'filter', checked: attribute.filterable, disabled: !isEnabled, xtype: 'radio', labelAlign: 'right', 
                                listeners:{
                                    change: function(field,newval){
                                        var comp = Ext.getCmp('default_filter' + attribute.id);
                                        comp.setVisible(false); 
                                        if(newval){ 
                                            comp.setVisible(true);
                                        }
                                        Ext.getCmp('filter' + attribute.id).doLayout(); 
                                    }
                                }
                            },
                            { 
                                id: 'selectable' + attribute.id, fieldLabel: ' &nbsp;Dataselectie', name: 'filterable' + attribute.id, inputValue: 'select', checked: attribute.selectable, disabled: !isEnabled, xtype: 'radio',  labelAlign: 'right',
                                listeners: {change: function(field, newval) {var comp = Ext.getCmp('default' + attribute.id);comp.setVisible(false); if(newval){ comp.setVisible(true);}Ext.getCmp('filter' + attribute.id).doLayout();}}
                            }
                        ]
                    },
                    {
                        xtype: 'container',
                        name: 'default_filter' + attribute.id,
                        id: 'default_filter' + attribute.id,
                        hidden: !(attribute.filterable || false),
                        hideMode: 'display',
                        items: [
                            {
                                id: 'filter_list' + attribute.id,
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
                        id: 'default' + attribute.id,
                        hidden: defaultValueHidden,
                        hideMode: 'visibility',
                        items:[
                            {
                                xtype: 'container',
                                layout: 'hbox',
                                items:[
                                    { 
                                        id: 'min' + attribute.id,
                                        fieldLabel: 'Minimale waarde', 
                                        name: 'minmaxlist' + attribute.id, 
                                        inputValue: 'defaultMin', 
                                        checked: attribute.defaultValue == "#MIN#", 
                                        xtype: 'radio', 
                                        labelAlign: 'right'
                                    },
                                    { 
                                        id: 'max' + attribute.id,
                                        fieldLabel: 'Maximale waarde', 
                                        name: 'minmaxlist' + attribute.id, 
                                        inputValue: 'defaultMax', 
                                        checked: attribute.defaultValue == "#MAX#", 
                                        xtype: 'radio', 
                                        labelAlign: 'right' 
                                    },
                                    { 
                                        id: 'list' + attribute.id,
                                        fieldLabel: 'Lijst', 
                                        name: 'minmaxlist' + attribute.id, 
                                        inputValue: 'defaultList', 
                                        checked: attribute.defaultValue != "#MAX#" && attribute.defaultValue != "#MIN#", 
                                        xtype: 'radio', 
                                        labelAlign: 'right',
                                        listeners: {change: 
                                                function(field, newval) {
                                                    var comp = Ext.getCmp('defaultList' + attribute.id);
                                                    comp.setVisible(false); 
                                                    if(newval){ 
                                                        comp.setVisible(true);
                                                    }
                                                    Ext.getCmp('filter' + attribute.id).doLayout();
                                                }
                                            }
                                    }
                                ]
                            },
                            {  
                                xtype: 'container',
                                id: 'defaultList' + attribute.id,
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
                                        id: 'defaultVal' + attribute.id,
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
                                id: 'dataselectionLabel' + attribute.id, text: "Bij deze attributen moet een dataselectie component geconfigureerd worden!",
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
                    id: 'ext_editfeature_usernameAttribute',
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
                        id: 'extContextHtmlEditor',
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
        id: 'extSettingsHtmlEditor',
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
        if( Ext.getCmp('extSettingsHtmlEditor')){
            Ext.get('details_summary_description').dom.value = Ext.getCmp('extSettingsHtmlEditor').getValue();
        }
        var htmlEditor = Ext.getCmp('extContextHtmlEditor');
        if(htmlEditor) {
            Ext.get('context_textarea').dom.value = htmlEditor.getValue();
        }
        if (Ext.get('details_editfeature_usernameAttribute') && Ext.getCmp('ext_editfeature_usernameAttribute')){
            Ext.get('details_editfeature_usernameAttribute').dom.value= Ext.getCmp('ext_editfeature_usernameAttribute').getValue();
        }
    });
    
});

function editPanelTitle(panel, name, checked) {
    panel.setTitle(name + (checked ? ' (&times;)' : ''));
}

function getJson() {
    var currentAttributes = [];
    Ext.Array.each(attributes, function(attribute) {
        var newAttribute = attribute;
        if (Ext.getCmp('edit' + attribute.id)!=undefined){
            Ext.getCmp('edit' + attribute.id).getForm().getFields().each(function(field) {
                newAttribute[field.getName()] = field.getValue();
            });
            if(newAttribute["editvalues"] != undefined && newAttribute["editvalues"] != ""){
                newAttribute["editvalues"]= newAttribute["editvalues"].split(",");
            }
        }
        newAttribute.filterable = Ext.getCmp('filterable' + attribute.id).getValue();
        newAttribute.selectable = Ext.getCmp('selectable' + attribute.id).getValue();
        if(newAttribute.selectable){
            var min = Ext.getCmp('min' + attribute.id);
            var radioChecked = min.getGroupValue()
            if(radioChecked == "defaultList"){
                var dropdownVal = Ext.getCmp('defaultVal' + attribute.id).getValue();
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
            var checkbox=Ext.getCmp("filter_list"+attribute.id);
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
        Ext.getCmp("defaultVal" + id).setLoading(true);
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
    Ext.getCmp("defaultVal" + id).setStore(store);
    Ext.getCmp("defaultVal" + id).setLoading(false);
}

function dbValuesToEdit(values,id){
    var vals = "";
    for(var i = 0 ; i < values.length ; i++){
        if(i!=0){
            vals += ",";
        }
        vals += values[i];
    }
    var textField = Ext.getCmp( 'editvalues' + id );
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