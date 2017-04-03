/**
 * @class 
 * @constructor
 * @description The class for controls
 * @param id The id of the tool
 * @param frameworkObject The frameworkspecific object, to store as a reference
 * @param type The type of tool to be created
 */
Ext.define("viewer.components.tools.Tool",{
    extend: "viewer.components.Component",
    //the controller tool
    tool: null,
    events: null,
    config :{
        id: null,
        type: null,
        visible: true
    },
    constructor: function (config) {
        // Set default tooltips of not configured
        if(this.config.hasOwnProperty('tooltip') && !config.hasOwnProperty('tooltip')) {
            config.tooltip = this.config.tooltip;
        }
        viewer.components.tools.Tool.superclass.constructor.call(this, config);
        this.events = [];
        return this;
    },
    /**
     * Init the tool and add it to the mapcomponent
     */
    initTool: function(conf){ 
        //MapComponent is working with ids instead of names
        conf.id=this.name;
        //Let the Mapcomponent create the specific tool
        this.tool = this.config.viewerController.mapComponent.createTool(conf);  
        if (this.tool==null){
            throw new Error("Tool not initialized! Initialize the tool before the addTool");            
        }
        //Add the tool
        this.config.viewerController.mapComponent.addTool(this.tool);
    },
    fire : function (event,options){
        this.fireEvent(event,this,options);
    }    
});
