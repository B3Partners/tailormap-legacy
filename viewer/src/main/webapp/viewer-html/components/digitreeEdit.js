/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


Ext.define ("viewer.components.digitreeEdit",{
    extend: "viewer.components.Edit",
    savebuttonNew: null,
    valueStore:null,
    featureStore:null,
    gridPanel:null,
    iconOnUrl:null,
    hoofdgroep:null,
    x:null,
    y:null,
    input:null,
    origin:null,
    fbutton:null,
    objecttype:null,
    grasList: [{"name":" Geen gebrek"},{"name":"afschuiving"},{"name":"afsterving"},{"name":"toplaag_dichtgeslibd"},{"name":"dichtgroei_boomopslag"},{"name":"functie_afwezig"},{"name":"gaten"},{"name":"insectenvraat_niet_kritisch"},{"name":"exotengroei_ongewenst"},{"name":"vergraving"},{"name":"verzakking"},{"name":"wellen_(zandmeevoeren)"},{"name":"afschot_foutief"},{"name":"grasmat_beschadigd"},{"name":"boomwortelopgroei"},{"name":"erosie"},{"name":"functie_verminderd"},{"name":"kwelplek"},{"name":"oneffenheden"},{"name":"ontgronding"},{"name":"vertrapping"},{"name":"spoorvorming"},{"name":"onkruidgroei"},{"name":"plasvorming"},{"name":"verdroging"},{"name":"vermossing"},{"name":"wildschade"},{"name":"zetting"},{"name":"organische_stof_overlast"},{"name":"vervuiling"},{"name":"aantasting_kritisch"},{"name":"aantasting_niet_kritisch"},{"name":"bladkleur_afwijkend"},{"name":"gaten"},{"name":"groeistoornis_kritisch"},{"name":"groeistoornis_niet_kritisch"},{"name":"groeihoogte_onjuist_niet_kritisch"},{"name":"insectenvraat_kritisch"},{"name":"verzuring"},{"name":"ziekte_kritisch"},{"name":"ziekte_niet_kritisch"},{"name":"oppervlakteschade"},{"name":"wortelingroei"},{"name":"obstakels"},{"name":"groeihoogte_onjuist_kritisch"},{"name":"bedekkingsgraad_onvoldoende"},{"name":"schade_mechanisch"},{"name":"slijtage_sportvelden"},{"name":"verruiging"}], 
    kruidList:[{"name":" Geen gebrek"},{"name":"afschuiving"},{"name":"afsterving"},{"name":"toplaag_dichtgeslibd"},{"name":"dichtgroei_boomopslag"},{"name":"functie_afwezig"},{"name":"insectenvraat_niet_kritisch"},{"name":"exotengroei_ongewenst"},{"name":"vergraving"},{"name":"wellen_(zandmeevoeren)"},{"name":"boomwortelopgroei"},{"name":"erosie"},{"name":"functie_verminderd"},{"name":"ontgronding"},{"name":"spoorvorming"},{"name":"onkruidgroei"},{"name":"plasvorming"},{"name":"verdroging"},{"name":"vergrassing"},{"name":"verhouting"},{"name":"zetting"},{"name":"vervuiling"},{"name":"aantasting_kritisch"},{"name":"aantasting_niet_kritisch"},{"name":"bladkleur_afwijkend"},{"name":"groeistoornis_kritisch"},{"name":"groeistoornis_niet_kritisch"},{"name":"groeihoogte_onjuist_niet_kritisch"},{"name":"bloeiontwikkeling_onvoldoende"},{"name":"houtige_begroeiing_onderbroken"},{"name":"insectenvraat_kritisch"},{"name":"ziekte_kritisch"},{"name":"ziekte_niet_kritisch"},{"name":"obstakels"},{"name":"groeihoogte_onjuist_kritisch"},{"name":"bedekkingsgraad_onvoldoende"},{"name":"schade_mechanisch"},{"name":"verruiging"},{"name":"bladontwikkeling_onjuist"}], 
    ruigtesList:[{"name":" Geen gebrek"},{"name":"afschuiving"},{"name":"afsterving"},{"name":"toplaag_dichtgeslibd"},{"name":"dichtgroei_boomopslag"},{"name":"functie_afwezig"},{"name":"insectenvraat_niet_kritisch"},{"name":"exotengroei_ongewenst"},{"name":"vergraving"},{"name":"wellen_(zandmeevoeren)"},{"name":"afschot_foutief"},{"name":"oeverafslag"},{"name":"grasmat_beschadigd"},{"name":"boomwortelopgroei"},{"name":"erosie"},{"name":"functie_verminderd"},{"name":"oneffenheden"},{"name":"ontgronding"},{"name":"vertrapping"},{"name":"spoorvorming"},{"name":"onkruidgroei"},{"name":"plasvorming"},{"name":"verdroging"},{"name":"verlanding"},{"name":"vermossing"},{"name":"wildschade"},{"name":"zetting"},{"name":"vervuiling"},{"name":"verzanding"},{"name":"aantasting_kritisch"},{"name":"aantasting_niet_kritisch"},{"name":"bladkleur_afwijkend"},{"name":"gaten"},{"name":"groeistoornis_kritisch"},{"name":"groeistoornis_niet_kritisch"},{"name":"insectenvraat_kritisch"},{"name":"verzuring"},{"name":"ziekte_kritisch"},{"name":"ziekte_niet_kritisch"},{"name":"obstakels"},{"name":"aangroei"},{"name":"bedekkingsgraad_onvoldoende"},{"name":"schade_mechanisch"},{"name":"verruiging"},{"name":"bladontwikkeling_onjuist"}], 
    houtList:[{"name":" Geen gebrek"},{"name":"afschuiving"},{"name":"afsterving"},{"name":"breuk"},{"name":"deformatie_kritiek"},{"name":"toplaag_dichtgeslibd"},{"name":"dichtgroei_boomopslag"},{"name":"functie_afwezig"},{"name":"houtrot"},{"name":"insectenvraat_niet_kritisch"},{"name":"exotengroei_ongewenst"},{"name":"scheur_constructief"},{"name":"verankering_defect"},{"name":"vergraving"},{"name":"wellen_(zandmeevoeren)"},{"name":"stam_beschadigd"},{"name":"boomvitaliteit_vermindering"},{"name":"boomwortelopgroei"},{"name":"erosie"},{"name":"functie_verminderd"},{"name":"ontgronding"},{"name":"spoorvorming"},{"name":"verstuiving"},{"name":"kroonontwikkeling_onevenwichtig"},{"name":"onkruidgroei"},{"name":"plasvorming"},{"name":"verdroging"},{"name":"vergrassing"},{"name":"verhouting"},{"name":"wildschade"},{"name":"zetting"},{"name":"organische_stof_overlast"},{"name":"vervuiling"},{"name":"scheefstand"},{"name":"aanhechtingsmankement"},{"name":"aantasting_kritisch"},{"name":"aantasting_niet_kritisch"},{"name":"bladkleur_afwijkend"},{"name":"gaten"},{"name":"groeistoornis_kritisch"},{"name":"groeistoornis_niet_kritisch"},{"name":"groeihoogte_onjuist_niet_kritisch"},{"name":"takken_laaghangend_niet_kritisch"},{"name":"losliggend"},{"name":"snoeiwond_afgrendeling_onjuist"},{"name":"kroon_stam_verhouding_onjuist"},{"name":"kroon_stam_verhouding_afwijkend"},{"name":"bloeiontwikkeling_onvoldoende"},{"name":"houtige_begroeiing_onderbroken"},{"name":"insectenvraat_kritisch"},{"name":"reactiehout"},{"name":"gesteltakken_gescheurd"},{"name":"ziekte_kritisch"},{"name":"ziekte_niet_kritisch"},{"name":"zuigers_overlast"},{"name":"wurgwortels"},{"name":"oppervlakteschade"},{"name":"obstakels"},{"name":"aangroei"},{"name":"deformatie_niet_kritiek"},{"name":"vervorming"},{"name":"slijtage_mechanisch"},{"name":"kroon_beschadigd"},{"name":"groeihoogte_onjuist_kritisch"},{"name":"wortels_beschadigd"},{"name":"takken_laaghangend_kritisch"},{"name":"bedekkingsgraad_onvoldoende"},{"name":"schade_mechanisch"},{"name":"draagkracht_bodem_onvoldoende"},{"name":"top_dubbel"},{"name":"plakoksel"},{"name":"verruiging"},{"name":"bladontwikkeling_onjuist"},{"name":"scheurvorming"}], 
    boomList:[{"name":" Geen gebrek"},{"name":"afsterving"},{"name":"breuk"},{"name":"deformatie_kritiek"},{"name":"functie_afwezig"},{"name":"houtrot"},{"name":"insectenvraat_niet_kritisch"},{"name":"scheur_constructief"},{"name":"verankering_defect"},{"name":"stam_beschadigd"},{"name":"boomvitaliteit_vermindering"},{"name":"erosie"},{"name":"functie_verminderd"},{"name":"ontgronding"},{"name":"beschermlaag_defect"},{"name":"kroonontwikkeling_onevenwichtig"},{"name":"verdroging"},{"name":"wildschade"},{"name":"scheefstand"},{"name":"aanhechtingsmankement"},{"name":"aantasting_kritisch"},{"name":"aantasting_niet_kritisch"},{"name":"bladkleur_afwijkend"},{"name":"gaten"},{"name":"groeistoornis_kritisch"},{"name":"groeistoornis_niet_kritisch"},{"name":"groeihoogte_onjuist_niet_kritisch"},{"name":"takken_laaghangend_niet_kritisch"},{"name":"losliggend"},{"name":"snoeiwond_afgrendeling_onjuist"},{"name":"kroon_stam_verhouding_onjuist"},{"name":"kroon_stam_verhouding_afwijkend"},{"name":"houtige_begroeiing_onderbroken"},{"name":"insectenvraat_kritisch"},{"name":"reactiehout"},{"name":"gesteltakken_gescheurd"},{"name":"ziekte_kritisch"},{"name":"ziekte_niet_kritisch"},{"name":"zuigers_overlast"},{"name":"wurgwortels"},{"name":"obstakels"},{"name":"aangroei"},{"name":"deformatie_niet_kritiek"},{"name":"vervorming"},{"name":"slijtage_mechanisch"},{"name":"kroon_beschadigd"},{"name":"groeihoogte_onjuist_kritisch"},{"name":"wortels_beschadigd"},{"name":"takken_laaghangend_kritisch"},{"name":"bedekkingsgraad_onvoldoende"},{"name":"schade_mechanisch"},{"name":"draagkracht_bodem_onvoldoende"},{"name":"top_dubbel"},{"name":"plakoksel"},{"name":"bladontwikkeling_onjuist"},{"name":"scheurvorming"}], 
    columnsF:["objecttype","gebrek","ernst"],
    inputcustomContainer: null,
    constructor: function(conf){
        this.initConfig(conf);
        viewer.components.digitreeEdit.superclass.constructor.call(this, conf);
        
        //console.log(this.config);
        
        this.popup.popupWin.addListener('hide', function () {
            this.clearFeatureAndForm();
            this.deactivateMapClick();
        }.bind(this));
    },
 

   save: function (is_new) {
        if (this.mode === "delete") {
            this.remove();
            return;
        }
        
        var feature = this.inputcustomContainer.getValues();
        //console.log(feature);
        feature.rel_id = this.origin;
        
        if (this.geometryEditable) {
            if (this.vectorLayer.getActiveFeature()) {
                var wkt = this.vectorLayer.getActiveFeature().config.wktgeom;
                feature[this.appLayer.geometryAttribute] = wkt;
            }
        }
        if (this.mode === "edit") {
            feature.__fid = this.currentFID;
        }
        if (this.mode === "copy") {
            delete feature.__fid;
        }
        var me = this;
        try {
            feature = this.changeFeatureBeforeSave(feature);
        } catch (e) {
            me.failed(e);
            return;
        }

        me.editingLayer = this.config.viewerController.getLayer(this.layerSelector.getValue());
       //console.log(feature); 
       Ext.create("viewer.EditFeature", {
            viewerController: this.config.viewerController
        }).editDigi(
                me.editingLayer,
                feature,
                function (fid) {
                    me.saveSucces(fid,is_new);
                }, function (error) {
            me.failed(error);
        });
        
    },
    
    remove: function () {


        var feature = this.inputcustomContainer.getValues();

        var me = this;
        try {
            feature = this.changeFeatureBeforeSave(feature);
        } catch (e) {
            me.failed(e);
            return;
        }
        
        me.editingLayer = this.config.viewerController.getLayer(this.layerSelector.getValue());
        Ext.create("viewer.EditFeature", {
            viewerController: this.config.viewerController
        }).removeDigi(
                me.editingLayer,
                feature,
                function (fid) {
                    me.deleteSucces();
                }, function (error) {
                    me.failed(error);
                    
        });
        

    },
    
    loadWindow: function () {
        this.createLayerSelector();
        this.maincontainer = Ext.create('Ext.container.Container', {
            id: this.name + 'Container',
            width: '100%',
            height: '100%',
            autoScroll: true,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            style: {
                backgroundColor: 'White'
            },
            padding: 10,
            renderTo: this.getContentDiv(),
            items: [this.layerSelector.getLayerSelector(),
                    this.createFeatureGrid(),
                {
                    itemId: 'buttonPanel',
                    xtype: "container",
                    items: this.createActionButtons() 
                },
                {
                    itemId: "geomLabel",
                    margin: '5 0',
                    text: '',
                    xtype: "label"
                },
                
                {
                  itemId: 'customInput',
                  xtype: 'form',
                  border: 0,
                  flex: 1,
                  autoScroll: true,
                  layout:this.config.formLayout,
                  items:[
                      {   
                            xtype: 'textfield',
                            reference: '__fid', // A named reference to be held on the referenceHolder
                            name: '__fid',
                            fieldLabel: '__fid',    
                            readOnly: true,
                            hidden:true
                        },
                        {   
                            xtype: 'textfield',
                            reference: 'objecttype', // A named reference to be held on the referenceHolder
                            name: 'objecttype',
                            fieldLabel: 'soort:', 
                            labelWidth: 100,
                            anchor: '80%',
                            readOnly: true
                        },
                        this.createForm(),
                        {
                            xtype      : 'fieldcontainer',
                            fieldLabel : 'Ernst',
                            defaultType: 'radiofield',
                            reference: 'ernst',
                            name: 'ernst',
                            defaults: {
                                flex: 1
                            },
                            layout: 'hbox',
                            items: [
                                {
                                    boxLabel  : 'Ernstig gebrek',
                                    name      : 'ernst',
                                    inputValue: 'ernstig',
                                    id        : 'radio1'
                                }, {
                                    boxLabel  : 'Serieus gebrek',
                                    name      : 'ernst',
                                    inputValue: 'serieus',
                                    id        : 'radio2'
                                }, {
                                    boxLabel  : 'Gering gebrek',
                                    name      : 'ernst',
                                    inputValue: 'gering',
                                    id        : 'radio3'
                                }/*, {
                                    boxLabel  : 'Geen gebrek',
                                    name      : 'ernst',
                                    inputValue: 'geen',
                                    id        : 'radio4'
                                }*/
                            ]
                        },
                        {
                        xtype      : 'fieldcontainer',
                        fieldLabel : 'Omvang',
                        defaultType: 'radiofield',
                        reference: 'omvang',
                        name: 'omvang',
                        defaults: {
                            flex: 1
                        },
                        layout: 'hbox',
                        items: [
                            {
                            boxLabel  : 'Omvang 1 (<2%)',
                            name      : 'omvang',
                            inputValue: '<2%',
                            id        : 'radio5'
                            }, {
                            boxLabel  : 'Omvang 2 (2%-10%)',
                            name      : 'omvang',
                            inputValue: '2%-10%',
                            id        : 'radio6'
                            }, {
                            boxLabel  : 'Omvang 3 (10%-30%)',
                            name      : 'omvang',
                            inputValue: '10%-30%',
                            id        : 'radio7'
                            }, {
                            boxLabel  : 'Omvang 4 (30%-70%)',
                            name      : 'omvang',
                            inputValue: '30%-70%',
                            id        : 'radio8'    
                            }, {
                            boxLabel  : 'Omvang 5 (>70%)',
                            name      : 'omvang',
                            inputValue: '>70%',
                            id        : 'radio9'     
                            }
                        ]
                        },
                        {
                            xtype      : 'fieldcontainer',
                            fieldLabel : 'Intensiteit',
                            defaultType: 'radiofield',
                            reference: 'intensiteit',
                            name: 'intensiteit',
                            defaults: {
                                flex: 1
                            },
                            layout: 'hbox',
                            items: [
                                {
                                    boxLabel  : 'Intensiteit 1 (Beginstadium)',
                                    name      : 'intensiteit',
                                    inputValue: 'begin',
                                    id        : 'radio10'
                                }, {
                                    boxLabel  : 'Intensiteit 2 (Gevorderd stadium)',
                                    name      : 'intensiteit',
                                    inputValue: 'gevorderd',
                                    id        : 'radio11'
                                }, {
                                    boxLabel  : 'Intensiteit 3 (Eindstadium)',
                                    name      : 'intensiteit',
                                    inputValue: 'eind',
                                    id        : 'radio12'
                                }
                            ]
                        }

                   ]
                    
                },
                {
                    itemId: 'inputPanel',
                    border: 0,
                    xtype: "form",
                    autoScroll: true,
                    flex: 1,
                    layout: this.config.formLayout,
                    hidden: true
                }, {
                    itemId: 'savePanel',
                    xtype: "container",
                    layout: {
                        type: 'hbox',
                        pack: 'end'
                    },
                    defaults: {
                        xtype: 'button'
                    },
                    items: [
                        {
                            itemId: "cancelButton",
                            tooltip: "Annuleren",
                            text: "Annuleren",
                            listeners: {
                                click: {
                                    scope: this,
                                    fn: this.cancel
                                }
                            }
                        },
                        {
                            itemId: "saveButton",
                            tooltip: "Opslaan",
                            text: "Opslaan + sluiten",
                            listeners: {
                                click: {
                                    scope: this,
                                    fn: this.saveSingle
                                }
                            }
                        },
                        {
                            itemId: "saveNewButton",
                            tooltip: "Opslaan + nieuw gebrek",
                            text: "Opslaan + nieuw gebrek",
                            listeners: {
                                click: {
                                    scope: this,
                                    fn: this.saveNew
                                }
                            }
                        }
                    ],
                    hidden: true
                }
            ]
                
        });
        this.inputcustomContainer = this.maincontainer.down('#customInput');
        this.inputContainer = this.maincontainer.down('#inputPanel');
        this.geomlabel = this.maincontainer.down("#geomLabel");
        this.savebutton = this.maincontainer.down("#saveButton");

    },
       
    createActionButtons: function () {
        var buttons = [];
        
        if (this.config.allowNew) {
            buttons.push(this.createButton("newButton", "Nieuw", this.createNew));
        }
       
        if (this.config.allowCopy) {
            buttons.push(this.createButton("copyButton", "Kopie", this.copy, "Kopie bewerken"));
        }
        if (this.config.allowEdit) {
            buttons.push(this.createButton("editButton", "Selecteer vlak/boom", this.selectArea));
        }
        if (this.config.allowDelete) {
            buttons.push(this.createButton("deleteButton", "Verwijder", this.deleteFeature));
        }
        return buttons;
    },
    
    selectArea: function(){
        this.hideMobilePopup();
        this.clearFeatureAndForm();
        this.featureStore.setData([]);
        this.gridPanel.hide();
        this.activateMapClick(); 
    },
    
    createButton: function (itemid, label, fn, tooltip) {
        return {
            xtype: 'button',
            itemId: itemid,
            tooltip: tooltip || label,
            componentCls: 'button-toggle',
            disabled: false,
            text: label,
            listeners: {
                click: {
                    scope: this,
                    fn: function (btn) {
                        btn.addCls("active-state");
                        fn.call(this);
                    }
                }
            }
        };
    },
    
    clearFeatureAndForm: function () {
        //this.vectorLayer.removeAllFeatures();
        this.inputcustomContainer.getForm().reset();
        if(this.objecttype){
            var feat = {
                objecttype: this.objecttype
            };
            this.inputcustomContainer.getForm().setValues(feat);
        }
        this.currentFID = null;
        this.setFormVisible(false);
    },
    getFeaturesForCoords: function (coords) {
        var layer = this.layerSelector.getValue();
        var featureInfo = Ext.create("viewer.FeatureInfo", {
            viewerController: this.config.viewerController
        });
        var me = this;
        featureInfo.editFeatureInfoDigi(this.x, this.y, this.config.viewerController.mapComponent.getMap().getResolution() * 4, layer, function (features) {
            //console.log(features);
            me.createFeaturesGrid(features);
            me.featuresReceived(features);
            me.activateMapClick(); 
        }, function (msg) {
            me.failed(msg);
        });
    },
    
    failed: function (msg) {
        //Ext.Msg.alert('Mislukt', msg);
        this.activateMapClick();
    },
    
    featuresReceived: function (features) {
        //console.log("klaar");
        //console.log(features);
        if (features.length === 0) {
            var feat = {};
            this.hoofdgroep = features.hoofdgroep;
            this.objecttype = features.objecttype;
            feat.objecttype = features.objecttype;
            if(features.fid){
                this.origin = features.fid;
            }
            this.handleFeature(feat);
            return;
        }
        // A feature filter has been set, filter the right feature from the result set
        if (this.filterFeature !== null) {
            for (var i = 0; i < features.length; i++) {
                if (features[i].__fid === this.filterFeature.__fid) {
                    this.handleFeature(this.indexFeatureToNamedFeature(features[i]));
                    this.filterFeature = null; // Remove filter after first use
                    return;
                }
            }
            // Filtered Feature is not found
        }
        
        if (features.length >= 1) {
            if(features.objecttype){
                this.objecttype = features.objecttype;
            }
            this.hoofdgroep = features.hoofdgroep;
            //var feat = this.indexFeatureToNamedFeature(features[0]);
            //feat.objecttype = this.objecttype;
            if(features.fid){
                this.origin = features.fid;
            }
            //console.log(feat);
            //this.handleFeature(feat);
                
        
            //if(features.objecttype){
                //this.objecttype = features.objecttype;
            //}
            var feat = {};
            feat.objecttype = this.objecttype;
            if(features.fid){
                this.origin = features.fid;
            }
            this.handleFeature(feat);
        }
        Ext.get(this.getContentDiv()).unmask();
    },
    
    handleFeature: function (feature) {
        //console.log(this);
        this.updateForm(feature);
        //console.log(feature);
        if (feature != null) {
            
            this.inputcustomContainer.getForm().setValues(feature);
            if (this.mode === "copy") {
                this.currentFID = null;
            } else {
                this.currentFID = feature.__fid;
            }
            if (this.geometryEditable) {
                var wkt = feature[this.appLayer.geometryAttribute];
                var feat = Ext.create("viewer.viewercontroller.controller.Feature", {
                    wktgeom: wkt,
                    id: "T_0"
                });
                this.vectorLayer.addFeature(feat);
            } else {
                this.showAndFocusForm();
            }
        }
        else{
            this.inputcustomContainer.getForm().setValues(feature);
        }
        Ext.get(this.getContentDiv()).unmask();
    },
    
    saveSingle: function(){
      this.save(false);  
    },
    
    saveNew: function(){
        //call backend and load input window again. save applayer fid
        this.save(true);      
    },
    
   
    showAndFocusForm: function () {
        this.showMobilePopup();
        this.setFormVisible(true);
        this.inputcustomContainer.down("field").focus();
        this.geomlabel.setText("");
        this.untoggleButtons();
    },
    
    createForm: function(){
        
        this.valueStore = Ext.create('Ext.data.Store', {
            fields: ['name'],
            data: this.gazonList
        });
        
        this.input = Ext.create('Ext.form.ComboBox', {
            fieldLabel: 'Gebrek',
            labelWidth: 100,
            anchor: '80%',
            store: this.valueStore,
            reference: 'gebrek',
            name:'gebrek',
            queryMode: 'local',
            displayField: 'name',
            valueField: 'name',
            editable:false
        });
        
        return this.input;
        //this.inputcustomContainer.add(input);
    },
    
    updateForm: function(feature){
        //console.log(this.hoofdgroep);
        if(this.hoofdgroep === "gras"){
            this.valueStore.setData(this.grasList);
        }else if(this.hoofdgroep === "kruidachtige beplanting"){
            this.valueStore.setData(this.kruidList);
        }else if(this.hoofdgroep === "ruigtes en oevers"){
            this.valueStore.setData(this.ruigtesList);
        }else if(this.hoofdgroep === "houtachtige beplanting"){
            this.valueStore.setData(this.houtList);
        }else if(this.hoofdgroep === "bomen"){
            this.valueStore.setData(this.boomList);
        }
        this.valueStore.sort('name','ASC');
    
    },
    
    setFormVisible: function (visible) {
        this.inputcustomContainer.setVisible(visible);
        this.maincontainer.down("#savePanel").setVisible(visible);
    },
    
    
    createFeaturesGrid: function (features) {
        //console.log(features);     
            
        for(var i =0; i < features.length;i++){
            var attribute = features[i];
            attribute.objecttype = features.objecttype;
        }
        if(features.length === 0){
            //features[0] = {objecttype:"Er zijn geen gebreken"};
            this.gridPanel.setTitle("Er zijn geen gebreken");
        }
        else{
            this.gridPanel.setTitle("Kies één gebrek");
        }
        
        this.featureStore.setData(features);
        
        this.gridPanel.show();
        
        //this.clearFeatureAndForm();
        //this.showAndFocusForm();
    },
   
    
    itemDoubleClick: function (gridview, row) {
        //console.log(row.data);
        this.handleFeature(row.data);
    },
    
    cancelSelectFeature: function (){
        Ext.getCmp(this.name + "FeaturesWindow").hide();
    },
    mapClicked: function (toolMapClick, comp) {
        this.deactivateMapClick();
        //this.showMobilePopup();
        
        this.hideMobilePopup();
        this.clearFeatureAndForm();
        this.featureStore.setData([]);
        this.gridPanel.hide();
        
        //Ext.get(this.getContentDiv()).mask("Haalt features op...");
        var coords = comp.coord;
        this.x = coords.x;
        this.y = coords.y;
        this.config.viewerController.mapComponent.getMap().setMarker("edit", this.x, this.y);
        this.getFeaturesForCoords(coords);
    },
    
    
    createFeatureGrid(){
        var me = this;
        var basePath;
        var columns = new Array();
        for(var i = 0; i< this.columnsF.length; i++){
            var column = this.columnsF[i];
            columns.push({
                    id: column,
                    text: column,
                    dataIndex: column,
                    flex: 1,
                    filter: {
                        xtype: 'textfield'
                    }
                });
                            
            
        }

        this.iconOnUrl = "/viewer/viewer-html/common/openlayers/img/delete.png";
        columns.push({
           text: 'DELETE',
           align: 'center',
           xtype: 'actioncolumn',
           items: [
               {
                  xtype: 'button',
                  text: "X",
                  icon:this.iconOnUrl,
                  handler: function(grid, rowIndex, colIndex) {
                      var rec = grid.getStore().getAt(rowIndex);
                      me.deleteGebrek(rec.data);
                  }
               }
           ]
       });
        this.featureStore = Ext.create('Ext.data.Store', {
            pageSize: 4
 
        });
        
        this.gridPanel = Ext.create('Ext.grid.Panel', {
            id: this.name + 'GridFeaturesWindow',
            xtype:'grid',
            title: "Kies één gebrek",
            autoScroll: true,
            maxHeight: '25%',
            width: '100%',
            flex: 1,
            store:this.featureStore,
            columns: columns,
            listeners: {
                itemclick: {
                    scope: me,
                    fn: me.itemDoubleClick
                }
            }
        });
        
        return this.gridPanel;
    },
    
    deleteGebrek:function(data){       
        this.inputcustomContainer.getForm().setValues(data);
        this.remove();
    },
    
    saveSucces: function (fid, is_new) {
        //Ext.Msg.alert('Gelukt', "Het feature is aangepast.");
        if(is_new){
            this.updateFeaturesGrid();
            var feat = [
                {
                 "objecttype": this.objecttype,
                 "fid" : this.origin
                }
            ];
        this.clearFeatureAndForm();
        this.handleFeature(feat[0]);
        }
        
        else{
            this.cancel();
        }
        var layer = this.layerSelector.getValue();
        this.config.viewerController.getLayer(layer).reload();
    },
    deleteSucces: function(fid){
        //Ext.Msg.alert('Gelukt', "Het feature is verwijderd.");
        this.updateFeaturesGrid();
            var feat = [
                {
                 "objecttype": this.objecttype,
                 "fid" : this.origin
                }
            ];
        this.clearFeatureAndForm();
        this.handleFeature(feat[0]);
        var layer = this.layerSelector.getValue();
        this.config.viewerController.getLayer(layer).reload();
    },
    
    updateFeaturesGrid: function () {
        var layer = this.layerSelector.getValue();
        var featureInfo = Ext.create("viewer.FeatureInfo", {
            viewerController: this.config.viewerController
        });
        var me = this;
        featureInfo.editFeatureInfoDigi(this.x, this.y, this.config.viewerController.mapComponent.getMap().getResolution() * 4, layer, function (features) {
            me.createFeaturesGrid(features);
        }, function (msg) {
            me.failed(msg);
        });
    }   
});