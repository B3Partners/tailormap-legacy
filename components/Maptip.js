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
 * Maptip component
 * Creates a maptip component
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define ("viewer.components.Maptip",{
    extend: "viewer.components.Component",    
    balloon: null,
    maptipComponent: null,
    config: {
        maptipdelay: null,
        height: null,
        width: null
    },
    constructor: function (conf){        
        viewer.components.Maptip.superclass.constructor.call(this, conf);
        this.initConfig(conf);        
        //make the balloon
        this.balloon = new Balloon(this.getDiv(),this.getViewerController().mapComponent,"balloon",this.width,this.height);
        //listen to the on addlayer
        this.getViewerController().mapComponent.getMap().registerEvent(viewer.viewercontroller.controller.Event.ON_LAYER_ADDED,this.onAddLayer,this);
        //Add the maptip component to the framework
        conf.type = viewer.viewercontroller.controller.Component.MAPTIP;
        this.maptipComponent = this.getViewerController().mapComponent.createComponent(conf);
        this.getViewerController().mapComponent.addComponent(this.maptipComponent);
        
        return this;
    },
    onAddLayer: function(map,layer){
        var maptipLayers=this.getMaptipLayers(layer);
        if (maptipLayers.length >0){
            layer.setMaptips(maptipLayers);
            //listen to the onMaptipData
            layer.registerEvent(viewer.viewercontroller.controller.Event.ON_MAPTIP_DATA,this.onMaptipData,this);       
        }
    },
    onMaptipData: function(layer,options){
        //alert(layer);
        try{
            
            var html="";            
            //this.balloon.getContentElement().insertHtml("beforeEnd", "BOEEEEE");
            var data = options.data;
            for (var layerName in data){
                var appLayer =  this.getApplicationLayer(layerName,layer.serviceId);
                for (var index in data[layerName]){
                    var feature=data[layerName][index];                    
                    html+="<div class='maptip_feature'>";
                        html+="<div class='maptip_title'>";
                            html+=this.replaceByAttributes(appLayer.details["summary.title"],feature);
                        html+="</div>";
                        html+="<div class='maptip_image'>";
                            html+="<img src='"+this.replaceByAttributes(appLayer.details["summary.image"],feature)+"'/>";
                        html+="</div>";
                        html+="<div class='maptip_description'>";
                            html+=this.replaceByAttributes(appLayer.details["summary.description"],feature);
                        html+="</div>";                        
                        html+="<div class='maptip_link'>";
                            html+="<a href='"+this.replaceByAttributes(appLayer.details["summary.description"],feature)+">link</a>";
                        html+="</div>";
                    html+="</div>"                    
                }
            }
            if (!Ext.isEmpty(html)){
                console.log(html);
                var x= (options.extent.minx+options.extent.maxx)/2;
                var y= (options.extent.miny+options.extent.maxy)/2;
                this.balloon.setPosition(x,y,true);
                //this.balloon.getContentElement().dom.innerHTML="";
                this.balloon.getContentElement().insertHtml("beforeEnd", html);
            }
        }catch(e){
            console.log(e);
        }
    },
    /**
     * Replaces all [feature names] with the values of the feature.
     * @param text the text that must be search for 'feature names'
     * @param feature a object with object[key]=value 
     * @return a new text with all [key]'s  replaced
     */
    replaceByAttributes: function(text,feature){
        if (Ext.isEmpty(text))
            return "";
        var newText=""+text;
        for (var key in feature){
            var regex = new RegExp("\\["+key+"\\]","g");
            newText=newText.replace(regex,feature[key]);
        }
        //remove all remaining [...]
        var begin=newText.indexOf("[");
        var end=newText.indexOf("]");
        while(begin >=0 && end>0){            
            newText=newText.replace(newText.substring(begin,end+1),"");
            begin=newText.indexOf("[");
            end=newText.indexOf("]");
        }
        return newText;
    },
    /**
     * Gets the layers that have a maptip configured
     * @param layer a mapComponent layer.
     * @return a array of layer names in the given layer that have a maptip configured.
     */
    getMaptipLayers: function(layer){
        var maptipLayers=new Array();
        var appLayers=this.viewerController.app.appLayers;
        var layersParam = layer.getLayers();
        if (layersParam==null)
            return null;
        var layers=layersParam.split(",");
        for (var i=0; i < layers.length; i++){   
            var appLayer = this.getApplicationLayer(layers[i],layer.serviceId);
            if (appLayer.details !=undefined &&
                (appLayer.details["summary.description"]!=undefined ||
                    appLayer.details["summary.image"]!=undefined ||
                    appLayer.details["summary.link"]!=undefined ||
                    appLayer.details["summary.title"]!=undefined)){
                maptipLayers.push(layers[i]);
            }
        }
        return maptipLayers;
    },
    getApplicationLayer: function (layerName,serviceId){
        var appLayers=this.viewerController.app.appLayers;
        for (var id in appLayers){
            if (appLayers[id].serviceId==serviceId &&
                appLayers[id].layerName==layerName){
                return appLayers[id];
            }
        }
        return null;
    }
    
});

