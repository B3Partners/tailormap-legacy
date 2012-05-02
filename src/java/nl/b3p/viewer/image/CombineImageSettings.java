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
    private Integer angle = null;
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
     * Return a list of CombineImagesUrl's with correct bbox,height and width
     * @param oldList
     * @return 
     */
    public List getCalculatedUrls(List oldList){
        List returnValue=new ArrayList();
        if (bbox == null || width == null || height == null) {
            //log.info("Not all settings set (width,height and bbox must be set to recalculate). Return original urls");
            return oldList;
        }else if(oldList==null){
            return returnValue;
        }        
        ImageBbox imBBox = getRequestBbox();
                
        for (int i=0; i < oldList.size(); i++){
            CombineImageUrl ciu = (CombineImageUrl) oldList.get(i);
            returnValue.add(ciu.calculateNewUrl(imBBox));
        }
        if (returnValue.size()==oldList.size()){
            return returnValue;
        }else{
            return null;
        }
    }
    /**
     * Corrects the BBOX to the ratio of the height / width.
     * @return the new bbox
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
            CombineImageUrl ciu = urls.get(i);
            if (ciu instanceof CombineWmsUrl){
                bb = ((CombineWmsUrl)ciu).getBboxFromUrl();
            }
        }
        return bb;
    }    
    /**
     * Try to resolve the width and height from the CombineImageUrl's
     * @return Array of int's width is the first in the array, height second
     */
    public Integer[] getWidthAndHeightFromUrls() {
        Integer[] hw = null;
        for (int i = 0; i < urls.size() && hw == null; i++) {
            CombineImageUrl ciu = urls.get(i);
            if (ciu instanceof CombineWmsUrl){
                hw = ((CombineWmsUrl)ciu).getWidthAndHeightFromUrl();
            }
        }
        return hw;
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
    
    public Integer getAngle() {
        return angle;
    }

    public void setAngle(Integer angle) {
        this.angle = angle;
    }
    //</editor-fold>   
    /**
     * Create a new BBOX that covers the original and the rotated bbox
     * @param bbox
     * @param rotation
     * @return 
     */
    private Bbox getBboxWithRotation(Bbox bb, Integer rotation) {
        //copy the bbox
        Bbox newBbox = new Bbox(bb);
        if (rotation ==null || rotation <= 0 || rotation >= 360){
            return newBbox;
        }
        double centerX= newBbox.getCenterX();
        double centerY= newBbox.getCenterY();
        //calculate the rotated corners of the bbox;
        //first transform BBOX rotation point to 0.0:
        newBbox.transform(-centerX,-centerY);
        //store the calculated coords in a Double[][]
        double[][] coords = new double[4][2];
        //lower left
        coords[0]=calcRotation(rotation, newBbox.getMinx(),newBbox.getMiny());
        //lower right
        coords[1]=calcRotation(rotation, newBbox.getMaxx(),newBbox.getMiny());
        //upper right
        coords[2]=calcRotation(rotation, newBbox.getMaxx(),newBbox.getMaxy());
        //upper left;
        coords[3]=calcRotation(rotation, newBbox.getMinx(),newBbox.getMaxy());
        
        //enlarge the orginal bbox with the  rotated bbox.
        for (int i=0; i < coords.length; i++){
            double x=coords[i][0];
            double y=coords[i][1];
            if (x < newBbox.getMinx()){
                newBbox.setMinx(x);
            }if (x > newBbox.getMaxx()){
                newBbox.setMaxx(x);
            }if (y < newBbox.getMiny()){
                newBbox.setMiny(y);
            }if (y > newBbox.getMaxy()){
                newBbox.setMaxy(y);
            }
        }
        //transform the new bbox back
        newBbox.transform(centerX,centerY);
        return newBbox;
        
    }
    /**
     * Calculate the rotation for a point
     * @param rotation The rotation in degrees.
     * @param x x coord
     * @param y y coord
     * @return a Double[] of length 2. First is the x, second the y.
     */
    private double[] calcRotation(Integer rotation, double x, double y) {
        double rad = Math.toRadians(rotation);
        double[] returnValue = new double[2];
        returnValue[0]= x * Math.cos(rad) - y * Math.sin(rad);
        returnValue[1]= x * Math.sin(rad) + y * Math.cos(rad);
        return returnValue;
    }
    /**
     * Get the request Bbox,height and width
     * @return 
     */
    public ImageBbox getRequestBbox() {
        Bbox correctedBbox= getCalculatedBbox();
        Integer reqWidth= this.width;
        Integer reqHeight= this.height;
        if (this.angle !=null && this.angle > 0 && this.angle < 360){
            Bbox reqBbox= getBboxWithRotation(correctedBbox,this.angle);
            //make the widht/height larger/smaller according the calculated bbox.
            Double floorWidth = Math.floor(reqBbox.getWidth()/correctedBbox.getWidth() * this.width);
            Double floorHeight = Math.floor(reqBbox.getHeight()/correctedBbox.getHeight() * this.height);
            reqWidth = floorWidth.intValue();
            reqHeight = floorHeight.intValue();
            correctedBbox=reqBbox;
        }
        return new ImageBbox(correctedBbox,reqWidth,reqHeight);
    }
}
