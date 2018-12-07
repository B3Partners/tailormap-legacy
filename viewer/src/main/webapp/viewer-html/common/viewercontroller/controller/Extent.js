/**
 * @class 
 * @description There are 2 ways to create a extent:
 *- With 1 string that has 4 comma seperated coords(xxx,xxx,xxx,xxx)
 *- With 4 numbers
 **/
Ext.define("viewer.viewercontroller.controller.Extent",{
    minx: null,
    maxx: null,
    miny: null,
    maxy: null,
    /**
     * 
     * @param minx The minimal x of the extent. Can also be used for a comma seperated string. In that case the minx had all the coords in the form xxx,xxx,xxx,xxx and the rest of the params are undefined
     * @param miny The minimal y of the extent.
     * @param maxx The maximal x of the extent.
     * @param maxy The maximal y of the extent.
     */
    constructor: function (minx,miny,maxx,maxy){
        if (minx!=undefined && miny==undefined && maxx==undefined && maxy==undefined){
            var tokens=minx.split(",");
            if (tokens.length!=4){
                Ext.Error.raise({msg: "Can not create Extent because there is no bbox found"});
            }
            this.minx=tokens[0];
            this.miny=tokens[1];
            this.maxx=tokens[2];
            this.maxy=tokens[3];
        }else{
            this.minx=minx;
            this.maxx=maxx;
            this.miny=miny;
            this.maxy=maxy;
        }
        return this;
    },
    /**
     * Checks if the given x,y is in the extent.
     * @param x x coord
     * @param y y coord.
     * @return true if in extent, false if outsite.
     */
    isIn: function (x,y){
        if (this.minx ==null || this.maxx ==null || this.miny ==null || this.maxy ==null){
            return false;
        }
        if (x >= this.minx && x <= this.maxx &&
            y >= this.miny && y <= this.maxy){
            return true;
        }
        return false;
    },
    /**
     * The extent to wkt.
     * @return the wkt as string
     */
    toWKT: function (){
        var wkt="POLYGON((";
        wkt+=this.minx+" "+this.miny+", ";
        wkt+=this.maxx+" "+this.miny+", ";
        wkt+=this.maxx+" "+this.maxy+", ";
        wkt+=this.minx+" "+this.maxy+", ";
        wkt+=this.minx+" "+this.miny+"))";
        return wkt;
    },
    /**
     * Compares the given extent with this extent
     */
    equals: function(extent){
        if (extent==null){
            return false;
        }
        if (this.minx != extent.minx || 
            this.miny != extent.miny ||
            this.maxx != extent.maxx ||
            this.maxy != extent.maxy){
            return false;
        }
        return true;
    },

    expand: function (extent){
        this.minx = Math.min(this.minx,extent.minx);
        this.miny = Math.min(this.miny,extent.miny);
        this.maxx = Math.max(this.maxx, extent.maxx);
        this.maxy = Math.max(this.maxy, extent.maxy);
    },

    buffer: function(distance){
        this.minx -= distance;
        this.miny -= distance;
        this.maxx += distance;
        this.maxy += distance;
    },
    /**
     * The extent as comma seperated String
     * @return comma seperated String
     */
    toString : function (){
        var val="";
        val+=this.minx+","+this.miny+","+this.maxx+","+this.maxy;
        return val;
    }
    
});
