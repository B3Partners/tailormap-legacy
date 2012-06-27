Ext.define ("viewer.components.Twitter",{
    extend: "viewer.components.Component",
    baseURL : null,
    twitter: null,
    panel: null,
    latestId:null,
    first:null,
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
        return this;
    //?rpp=15&include_entities=true&result_type=recent";	
    },
    loadWindow : function(){
        Ext.create("Ext.button.Button",{
            renderTo: this.div,
            text: "Haal Tweets op!",
            listeners: {
                click: function(button) {
                    this.doSearch(this.search);
                }, 
                scope: this
            }
        });
            
        this.panel =  Ext.create("Ext.panel.Panel",{
            title: 'Tweets',
           width: "100%",
          //  border: 1,
            id:"sdf",
            autoScroll:true,
            
           // defaults: {anchor: '-20'},
            height: "95%",
            layout: 'anchor',/*{
                type: 'hbox',       // Arrange child items vertically
                align: 'stretch',    // Each takes up full width
                
            },*/
            renderTo: this.div
        });
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
        this.latestId = response.maxId;
        for(var i = 0 ; i < results.length ; i++){
            var tweet = results[i];
            this.processTweet(tweet);

        }
        this.panel.doLayout();
        this.first = false;
    },
    processTweet : function (tweet){
        var tweetPanel = Ext.create("Ext.panel.Panel",{
            html: tweet.text,
            id:tweet.id_str,
            title: tweet.user_from,
            border: 2,
            autoScroll:true
        });
        if(this.first){
            this.panel.add(tweetPanel);
        }else{
            this.panel.insert(0,tweetPanel);
        }
    },
    error : function (errors){
            
    }
});