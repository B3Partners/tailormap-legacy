/* 
 * Copyright (C) 2012 B3Partners B.V.
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
        shareTitle: "Sharing"
    },
    constructor: function (conf){ 
        if(!Ext.isDefined(conf.details.height)) conf.details.height = 200; 
        viewer.components.Bookmark.superclass.constructor.call(this, conf);
        this.initConfig(conf);
       
        imagePath=contextPath+"/viewer-html/components/resources/images/bookmark/"
        this.shareUrls ={
            email: "mailto:user@domain.com?subject=[title]&body=[text]%20[url]",
            twitter: "http://twitter.com/share?url=[url]&text=[text]",
            linkedin: "http://www.linkedin.com/shareArticle?mini=true&url=[url]&summary=[text]&title=[title]",
            googleplus: "https://plus.google.com/share?url=[url]&text=[text]",
            facebook: "https://www.facebook.com/sharer.php?u=[url]&text=[text]"
        }
        
        this.renderButton();
        this.loadWindow();
        
        return this;
    },
    renderButton: function() {
        var me = this;
        this.superclass.renderButton.call(this,{
            text: me.title,
            icon: me.titlebarIcon,
            tooltip: me.tooltip,
            label: me.label,
            handler: function() {
                me.showWindow();
            }
        });
    },
    loadWindow : function(){
        var socialButtons=[];
        if(this.shareEmail){
            socialButtons.push({
                xtype: 'button',                
                margin: '10px 0px 0px 10px',
                //text: 'Email',
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
        }if (this.shareTwitter){ 
            socialButtons.push({
                xtype: 'button',                
                margin: '10px 0px 0px 10px',
                //text: 'Twitter',
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
        }if (this.shareLinkedIn){
            socialButtons.push({
                xtype: 'button',                
                margin: '10px 0px 0px 10px',
                //text: 'LinkedIn',
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
        }if (this.shareGooglePlus){
            socialButtons.push({
                xtype: 'button',                
                margin: '10px 0px 0px 10px',
                //text: 'Google+',
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
        }if (this.shareFacebook){
            socialButtons.push({
                xtype: 'button',                
                margin: '10px 0px 0px 10px',
                //text: 'Facebook',        
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
        
        this.form = new Ext.form.FormPanel({
            frame: false,
            border: 0,
            width: '95%',
            margin: '0px 0px 0px 10px',
            padding: '5px',
            items: [{ 
                xtype: 'textfield',
                fieldLabel: 'Bookmark',
                name: 'bookmark',
                anchor: '100%',
                id: 'bookmark',
                value: this.url
            },{ 
                xtype: 'textfield',
                fieldLabel: 'Compact link',
                name: 'compactlink',
                anchor: '100%',
                id: 'compactlink'
            },{
                xtype: 'container',
                layout: {
                    type: 'hbox'
                },
                items: socialButtons
            },{ 
                xtype: 'button',
                componentCls: 'mobileLarge',
                margin: '10px 0px 0px 0px',
                text: 'Toevoegen aan favorieten',
                listeners: {
                    click:{
                        scope: this,
                        fn: this.addToFavorites
                    }
                }
            },{ 
                xtype: 'button',
                componentCls: 'mobileLarge',
                margin: '10px 0px 0px 10px',
                text: 'Sluiten',
                listeners: {
                    click:{
                        scope: this,
                        fn: this.hideWindow
                    }
                }
            }],
            renderTo: this.getContentDiv()
        });
    },
    showWindow : function(){
        var paramJSON = this.viewerController.getBookmarkUrl();
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
            }else if(param.name != 'selectedContent' && param.name != 'services' && param.name != 'appLayers' && param.name != "" && param.value != ""){
                parameters += param.name +"="+ param.value +"&";
            }
        }
        this.url += parameters;

        var me = this;
        Ext.create("viewer.Bookmark").createBookmark(
            Ext.JSON.encode(paramJSON),
            function(code){me.succesCompactUrl(code);},
            function(code){me.failureCompactUrl(code);}
        );
    },
    succesCompactUrl : function(code){
        this.compUrl = this.baseUrl+"bookmark="+code;
        this.form.getChildByElement("compactlink").setValue(this.compUrl);
        this.form.getChildByElement("bookmark").setValue(this.url);
        this.popup.show();
    },
    failureCompactUrl : function(code){
        // TODO: error message?
        this.viewerController.logger.error(code);
    },
    hideWindow : function(){
        this.popup.hide();
    },
    addToFavorites : function(){
        if(Ext.firefoxVersion != 0){
            alert("This browser doesn't support this function.");
        }else if(Ext.ieVersion != 0){
            window.external.AddFavorite(this.compUrl, this.title);
        }else if(Ext.chromeVersion != 0){
            alert("This browser doesn't support this function.");
        }else if(Ext.operaVersion != 0){
            alert("This browser doesn't support this function.");
        }else if(Ext.safariVersion != 0){
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
            url = url.replace("[text]",encodeURIComponent(this.shareText));
        }
        if (url.indexOf("[title]")!=-1){
            url = url.replace("[title]",encodeURIComponent(this.shareTitle));
        }
        console.log(url);
        window.open(url);
    },
    getExtComponents: function() {
        return [ this.form.getId() ];
    }
});