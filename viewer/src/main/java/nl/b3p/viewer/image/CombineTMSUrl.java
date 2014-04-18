/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package nl.b3p.viewer.image;

/**
 *
 * @author meine
 */
public class CombineTMSUrl extends CombineTileImageUrl{

    public CombineTMSUrl(CombineTileImageUrl ctiu) {
        super(ctiu);
    }

    public CombineTMSUrl() {
        super();
    }

    @Override
    protected String createUrl(ImageBbox imageBbox, Bbox tileBbox, int indexX, int indexY, int zoomlevel) {
        String requestUrl = this.url + "/" + zoomlevel + "/" + indexX + "/" + indexY + "." + this.extension;
        return requestUrl;
    }
    
}
