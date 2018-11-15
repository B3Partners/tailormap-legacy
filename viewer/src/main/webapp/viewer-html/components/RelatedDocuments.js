/* 
 * Copyright (C) 2012-2013 B3Partners B.V.
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
 * StreetView component
 * Creates a Related document window that can be opened bij clicking a button.
 * It generates a list of Documents and tries to get the file extension from the url
 * With the file extention it tries to get the file icon_[fileextension].png in the 
 * resources/images/relatedDocuments/ folder.
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define ("viewer.components.RelatedDocuments",{
    extend: "viewer.components.Component",
    documentImg: null,
    iconPath: null,
    contentId: '',
    config:{
        name: i18next.t('viewer_components_relateddocuments_0'),
        title: "",
        titlebarIcon : "",
        tooltip : "",
        label: "",
        details: {
            minWidth: 450,
            minHeight: 250
        }
    },
    constructor: function (conf){   
        conf.isPopup=true;        
        this.initConfig(conf);
		viewer.components.RelatedDocuments.superclass.constructor.call(this, this.config);        
        
        this.documentImg = new Object();
        this.iconPath=FlamingoAppLoader.get('contextPath')+"/viewer-html/components/resources/images/relatedDocuments/"
        
        this.popup.hide();
        var me = this;
        this.renderButton({
            handler: function(){
                me.buttonClick();
            },
            text: me.config.title,
            icon: me.config.titlebarIcon,
            tooltip: me.config.tooltip,
            label: me.config.label
        });        
        this.config.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_SELECTEDCONTENT_CHANGE,this.reinit,this);
        return this;
    },
    /**
     *When the button is clicked
     */
    buttonClick: function (){
        //console.log("!!!"+this.config.viewerController);
        var me = this;
        if(this.contentId === '') {
            this.contentId = Ext.id();
            Ext.create('Ext.container.Container', {
                id: this.config.name + 'Container',
                width: '100%',
                height: '100%',
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                style: {
                    backgroundColor: 'White'
                },
                renderTo: this.getContentDiv(),
                items: [{
                    id: this.config.name + 'GridPanel',
                    xtype: "container",
                    autoScroll: true,
                    flex: 1,
                    html: { tag: "div", id: me.contentId, style: "width: 100%; height: 100%;" }
                },{
                    id: this.config.name + 'ClosingPanel',
                    xtype: "container",
                    style: {
                        marginTop: '5px',
                        marginRight: '5px'
                    },
                    layout: {
                        type:'hbox',
                        pack:'end'
                    },
                    items: [
                        {xtype: 'button', text: i18next.t('viewer_components_relateddocuments_1'), handler: function() {
                            me.popup.hide();
                        }}
                    ]
                }]
            });
            this.baseLayoutLoaded = true;
        }
        this.reinit();
        this.popup.show();
    },
    /**
     * reinit the window and the documents etc.
     */
    reinit: function(){
        var documents=this.getDocuments();
        var html = this.createHtml(documents);
        if (!Ext.isEmpty(this.contentId)){
            var contentDiv=Ext.get(this.contentId);
            contentDiv.update("");
            contentDiv.appendChild(html);
            this.loadImages();
        }
    },
    /**
     *Gets all the documents with the selectedContent
     */
    getDocuments: function(){
        var documents = new Object();
        for ( var i = 0 ; i < this.config.viewerController.app.selectedContent.length ; i ++){
            var contentItem = this.config.viewerController.app.selectedContent[i];
            var parentDocuments = new Object();
            if(contentItem.type ==  "level"){
                parentDocuments=this.config.viewerController.getDocumentsInLevel(this.config.viewerController.app.levels[contentItem.id]);
            }else if(contentItem.type == "appLayer"){
                var parentLevel = this.config.viewerController.getAppLayerParent(contentItem.id);
                if(parentLevel != null){
                    parentDocuments=this.config.viewerController.getDocumentsInLevel(parentLevel);    
                }
            }
            Ext.apply(documents,parentDocuments);
        }
        return documents;
    },
    /**
     * Make a Ext.Element with the documents in it as a <a href>
     * @param documents the document objects
     * @return Ext.Element with html in it that represents the documents.
     */
    createHtml: function(documents){        
        var html="";
        this.documentImg={};
        html+="<div class='documents_documents'>";
        for (var documentId in documents){
            if(!documents.hasOwnProperty(documentId)) {
                continue;
            }
            var doc=documents[documentId];
            html+="<div class='document_entry'>";
                html+="<div class='document_icon'>"
                html+="<img id='img_"+doc.id+"' src=''/>";
                html+="</div>";
                html+="<div class='document_link'>"
                html+="<a target='_blank' href='"+doc.url+"'>"+doc.name+"</a></div>";
            html+="</div>";
            this.documentImg["img_"+doc.id]=doc.url;
        }
        html+="</div>"
        var element=new Ext.Element(document.createElement("div"));
        element.insertHtml("beforeEnd",html);
        
        return element;
    },
    /**
     * Call loadImage for all the images
     */
    loadImages: function(){
        for (var imgId in this.documentImg){
            if(!this.documentImg.hasOwnProperty(imgId)) {
                continue;
            }
            this.loadImage(imgId,this.documentImg[imgId]);
        }
    },
    /**
     * Load the image icon_<extension>.png Iff the image does not exists then load the default.
     * @param imgId the id of the img element
     * @param path the path of the document.
     */
    loadImage: function (imgId,path){       
        var defaultSrc=this.iconPath+"icon_default.png";        
        var extension=path.substring(path.lastIndexOf(".")+1);
        //check if the extension has a length > 2 and < 4
        if (extension.length <= 4 && extension.length>=2){            
            var image = new Image();
            //var extension=path.substring(lio);
            image.onload=function(){
                Ext.get(imgId).dom.src = image.src
            };
            image.onerror=function(){
                Ext.get(imgId).dom.src = defaultSrc
            };
            image.src=this.iconPath+"icon_"+extension+".png";
        }else{
            Ext.get(imgId).dom.src=defaultSrc;
        }
    },
    getExtComponents: function() {
        var c = [];
        if(this.contentId !== '') c.push(this.config.name + 'Container');
        return c;
    }
    
});