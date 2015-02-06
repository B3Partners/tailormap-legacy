/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.b3p.viewer.image;


/**
 *
 * @author Roy Braam
 */
class CombineWmscUrl extends CombineTileImageUrl {

    public CombineWmscUrl(CombineWmscUrl cwu){
        super(cwu);
    }
    public CombineWmscUrl() {
        super();
    }

    @Override
    protected String createUrl(ImageBbox imageBbox, Bbox tileBbox, int indexX, int indexY, int zoomlevel) {        
        String sizes = null;
        if (this.getTileWidth() != null && this.getTileHeight() != null) {
            sizes = "&WIDTH=" + this.getTileWidth() + "&HEIGHT=" + this.getTileHeight();
        }
        String bboxString = "&BBOX=" + tileBbox.toString();
        String newUrl = this.url + sizes + bboxString;
        return newUrl;
    
    }
    
}
