Ext.define("Component",{
    extend: "Ext.data.Model", 
    idProperty: 'id',
    events: [],
	config: {
        name: "naam",
        div: "left_menu",
        //mapViewert: new Object(),
        options: "opt1"
    }, 
    constructor: function(config){
        this.viewerController = viewerController;
        this.initConfig(config);
        return this;
    },
    velden: [
        {name: 'id', type: 'string'},
        {name: 'name', type: 'string'},
        {name: 'shortName', type: 'string'},
        {name: 'restrictions', type: 'array'},
        {name: 'addOnce', type: 'boolean'},
        {name: 'linkedComponents', type: 'array'},
        {name: 'addedToRegions', type: 'array'}
    ],
    bind : function(event,handler){
        this.addListener(event,handler);
    },
    isAddedToRegion: function(regionid) {
        var isAdded = false;
        Ext.Array.each(this.get('addedToRegions'), function(region, index) {
            if(region == regionid) {
                isAdded = true;
            }
        });
        return isAdded;
    }
});