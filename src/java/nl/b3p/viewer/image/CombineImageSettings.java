/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.b3p.viewer.image;

import java.awt.Color;
import java.util.ArrayList;
import java.util.List;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 *
 * @author Roy
 */
public class CombineImageSettings {

    private static final Log log = LogFactory.getLog(CombineImageSettings.class);
    private List<CombineImageUrl> urls = null;
    private List<CombineImageWkt> wktGeoms = null;
    private Bbox bbox = null;
    private Integer srid = 28992;
    private Integer width = null;
    private Integer height = null;
    private Color defaultWktGeomColor= Color.RED;
    private String mimeType="image/png";
    
    // bbox + ";"+ resolutions + ";" + tileSize + ";" + serviceUrl;
    private String tilingBbox = null;
    private String tilingResolutions = null;
    private Integer tilingTileWidth = null;
    private Integer tilingTileHeight = null;
    private String tilingServiceUrl = null;    
    
    /**
     * Calculate the urls in the combineImageSettings.
     */
    public List getCalculatedUrls(){
        return getCalculatedUrls(urls);
    }
    /**
     * Geeft de url's terug met daarin de bbox met juist verhoudingen tov de width en height
     * En de juiste Width en Height van de settings
     * Tot nu alleen WMS urls ondersteund
     */
    public List getCalculatedUrls(List oldList){
        List returnValue=new ArrayList();
        if (bbox == null || width == null || height == null) {
            //log.info("Not all settings set (width,height and bbox must be set to recalculate). Return original urls");
            return oldList;
        }else if(oldList==null){
            return returnValue;
        }        
        Bbox correctedBbox= getCalculatedBbox();
        for (int i=0; i < oldList.size(); i++){
            CombineImageUrl ciu = (CombineImageUrl) oldList.get(i);
            returnValue.add(ciu.calculateNewUrl(width, height, correctedBbox));
        }
        if (returnValue.size()==oldList.size()){
            return returnValue;
        }else{
            return null;
        }
    }
    /**
     * Geeft een kloppende bbox terug. Dus kijkt naar de width en height en past
     * de bbox zo aan en returned die zodat je een bbox hebt die klopt met de width en height
     * verhoudingen
     */
    public Bbox getCalculatedBbox(){
        if (bbox == null || width == null || height == null) {
            log.info("Not all settings set (width,height and bbox must be set)");
            return null;
        }
        Bbox newBbox= new Bbox(bbox);
        double bboxXwidth = bbox.getMaxx() - bbox.getMinx();
        double bboxYheight = bbox.getMaxy() - bbox.getMiny();

        double unitsPerPixelWidth = bboxXwidth / width;
        double unitsPerPixelHeight = bboxYheight / height;

        if (unitsPerPixelWidth > unitsPerPixelHeight) {
            //verander y waarden van bbox
            double newYHeight2 =(unitsPerPixelWidth*height-bboxYheight)/2;
            newBbox.setMiny(newBbox.getMiny()-newYHeight2);
            newBbox.setMaxy(newBbox.getMaxy()+newYHeight2);
        } else {
            double newXWidth2= (unitsPerPixelHeight*width-bboxXwidth)/2;
            newBbox.setMinx(newBbox.getMinx()-newXWidth2);
            newBbox.setMaxx(newBbox.getMaxx()+newXWidth2);
        }
        return newBbox;
    }
    
