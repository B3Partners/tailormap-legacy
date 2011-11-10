Ext.define("Component",{
    extend: "Ext.util.Observable",
    component: true,
    events: [],
    div: null,
    mapViewer: null,
    config: {
        name: "naam",
        div: new Object(),
        //mapViewert: new Object(),
        options: new Object()
    },
    constructor: function(config){
        this.mapViewer = mapViewer;
        this.initConfig(config);
        return this;
    },
    isComponent : function(){
        return this.component;
    },
    bind : function(event,handler){
        this.addListener(event,handler);
    }
});