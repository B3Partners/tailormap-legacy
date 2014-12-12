Ext.define ("viewer.components.Twitter",{
    extend: "viewer.components.Component",
    baseURL : null,
    twitter: null,
    panel: null,
    latestId:null,
    first:null,
    interval:null,
    config:{
        search: null
    },
    constructor : function (config){
        this.baseURL = "http://search.twitter.com/search.json";
        this.div = Ext.get("tweets");
        this.initConfig(config);
        this.loadWindow();
        this.twitter = Ext.create("viewer.Twitter");
        this.first = true;
        this.interval = 5000;
        return this;
    },
    loadWindow : function(){
        /*Ext.create("Ext.button.Button",{
            renderTo: this.div,
            text: "Haal Tweets op!",
            listeners: {
                click: function(button) {
                    this.doSearch(this.search);
                },
                scope: this
            }
        });*/

        this.panel =  Ext.create("Ext.panel.Panel",{
            /*title: 'Tweets',*/
            width: "100%",
            autoScroll:true,
            height: "95%",
            layout: 'anchor',
            renderTo: this.div
        });


        var me = this;
        setTimeout(function(){
            me.doSearch(me.search);
        }, me.interval);
    },
    doSearch : function (term){
        var me =this;
        this.twitter.getTweets(term,15, this.latestId, function (results){
            me.processResults(results);
        },
        this.error);
    },
    processResults : function (response){
        var results = response.tweets;
        var maxId = response.maxId;
        if( maxId != this.latestId){
            this.latestId = maxId;
            for(var i = 0 ; i < results.length ; i++){
                var tweet = results[i];
                this.processTweet(tweet);

            }
            this.panel.doLayout();
            this.first = false;
        }
        var me = this;
        setTimeout(function(){
            me.doSearch(me.search);
        }, me.interval);
    },
    processTweet : function (tweet){
        var tweetPanel = Ext.create("Ext.container.Container",{
            style: { "margin": "5px"},
            layout: {
                type: "fit"
            },
            items:[
                {
                    xtype: 'container',
                    layout: {type: "hbox"},
                    items: [
                    {
                        xtype: 'container',
                        style: {height: "48px", width: "48px"},
                        items: [{
                            xtype: 'image',
                            style: {"float": "left"},
                            src: tweet.img_url,
                            id: tweet.id
                        }]
                    },
                    {
                        xtype: 'label',
                        text: tweet.user_from,
                        style: {
                            "font-weight": "bold",
                            "margin-top": "15px",
                            "margin-left": "5px"
                        }
                    }]
                },{
                    xtype: 'container',
                    items:
                    [
                    {
                        xtype: 'label',
                        text: tweet.text
                    }]
                }
            ],
            border: 0
        });

        tweetPanel.doLayout();
        if(this.first){
            this.panel.add(tweetPanel);
        }else{
            this.panel.insert(0,tweetPanel);
        }
    },
    error : function (errors){

    }
});