    public void setUrls(String[] urls){
        this.urls=new ArrayList();
        for (int i=0; i < urls.length; i++){    
            CombineImageUrl ciu= new CombineImageUrl(urls[i]);
            this.urls.add(ciu);
        }
    }
    /**
     * Add the CombineImageUrl
     * @param ciu 
     */
    public void addUrl(CombineImageUrl ciu) {
        if (this.urls==null){
            this.urls = new ArrayList<CombineImageUrl>();
        }
        this.urls.add(ciu);
    }
    /**
     * Set the wktGeoms
     * @param wktGeoms Array of wktGeoms
     */
    public void setWktGeoms(String[] wktGeoms){
        this.wktGeoms=new ArrayList();
        for (int i=0; i < wktGeoms.length; i++){
            CombineImageWkt ciw= new CombineImageWkt(wktGeoms[i]);
            this.wktGeoms.add(ciw);
        }
    }  
   
    
    /**
     * Gets the bbox from a url
     */
    public Bbox getBboxFromUrls() {
        Bbox bb = null;
        for (int i = 0; i < urls.size() && bb == null; i++) {
            bb = getBboxFromUrl((CombineImageUrl)urls.get(i));
        }
        return bb;
    }
    /**
     * Gets the bbox from the url in the CombineImageUrl
     */
    public Bbox getBboxFromUrl(CombineImageUrl ciu) {
        if (ciu == null || ciu.getUrl()==null) {
            return null;
        }
        double[] bb = null;
        String url=ciu.getUrl();
        String stringBbox = ciu.getParameter("bbox");
        if (stringBbox != null) {
            if (stringBbox.split(",").length != 4) {
                stringBbox = null;
            } else {
                bb = new double[4];
                try {
                    bb[0] = Double.parseDouble(stringBbox.split(",")[0]);
                    bb[1] = Double.parseDouble(stringBbox.split(",")[1]);
                    bb[2] = Double.parseDouble(stringBbox.split(",")[2]);
                    bb[3] = Double.parseDouble(stringBbox.split(",")[3]);
                } catch (NumberFormatException nfe) {
                    bb = null;
                    log.debug("Geen geldige double waarden in de bbox: " + stringBbox);
                }
            }
        }
        if (bb != null) {
            return new Bbox(bb);
        } else {
            return null;
        }
    }
    /**
     * Try to resolve the width and height from the CombineImageUrl's
     * @return Array of int's width is the first in the array, height second
     */
    public Integer[] getWidthAndHeightFromUrls() {
        Integer[] hw = null;
        for (int i = 0; i < urls.size() && hw == null; i++) {
            hw = getWidthAndHeightFromUrl((CombineImageUrl)urls.get(i));
        }
        return hw;
    }
    /**
     * Try to resolve the width and height from the given CombineImageUrl
     * @param ciu 
     * @return Array of int's width is the first in the array, height second
     */
    public Integer[] getWidthAndHeightFromUrl(CombineImageUrl ciu) {
        if (ciu == null || ciu.getUrl()==null) {
            return null;
        }
        String url=ciu.getUrl();

        String heightString = ciu.getParameter("height");
        String widthString = ciu.getParameter("width");
        Integer[] result = null;
        if (heightString != null && widthString != null) {
            try {
                result = new Integer[2];
                result[0] = new Integer(widthString);
                result[1] = new Integer(heightString);
            } catch (NumberFormatException nfe) {
                result = null;
                log.debug("Height en/of Width zijn geen integers: Heigth: " + heightString + "Width: " + widthString);
            }
        }
        return result;
    }

    //<editor-fold defaultstate="collapsed" desc="Getters and Setters">
    public Color getDefaultWktGeomColor() {
        return defaultWktGeomColor;
    }
    public void setDefaultWktGeomColor(Color defaultWktGeomColor) {
        this.defaultWktGeomColor = defaultWktGeomColor;
    }
    public String getMimeType() {
        return mimeType;
    }
    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }
    public List getUrls() {
        return urls;
    }
    public void setUrls(List<CombineImageUrl> urls) {
        this.urls = urls;
    }
    public List getWktGeoms() {
        return wktGeoms;
    }
    public void setWktGeoms(List<CombineImageWkt> wktGeoms) {
        this.wktGeoms = wktGeoms;
    }
    
    public Bbox getBbox() {
        return bbox;
    }
    public void setBbox(double[] bbox) {
        this.bbox = new Bbox(bbox);
    }
    public void setBbox(String bbox) throws Exception {
        this.bbox = new Bbox(bbox);
    }
    
    public Integer getSrid() {
        return srid;
    }
    
    public void setSrid(Integer srid) {
        this.srid = srid;
    }
    
    public Integer getWidth() {
        return width;
    }
    
    public void setWidth(Integer width) {
        this.width = width;
    }
    
    public Integer getHeight() {
        return height;
    }
    
    public void setHeight(Integer height) {
        this.height = height;
    }
    public String getTilingBbox() {
        return tilingBbox;
    }
    
    public void setTilingBbox(String tilingBbox) {
        this.tilingBbox = tilingBbox;
    }
    
    public String getTilingServiceUrl() {
        return tilingServiceUrl;
    }
    
    public void setTilingServiceUrl(String tilingServiceUrl) {
        this.tilingServiceUrl = tilingServiceUrl;
    }
    
    public Integer getTilingTileHeight() {
        return tilingTileHeight;
    }
    
    public void setTilingTileHeight(Integer tilingTileHeight) {
        this.tilingTileHeight = tilingTileHeight;
    }
    
    public Integer getTilingTileWidth() {
        return tilingTileWidth;
    }
    
    public void setTilingTileWidth(Integer tilingTileWidth) {
        this.tilingTileWidth = tilingTileWidth;
    }
    
    public String getTilingResolutions() {
        return tilingResolutions;
    }
    
    public void setTilingResolutions(String tilingResolutions) {
        this.tilingResolutions = tilingResolutions;
    }
    //</editor-fold>
}
