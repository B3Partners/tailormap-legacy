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
 * Bookmark component
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define ("viewer.components.Bookmark",{
    extend: "viewer.components.Component",
    form: null,
    url: "",
    compUrl: "",
    baseUrl: "",
    shareUrls: null,
    imagePath: null,    
    config:{
        title: null,
        titlebarIcon: null,
        tooltip: null,
        label: "",
        shareEmail: false,
        shareTwitter: false,
        shareLinkedIn: false,
        shareGooglePlus: false,
        shareFacebook: false,
        shareText: "I'd like to share this with #FlamingoMC: ",
        shareTitle: "Sharing",
        showShortUrl: true,
        showFullUrl: true,
        showLabels: true,
        details: {
            minWidth: 450,
            minHeight: 330
        }
    },
    constructor: function (conf){
        if(!Ext.isDefined(conf.showLabels)) conf.showLabels = true; 
        this.initConfig(conf);
		viewer.components.Bookmark.superclass.constructor.call(this, this.config);

        this.shareUrls ={
            email: "mailto:%20?subject=[title]&body=[text]%20[url]",
            twitter: "http://twitter.com/share?url=[url]&text=[text]",
            linkedin: "http://www.linkedin.com/shareArticle?mini=true&url=[url]&summary=[text]&title=[title]",
            googleplus: "https://plus.google.com/share?url=[url]&text=[text]",
            facebook: "https://www.facebook.com/sharer.php?u=[url]&text=[text]"
        };
        
        this.renderButton();
        this.loadWindow();
        
        return this;
    },
    renderButton: function() {
        var me = this;
        this.superclass.renderButton.call(this,{
            text: me.config.title,
            icon: me.config.titlebarIcon,
            tooltip: me.config.tooltip,
            label: me.config.label,
            handler: function() {
                me.showWindow();
            }
        });
    },
    loadWindow : function(){
        var socialButtons=[];
        var imagePath = FlamingoAppLoader.get('contextPath') + "/viewer-html/components/resources/images/bookmark/";
        if(this.config.shareEmail){
            socialButtons.push({
                xtype: 'button',                
                margin: '10px 0px 0px 10px',
                //text: i18next.t('viewer_components_bookmark_0'),
                icon: imagePath + 'email-16.png',
                listeners: {
                    click:{
                        scope: this,
                        fn: function(){
                            this.share(this.shareUrls["email"]);
                        }
                    }
                }            
            });
        }if (this.config.shareTwitter){ 
            socialButtons.push({
                xtype: 'button',                
                margin: '10px 0px 0px 10px',
                //text: i18next.t('viewer_components_bookmark_1'),
                icon: imagePath + 'twitter-16.png',
                listeners: {
                    click:{
                        scope: this,
                        fn: function(){
                            this.share(this.shareUrls["twitter"]);
                        }
                    }
                }            
            });
        }if (this.config.shareLinkedIn){
            socialButtons.push({
                xtype: 'button',                
                margin: '10px 0px 0px 10px',
                //text: i18next.t('viewer_components_bookmark_2'),
                icon: imagePath+"in-16.png",
                listeners: {
                    click:{
                        scope: this,
                        fn: function(){
                            this.share(this.shareUrls["linkedin"]);
                        }
                    }
                }            
            });
        }if (this.config.shareGooglePlus){
            socialButtons.push({
                xtype: 'button',                
                margin: '10px 0px 0px 10px',
                //text: i18next.t('viewer_components_bookmark_3'),
                icon: imagePath + 'gplus-16.png',
                listeners: {
                    click:{
                        scope: this,
                        fn: function(){
                            this.share(this.shareUrls["googleplus"]);
                        }
                    }
                }            
            });           
        }if (this.config.shareFacebook){
            socialButtons.push({
                xtype: 'button',                
                margin: '10px 0px 0px 10px',
                //text: i18next.t('viewer_components_bookmark_4'),        
                icon: imagePath + 'fb-16.png',
                listeners: {
                    click:{
                        scope: this,
                        fn: function(){
                            this.share(this.shareUrls["facebook"]);
                        }
                    }
                }            
            });
        }
        var formItems=[];
        
        if (this.config.showFullUrl){
            formItems.push({ 
                xtype: 'textarea',
                fieldLabel: this.config.showLabels ? 'Bookmark' : '',
                name: 'bookmark',
                height: 80,
                id: 'bookmark',
                readOnly:true,
                value: this.url
            });
        }
        if (this.config.showShortUrl){
            formItems.push({ 
                xtype: 'textarea',
                fieldLabel:this.config.showLabels ? 'Compact link' : '',
                name: 'compactlink',
                height: 80,
                readOnly:true,
                id: 'compactlink'
            });
        }
        formItems.push({
            xtype: 'container',
            layout: {
                type: 'hbox',
                pack: "end"
            },
            items: socialButtons
        });
        if(Ext.browser.is.IE){
            formItems.push({ 
                xtype: 'button',
                margin: '10px 0px 0px 0px',
                text: i18next.t('viewer_components_bookmark_5'),
                listeners: {
                    click:{
                        scope: this,
                        fn: this.addToFavorites
                    }
                }
            });
        }
        formItems.push({ 
            xtype: 'button',
            margin: '10px 0px 0px 10px',
            text: i18next.t('viewer_components_bookmark_6'),
            listeners: {
                click:{
                    scope: this,
                    fn: this.hideWindow
                }
            }
        });
        this.form = new Ext.form.FormPanel({
            frame: false,
            border: 0,
            width: '100%',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            padding: '5px',
            items: formItems,
            renderTo: this.getContentDiv()
        });
    },
    showWindow : function(){
        var paramJSON = this.config.viewerController.getBookmarkUrl();
        var parameters = "";
        
        for ( var i = 0 ; i < paramJSON["params"].length ; i ++){
            var param = paramJSON["params"][i];
            if(param.name == 'url'){
                this.url = param.value;
                this.baseUrl = param.value;
            }else if(param.name == 'extent'){
                parameters += param.name +"=";
                var extent = param.value;
                parameters += extent.minx+","+extent.miny+","+extent.maxx+","+extent.maxy+"&";
            }else if(param.name == 'layers'){
                parameters += param.name +"=";
                var layers = param.value;
                for( var x = 0 ; x < layers.length ; x++){
                     parameters += layers[x];
                     if(x != (layers.length - 1)){
                         parameters += ",";
                     }
                } 
                parameters +="&";
            }else if (param.name == 'levelOrder' && param.value.length > 0){
                parameters += param.name +"=";
                parameters += param.value.join(",");
                parameters +="&";
            }else if(param.name != 'selectedContent' && param.name != 'services' && param.name != 'levels' && param.name != 'appLayers' && param.name != "" && param.value != ""){
                parameters += param.name +"="+ param.value +"&";
            }
        }
        
        var componentParams="";
        //get all the params from components that need to be added to the bookmark
        var components = this.config.viewerController.getComponents();
        for (var i=0; i < components.length; i++){
            var state = components[i].getBookmarkState(false);
            if (!Ext.isEmpty(state)){
                componentParams+=encodeURIComponent(components[i].getName());
                componentParams+="=";
                componentParams+=encodeURIComponent(Ext.encode(state));                
                componentParams+="&";
            }            
        }
        this.url += parameters;
        if (componentParams.length!=0){
            this.url+=componentParams;
        }
        if (this.config.showShortUrl){
            //get all the states of the components for the short url
            for (var i=0; i < components.length; i++){
                var state = components[i].getBookmarkState(true);
                if (!Ext.isEmpty(state)){
                    var param = {name: components[i].getName(),
                            value: Ext.JSON.encode(state)};
                    paramJSON.params.push(param);
                }
            }

            var me = this;
            Ext.create("viewer.Bookmark").createBookmark(
                Ext.JSON.encode(paramJSON),
                function(code){me.succesCompactUrl(code);},
                function(code){me.failureCompactUrl(code);}
            );
        }else if (this.config.showFullUrl){
            this.form.getChildByElement("bookmark").setValue(this.url);
            this.popup.show();
        }
    },
    succesCompactUrl : function(code){
        this.compUrl = this.baseUrl+"bookmark="+code;
        if(this.config.showShortUrl){
            this.form.getChildByElement("compactlink").setValue(this.compUrl);
        }
        if(this.config.showFullUrl){
            this.form.getChildByElement("bookmark").setValue(this.url);
        }
        this.popup.show();
    },
    failureCompactUrl : function(code){
        // TODO: error message?
        this.config.viewerController.logger.error(code);
    },
    hideWindow : function(){
        this.popup.hide();
    },
    addToFavorites : function(){
        if(Ext.browser.is.IE) {
            window.external.AddFavorite(this.compUrl, this.config.title);
        } else {
            alert("This browser doesn't support this function.");
        }
    },
    share: function (shareUrl){
        var url = ""+shareUrl;
        var bookmarkUrl = this.compUrl;
        if (!bookmarkUrl || bookmarkUrl == ""){
            bookmarkUrl=this.url;
        }
        if (url.indexOf("[url]")!=-1){
            url=url.replace("[url]",encodeURIComponent(bookmarkUrl));
        }
        if (url.indexOf("[text]")!=-1){
            url = url.replace("[text]",encodeURIComponent(this.config.shareText));
        }
        if (url.indexOf("[title]")!=-1){
            url = url.replace("[title]",encodeURIComponent(this.config.shareTitle));
        }
        window.open(url);
    },
    getExtComponents: function() {
        return [ this.form.getId() ];
    }
});