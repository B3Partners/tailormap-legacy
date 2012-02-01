/** 
 * @class 
 * @constructor
 * @description The flamingo Tool Class 
 **/
Ext.define("viewer.viewercontroller.flamingo.FlamingoTool",{
    extend: "viewer.viewercontroller.controller.Tool",
    
    config: {
        width: null,
        height: null,
        left: null,
        right: null,
        top: null,
        bottom: null,
        tooltip: null
    },       
    /** Create a new FlamingoTool
     *@construct
     */
    constructor : function (config){
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
        xml+=">";    
        if (this.getTooltip()!=null)
            xml+="<string id='tooltip' en='"+this.getTooltip()+"'/>";
        xml+="</fmc:"+this.getTagName(this.getType())+">"
        return xml;
    },    
    getTagName: function (toolType){
        if (toolType == viewer.viewercontroller.controller.Tool.ZOOMIN_BOX){
            return "ToolZoomin"
        }else if (toolType == viewer.viewercontroller.controller.Tool.ZOOMOUT_BOX){
            return "ToolZoomout"
        }else if (toolType == viewer.viewercontroller.controller.Tool.GET_FEATURE_INFO){
            return "ToolIdentify"
        }else if (toolType == viewer.viewercontroller.controller.Tool.PAN){
            return "ToolPan"
        }else if (toolType == viewer.viewercontroller.controller.Tool.SUPERPAN){
            return "ToolSuperPan"
        }else if (toolType == viewer.viewercontroller.controller.Tool.MEASURE){
            return "ToolMeasure"
        }else{
            return null;
        }
    }    
});