/**
 * @param mapDiv The div element where the map is in.
 * @param webMapController the webMapController that controlles the map
 * @param balloonId the id of the DOM element that represents the balloon.
 * @param balloonWidth the width of the balloon (optional, default: 300);
 * @param balloonHeight the height of the balloon (optional, default: 300);
 * @param offsetX the offset x
 * @param offsetY the offset y
 * @param balloonCornerSize the size of the rounded balloon corners of the round.png image(optional, default: 20);
 * @param balloonArrowHeight the hight of the arrowImage (optional, default: 40);
 */
function Balloon(mapDiv,webMapController,balloonId, balloonWidth, balloonHeight, offsetX,offsetY, balloonCornerSize, balloonArrowHeight){
    this.mapDiv=mapDiv;
    this.webMapController=webMapController;
    this.balloonId=balloonId;
    this.balloonWidth=300;
    this.balloonHeight=300;
    this.balloonCornerSize=20;
    this.balloonArrowHeight=40;
    this.offsetX=0;
    this.offsetY=0;
    this.roundImgPath=contextPath+"/resources/images/maptip/round.png";
    this.arrowImgPath=contextPath+"/resources/images/infoBalloon/arrow.png";
    //this.leftOfPoint;
    //this.topOfPoint;
    
    //the balloon jquery dom element.
    this.balloon;
    //this.xCoord;
    //this.yCoord;

    if (balloonWidth){
        this.balloonWidth=balloonWidth;
    }
    if (balloonHeight)
        this.balloonHeight=balloonHeight;
    if (balloonCornerSize){
        this.balloonCornerSize=balloonCornerSize;
    }
    if (balloonArrowHeight){
        this.balloonArrowHeight=balloonArrowHeight;
    }
    if (offsetX){
        this.offsetX=offsetX;
    }
    if (offsetY){
        this.offsetY=offsetY;
    }
    /**
     *Private function. Don't use.
     */
    this._createBalloon = function(x,y){
        //create balloon and styling.
        this.balloon=new Ext.Element(document.createElement("div"));
        this.balloon.addCls("infoBalloon");
        this.balloon.id = this.balloonId;
                
        this.balloon.applyStyles({            
            'position': 'absolute',
            'width':""+this.balloonWidth+"px",
            'height':""+this.balloonHeight+"px",
            'z-index':'13000'
        });

        var maxCornerSize=this.balloonHeight-(this.balloonArrowHeight*2)+2-this.balloonCornerSize;
        
        var topLeftEl=document.createElement("div");
        topLeftEl.innerHTML="<img style='position: absolute;' src='"+this.roundImgPath+"'/>";
        var topLeft = new Ext.Element(topLeftEl);
        topLeft.addCls("balloonCornerTopLeft");
        topLeft.applyStyles({
            'width': this.balloonCornerSize+'px',
            'height':this.balloonCornerSize+'px',
            'left':  '0px',
            'top':  this.balloonArrowHeight-1+'px',
            'width':  this.balloonWidth-this.balloonCornerSize+'px',
            'height': maxCornerSize+'px'
        });
        this.balloon.appendChild(topLeft);
        
        var topRightEl = document.createElement("div");
        topRightEl.innerHTML="<img style='position: absolute; left: -1004px;' src='"+this.roundImgPath+"'/>";
        var topRight= new Ext.Element(topRightEl);
        topRight.addCls("balloonCornerTopRight");
        topRight.applyStyles({
            'width':this.balloonCornerSize+'px',
            'height':maxCornerSize+'px',
            'top': this.balloonArrowHeight-1+'px',
            'right':'0px'
        });
        this.balloon.appendChild(topRight);
        
        var bottomLeftEl = document.createElement("div");
        bottomLeftEl.innerHTML="<img style='position: absolute; top: -748px;' src='"+this.roundImgPath+"'/>";
        var bottomLeft=new Ext.Element(bottomLeftEl);
        bottomLeft.addCls("balloonCornerBottomLeft");
        bottomLeft.applyStyles({        
            'height':this.balloonCornerSize+'px',
            'left':  '0px',
            'bottom': this.balloonArrowHeight-1+'px',
            'width': this.balloonWidth-this.balloonCornerSize+'px'
        });
        this.balloon.appendChild(bottomLeft);
        
        var bottomRightEl = document.createElement("div");
        bottomRightEl.innerHTML="<img style='position: absolute; top: -748px; left: -1004px;' src='"+this.roundImgPath+"'/>";
        var bottomRight = new Ext.Element(bottomRightEl);
        bottomRight.addCls("balloonCornerBottomRight");
        bottomRight.applyStyles({
            'width':this.balloonCornerSize+'px',
            'height':this.balloonCornerSize+'px',
            'right':'0px',
            'bottom':this.balloonArrowHeight-1+'px'
        });
        this.balloon.appendChild(bottomRight);
        
        //arrows
        this.balloon.insertHtml("beforeEnd","<div class='balloonArrow balloonArrowTopLeft' style='display: none;'><img src='"+this.arrowImgPath+"'/></div>");
        this.balloon.insertHtml("beforeEnd","<div class='balloonArrow balloonArrowTopRight' style='display: none;'><img src='"+this.arrowImgPath+"'/></div>");
        this.balloon.insertHtml("beforeEnd","<div class='balloonArrow balloonArrowBottomLeft' style='display: none;'><img src='"+this.arrowImgPath+"'/></div>");
        this.balloon.insertHtml("beforeEnd","<div class='balloonArrow balloonArrowBottomRight' style='display: none;'><img src='"+this.arrowImgPath+"'/></div>");
        
        //content
        this.balloon.insertHtml("beforeEnd","<div class='balloonContent' style='top: "
            +(this.balloonArrowHeight+20)+"px; bottom: "
            +(this.balloonArrowHeight+4)+"px;"
            +"'></div>");
        //closing button
        /*var thisObj=this;
        this.balloon.append($j("<div class='balloonCloseButton'></div>")
            .css('right','7px')
            .css('top',''+(this.balloonArrowHeight+3)+'px')
            .click(function(){
                thisObj.remove();
                return false;
            })

        );*/
        this.xCoord=x;
        this.yCoord=y;

        //calculate position
        this._resetPositionOfBalloon(x,y);
        
        //append the balloon.
        Ext.get(this.mapDiv).appendChild(this.balloon);

        this.webMapController.registerEvent(Event.ON_FINISHED_CHANGE_EXTENT,webMapController.getMap(), this.setPosition,this);
    }

    /**
     *Private function. Use setPosition(x,y,true) to reset the position
     *Reset the position to the point. And displays the right Arrow to the point
     *Sets the this.leftOfPoint and this.topOfPoint
     *@param x the x coord
     *@param y the y coord
     */
    this._resetPositionOfBalloon = function(x,y){
        //calculate position
        var centerCoord= this.webMapController.getMap().getCenter();
        var centerPixel= this.webMapController.getMap().coordinateToPixel(centerCoord.x,centerCoord.y);
        var infoPixel= this.webMapController.getMap().coordinateToPixel(x,y);

        //determine the left and top.
        if (infoPixel.x > centerPixel.x){
            this.leftOfPoint=true;
        }else{
            this.leftOfPoint=false;
        }
        if (infoPixel.y > centerPixel.y){
            this.topOfPoint=true;
        }else{
            this.topOfPoint=false;
        }
        //display the right arrow
        this.balloon.select(".balloonArrow").applyStyles({'display':'none'});
        //$j("#infoBalloon > .balloonArrow").css('display', 'block');
        if (!this.leftOfPoint && !this.topOfPoint){
            //popup is bottom right of the point
            this.balloon.select(".balloonArrowTopLeft").applyStyles({"display":"block"});
        }else if (this.leftOfPoint && !this.topOfPoint){
            //popup is bottom left of the point
            this.balloon.select(".balloonArrowTopRight").applyStyles({"display":"block"});
        }else if (this.leftOfPoint && this.topOfPoint){
            //popup is top left of the point
            this.balloon.select(".balloonArrowBottomRight").applyStyles({"display":"block"});
        }else{
            //pop up is top right of the point
            this.balloon.select(".balloonArrowBottomLeft").applyStyles({"display":"block"});
        }
    }

    /**
     *Set the position of this balloon. Create it if not exists
     *@param x xcoord
     *@param y ycoord
     *@param resetPositionOfBalloon boolean if true the balloon arrow will be
     *redrawn (this.resetPositionOfBalloon is called)
     */
    this.setPosition = function (x,y,resetPositionOfBalloon){
        if (this.balloon==undefined){
            this._createBalloon(x,y);
        }else if(resetPositionOfBalloon){
            this._resetPositionOfBalloon(x,y);
        }
        if (x!=undefined && y != undefined){
            this.xCoord=x;
            this.yCoord=y;
        }else if (this.xCoord ==undefined || this.yCoord == undefined){
            throw "No coords found for this balloon";
        }else{
            x=this.xCoord;
            y=this.yCoord;
        }
        //if the point is out of the extent hide balloon
        var curExt=this.webMapController.getMap().getExtent();
        if (curExt.minx > x ||
            curExt.maxx < x ||
            curExt.miny > y ||
            curExt.maxy < y){
            /*TODO wat doen als hij er buiten valt.*/
            this.balloon.applyStyles({'display':'none'});
            return;
        }else{
            /*TODO wat doen als hij er weer binnen valt*/
            this.balloon.applyStyles({'display':'block'});
        }

        //calculate position
        var infoPixel= this.webMapController.getMap().coordinateToPixel(x,y);

        //determine the left and top.
        var left=infoPixel.x+this.offsetX;
        var top =infoPixel.y+this.offsetY;
        if (this.leftOfPoint){
            left=left-this.balloonWidth;
        }
        if (this.topOfPoint){
            top= top-this.balloonHeight;
        }
       //set position of balloon
        this.balloon.setLeft(""+left+"px");
        this.balloon.setTop(""+top+"px");
    }
    /*Remove the balloon*/
    this.remove = function(){
        this.balloon.remove();
        this.webMapController.unRegisterEvent(Event.ON_FINISHED_CHANGE_EXTENT,webMapController.getMap(), this.setPosition,this);
        delete this.balloon;
    }
    /*Get the DOM element where the content can be placed.*/
    this.getContentElement = function(){
        return this.balloon.select('.balloonContent');
    }
    this.hide = function(){
        this.balloon.setVisible(false);
    }
    this.show = function(){
        this.balloon.setVisible(true);
    }
}