/**
 *Extent class constructor
 *There are 2 ways to create a extent:
 *- With 1 string that has 4 comma seperated coords(xxx,xxx,xxx,xxx)
 *- With 4 numbers
 **/
function Extent(minx,miny,maxx,maxy){
    if (minx!=undefined && miny==undefined && maxx==undefined && maxy==undefined){
        var tokens=minx.split(",");
        if (tokens.length!=4){
            throw("Can not create Extent because there is no bbox found");
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
}
