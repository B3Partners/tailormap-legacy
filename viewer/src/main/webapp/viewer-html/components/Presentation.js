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
Ext.define ("viewer.components.Presentation",{
    extend: "viewer.components.Component",
    config: {
        //@field path a array of objects. Every array contains a .imageUrl and a .extent
        images: null,
        path: null,
        startIndex: 0
    },
    index: null,
    imageLayers: null,
    container: null,
    previousButton: null,
    nextButton: null,
    constructor: function (config){
        //config example:
        if (config.images==undefined){
            config.images=[
                {imageUrl: "http://localhost/osgeonlPresentatie/frontpage.png",extent: new viewer.viewercontroller.controller.Extent("0,85000,20000,100000")},
                {imageUrl: "http://localhost/osgeonlPresentatie/watIsFlamingo.png",extent: new viewer.viewercontroller.controller.Extent("0,50000,20000,80000")},
                {imageUrl: "http://localhost/osgeonlPresentatie/initiatief.png",extent: new viewer.viewercontroller.controller.Extent("30000,85000,50000,100000")},
                {imageUrl: "http://localhost/osgeonlPresentatie/programmeurNaarRedacteur.png",extent: new viewer.viewercontroller.controller.Extent("60000,85000,80000,100000")},
                {imageUrl: "http://localhost/osgeonlPresentatie/onderdelenOverzicht.png",extent: new viewer.viewercontroller.controller.Extent("0,17500,30000,40000")},
                {imageUrl: "http://localhost/osgeonlPresentatie/viewerHTML.png",extent: new viewer.viewercontroller.controller.Extent("20000,42500,30000,50000")},
                {imageUrl: "http://localhost/osgeonlPresentatie/viewerCompleet.png",extent: new viewer.viewercontroller.controller.Extent("30000,50000,70000,70000")},
                {imageUrl: "http://localhost/osgeonlPresentatie/jsonconfig.png",extent: new viewer.viewercontroller.controller.Extent("40833,56041,41666,56666")},            
                {imageUrl: "http://localhost/osgeonlPresentatie/viewerServerHTML.png",extent: new viewer.viewercontroller.controller.Extent("40000,20000,50000,27500")},
                {imageUrl: "http://localhost/osgeonlPresentatie/databaseOpslag.png",extent: new viewer.viewercontroller.controller.Extent("40000,32500,50000,40000")},
                {imageUrl: "http://localhost/osgeonlPresentatie/screenAdminServices.png",extent: new viewer.viewercontroller.controller.Extent("80000,70000,90000,77773")},
                {imageUrl: "http://localhost/osgeonlPresentatie/screenAdminLayout.png",extent: new viewer.viewercontroller.controller.Extent("80000,50000,90000,57773")},
                {imageUrl: "http://localhost/osgeonlPresentatie/screenCompConf.png",extent: new viewer.viewercontroller.controller.Extent("80000,30000,90000,37773")},
                {imageUrl: "http://localhost/osgeonlPresentatie/features.png",extent: new viewer.viewercontroller.controller.Extent("60000,10000,70000,40000")},
                {imageUrl: "http://localhost/osgeonlPresentatie/vragen.png",extent: new viewer.viewercontroller.controller.Extent("40000,2500,50000,10000")}
            ];
        }
        if (config.path ==undefined){
            config.path=[
                //front page
                {extent: new viewer.viewercontroller.controller.Extent("0,85000,20000,100000")},
                //wat is flamingo
                {extent: new viewer.viewercontroller.controller.Extent("0,65000,20000,80000")},
                //wat is flamingo + 4
                {extent: new viewer.viewercontroller.controller.Extent("0,50000,20000,80000")},
                //initiatief
                {extent: new viewer.viewercontroller.controller.Extent("30000,85000,50000,100000")},
                //programmeur redacteur
                {extent: new viewer.viewercontroller.controller.Extent("60000,85000,80000,100000")},
                //Flamingo onderdelen
                {extent: new viewer.viewercontroller.controller.Extent("0,17500,30000,40000")},
                //viewer html
                {extent: new viewer.viewercontroller.controller.Extent("20000,42500,30000,50000")},
                //viewer compleet alleen html
                {extent: new viewer.viewercontroller.controller.Extent("36666,50000,50000,58333")},
                //json config
                {extent: new viewer.viewercontroller.controller.Extent("40833,56041,41666,56666")},
                //viewer compleet alleen html
                {extent: new viewer.viewercontroller.controller.Extent("36666,50000,50000,58333")},
                //viewer compleet html + server
                {extent: new viewer.viewercontroller.controller.Extent("30000,51666,50000,70000")},
                //database
                {extent: new viewer.viewercontroller.controller.Extent("40000,32500,50000,40000")},
                //viewerhtml en server communicatie
                {extent: new viewer.viewercontroller.controller.Extent("40000,20000,50000,27500")},
                //database
                {extent: new viewer.viewercontroller.controller.Extent("40000,32500,50000,40000")},
                //viewer compleet html + server
                {extent: new viewer.viewercontroller.controller.Extent("30000,51666,50000,70000")},
                //viewer compleet alles.
                {extent: new viewer.viewercontroller.controller.Extent("30000,50000,70000,70000")},
                //screen services
                {extent: new viewer.viewercontroller.controller.Extent("80000,70000,90000,77773")},
                //screen layout
                {extent: new viewer.viewercontroller.controller.Extent("80000,50000,90000,57773")},
                //screen comp conf
                {extent: new viewer.viewercontroller.controller.Extent("80000,30000,90000,37773")},
                //screen services
                {extent: new viewer.viewercontroller.controller.Extent("60000,25000,70000,40000")},
                //screen services
                {extent: new viewer.viewercontroller.controller.Extent("40000,2500,50000,10000")}
                
            ];
        }        
        viewer.components.Presentation.superclass.constructor.call(this,config);
        this.index=this.getStartIndex();
        this.imageLayers=new Array();
        this.addAllImages();
        this.createGui();
        this.moveTo(this.index);
    },
    /**
     * Add all the images in the path
     */
    addAllImages: function(){        
        for (var i=0; i < this.images.length; i++){
            var layer= this.config.viewerController.mapComponent.createImageLayer(this.getName()+"_"+i,this.images[i].imageUrl,this.images[i].extent);
            this.imageLayers.push(layer);
            this.config.viewerController.mapComponent.getMap().addLayer(layer);
        }
    },
    /**
     * Move the extent to the given index.
     */
    moveTo: function (newIndex){ 
        this.index=newIndex;
        if (this.index <= 0){
            this.previousButton.setVisible(false);
            this.index=0;
        }else{
            this.previousButton.setVisible(true);
        }
        if (this.index >= this.path.length-1){            
            this.nextButton.setVisible(false);
            this.index=this.path.length-1;
        }else{
            this.nextButton.setVisible(true);
        }        
        var newExtent=this.path[this.index].extent;
        this.config.viewerController.mapComponent.getMap().zoomToExtent(newExtent);
    },
    createGui: function (){
        var me = this;
        this.previousButton = Ext.create('Ext.Button',{
            id: this.name+"_previous",
            text: "Previous",
            handler: function(){me.previous()},
            height: "100%",
            flex: 1
        });
        this.nextButton = Ext.create('Ext.Button',{
            id: this.name+"_next",
            text: "Next",
            handler: function(){me.next()},
            height: "100%",
            flex: 1
        });
        this.container = Ext.create('Ext.container.Container', {
            width: '100%',
            height: '100%',
            html: this.html,
            renderTo: this.getContentDiv(),
            autoScroll: true,
            layout: {
                type: 'hbox',
                align: 'stretch'
            }
        });
        this.container.add(this.previousButton);
        this.container.add(this.nextButton);
    },
    /**
     * Move to the next image extent
     */
    next: function(){
        this.index++;
        this.moveTo(this.index);
    },
    /**
     * Move to the previous extent
     */
    previous: function(){
        this.index--;
        this.moveTo(this.index);
    }
    
});
    

