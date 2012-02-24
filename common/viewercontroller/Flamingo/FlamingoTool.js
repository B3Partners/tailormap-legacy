/** 
 * @class 
 * @constructor
 * @description The flamingo Tool Class 
 **/
Ext.define("viewer.viewercontroller.flamingo.FlamingoTool",{
    extend: "viewer.viewercontroller.controller.Tool",
    enabledEvents: new Object(),    
    config: {
        width: null,
        height: null,
        left: null,
        right: null,
        top: null,
        bottom: null,
        tooltip: null,
        listenTo: null
    },       
    /** Create a new FlamingoTool
     *@construct
     *@param config.id id of this object
     *@param config.type the type name of the component
     *@param config.width the width of the component
     *@param config.height the height of the component
     *@param config.left margin at the left side
     *@param config.right margin of the right side
     *@param config.bottom margin at the bottom side
     *@param config.tooltip the tool tip of this component
     *@param config.listenTo the component id to listen to
     */
    constructor : function (config){
        //replace the . for flamingo
        if (config.id){
            config.id=config.id.replace(/\./g,"_");
        }
        viewer.viewercontroller.flamingo.FlamingoTool.superclass.constructor.call(this, config);
        this.initConfig(config);
        return this;
    },
    /**
     * Sets the tool visibility
     * @param visibility the visibility
     * @see MapComponent#setVisible
     */
    setVisible: function (visibility){
        this.getFrameworkTool().callMethod(this.getId(),'setVisible',visibility);
    },
    /**
     * Create a xml string for this object.
     * @return string of the xml.
     */
    toXML: function (){        
        var xml="<fmc:";
        xml+=this.getTagName(this.getType());
        if (this.getId()!=null)
            xml+=" id='"+this.getId()+"'";
        if (this.getWidth()!=null)
            xml+=" width='"+this.getWidth()+"'";
        if (this.getHeight()!=null)
            xml+=" height='"+this.getHeight()+"'";
        if (this.getTop()!=null)
            xml+=" top='"+this.getTop()+"'";
        if (this.getLeft()!=null)
            xml+=" left='"+this.getLeft()+"'";
        if (this.getRight()!=null)
            xml+=" right='"+this.getRight()+"'";
        if (this.getBottom()!=null)
            xml+=" bottom='"+this.getBottom()+"'";        
        if (this.getListenTo()!=null){
            xml+=" listento='"+this.getListenTo()+"'";
        }
        xml+=">";    
        if (this.getTooltip()!=null)
            xml+="<string id='tooltip' en='"+this.getTooltip()+"'/>";
        xml+="</fmc:"+this.getTagName(this.getType())+">"
        return xml;
    },    
    getTagName: function (toolType){
        if (toolType == viewer.viewercontroller.controller.Tool.ZOOMIN_BOX){
            return "ToolZoomin";
        }else if (toolType == viewer.viewercontroller.controller.Tool.ZOOMOUT_BOX){
            return "ToolZoomout";
        }else if (toolType == viewer.viewercontroller.controller.Tool.GET_FEATURE_INFO){
            return "ToolIdentify";
        }else if (toolType == viewer.viewercontroller.controller.Tool.PAN){
            return "ToolPan"
        }else if (toolType == viewer.viewercontroller.controller.Tool.SUPERPAN){
            return "ToolSuperPan";
        }else if (toolType == viewer.viewercontroller.controller.Tool.MEASURE){
            return "ToolMeasure";
        }else if (toolType == viewer.viewercontroller.controller.Tool.DEFAULT){
            return "ToolDefault";
        }else if (toolType == viewer.viewercontroller.controller.Tool.FULL_EXTENT){
            return "ButtonFull";
        }else if (toolType == viewer.viewercontroller.controller.Tool.NEXT_EXTENT){
            return "ButtonNext";
        }else if (toolType == viewer.viewercontroller.controller.Tool.PREVIOUS_EXTENT){
            return "ButtonPrev";
        }else{
            return null;
        }
    },
    
    /**
     * Overwrites the addListener function. Add's the event to allowexternalinterface of flamingo
     * so flamingo is allowed to broadcast the event.
     */
    addListener : function(event,handler,scope){
        viewer.viewercontroller.flamingo.FlamingoTool.superclass.addListener.call(this,event,handler,scope);
        //enable flamingo event broadcasting
        var flamEvent=this.mapComponent.eventList[event];
        if (flamEvent!=undefined){
            //if not enabled yet, enable
            if (this.enabledEvents[flamEvent]==undefined){
                this.frameworkObject.callMethod(this.mapComponent.getId(),"addAllowExternalInterface",this.getId()+"."+flamEvent);
                this.enabledEvents[flamEvent]=true;
            }
        }     
    }
});