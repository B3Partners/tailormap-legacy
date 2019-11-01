/*
 * Copyright (C) 2012-2016 B3Partners B.V.
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
package nl.b3p.viewer.image;

import java.awt.Color;
import java.util.ArrayList;
import java.util.List;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author Roy
 */
public class CombineImageSettings {
    private static final Log log = LogFactory.getLog(CombineImageSettings.class);
    
    public static final String WMS_PROTOCOL = "WMS";
    public static final String ARCSERVER_PROTOCOL = "ARCSERVER";
    public static final String ARCSERVERREST_PROTOCOL = "ARCSERVERREST";
    public static final String IMAGE_PROTOCOL="IMAGE";
    public static final String WMSC_PROTOCOL="WMSC";
    public static final String TMS_PROTOCOL="TMS";
    public static final String WMTS_PROTOCOL="WMTS";
    
    private List<CombineImageUrl> urls = null;
    private List<CombineImageWkt> wktGeoms = null;
    private Bbox bbox = null;
    private Integer srid = 28992;
    private Integer width = null;
    private Integer height = null;
    private Integer angle = null;
    public static Color defaultWktGeomColor= Color.RED;
    private String mimeType="image/png";
    
    // bbox + ";"+ resolutions + ";" + tileSize + ";" + serviceUrl;
    
    private String tilingServiceUrl = null;    
    
    /**
     * Calculate the urls in the combineImageSettings.
     *
     * @return list CombineImageUrl
     */
    public List<CombineImageUrl> getCalculatedUrls() {
        return getCalculatedUrls(urls);
    }
    /**
     * Return a list of CombineImagesUrl's with correct bbox,height and width.
     *
     * @param oldList list of CombineImageUrl
     * @return list of recalculated CombineImageUrl
     */
    private List<CombineImageUrl> getCalculatedUrls(List<CombineImageUrl> oldList){
        List<CombineImageUrl> returnValue=new ArrayList();
        if (bbox == null || width == null || height == null) {
            log.warn("Not all settings set (width,height and bbox must be set to recalculate). Return original urls");
            return oldList;
        }else if(oldList==null){
            return returnValue;
        }        
        ImageBbox imBBox = getRequestBbox();
                
        for (int i=0; i < oldList.size(); i++){
            CombineImageUrl ciu = (CombineImageUrl) oldList.get(i);
            returnValue.addAll(ciu.calculateNewUrl(imBBox));
        }        
        return returnValue;
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
     * Add the CombineImageUrl.
     *
     * @param ciu to add
     */
    public void addUrl(CombineImageUrl ciu) {
        if (this.urls==null){
            this.urls = new ArrayList<CombineImageUrl>();
        }
        this.urls.add(ciu);
    }
    /**
     * Set the wktGeoms.
     *
     * @param wktGeoms array of wktGeoms
     */
    public void setWktGeoms(String[] wktGeoms){
        this.wktGeoms=new ArrayList();
        for (int i=0; i < wktGeoms.length; i++){
            CombineImageWkt ciw= new CombineImageWkt(wktGeoms[i]);
            this.wktGeoms.add(ciw);
        }
    }  
   
    
    /**
     * Gets the bbox from a url.
     *
     * @return the bbox from a url
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
     * Try to resolve the width and height from the CombineImageUrl's.
     *
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
    public List<CombineImageUrl> getUrls() {
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
    
    public String getTilingServiceUrl() {
        return tilingServiceUrl;
    }
    
    public void setTilingServiceUrl(String tilingServiceUrl) {
        this.tilingServiceUrl = tilingServiceUrl;
    }
    
    public Integer getAngle() {
        return angle;
    }

    public void setAngle(Integer angle) {
        this.angle = angle;
    }

    //</editor-fold>   
    /**
     * Create a new BBOX that covers the original and the rotated bbox.
     *
     * @param bb original bbox
     * @param rotation angle in degrees
     * @return a new BBOX that covers the original and the rotated bbox
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
     * Get the request Bbox,height and width.
     *
     * @return the imagebox of the request
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
    /**
     * @param settings a JSONObject in the following format:      <pre>
     * {            
     *      requests: [
     *          {
     *              protocol: "",
     *              extent: "", //if extent is other then the given bbox.
     *              url: "",
     *              alpha: "",
     *              body: "",
     *              tileWidth: "", //default 256, for tiling
     *              tileHeight: "", //default 256, for tiling
     *              serverExtent: "" //server extent, for tiling
     *          }
     *      ],
     *      geometries: [
     *          wktgeom: "",
     *          color: ""
     *      ],
     *      bbox: "",
     *      width: "",
     *      height: "",
     *      srid: "",
     *      angle: "",
     *      quality: ""
     *  }
     * </pre>
     * @return a new CombineImageSettings from the passed in json
     * @throws org.json.JSONException if parsing the json failed
     * @throws Exception if any
     */
    public static CombineImageSettings fromJson(JSONObject settings) throws JSONException, Exception{        
        JSONObject jResponse = new JSONObject();
       
        CombineImageSettings cis = new CombineImageSettings();            
        //get the requests
        if (settings.has("requests")){
            JSONArray requests = settings.getJSONArray("requests");
            for (int r=0; r < requests.length(); r++){
                CombineImageUrl ciu = null;
                JSONObject request=requests.getJSONObject(r);

                String protocol = null;
                if (request.has("protocol")){
                    protocol=request.getString("protocol");
                }
                if (ARCSERVER_PROTOCOL.equals(protocol)){
                    ciu= new CombineArcServerUrl();
                }else if (WMS_PROTOCOL.equals(protocol)){
                    ciu = new CombineWmsUrl();
                }else if (IMAGE_PROTOCOL.equals(protocol)) {                            
                    CombineStaticImageUrl csiu = new CombineStaticImageUrl();
                    if (request.has("extent")){
                        csiu.setBbox(new Bbox(request.getString("extent")));                                
                    }
                    ciu=csiu;
                }else if (WMSC_PROTOCOL.equals(protocol)){
                    CombineWmscUrl cwu = new CombineWmscUrl();
                    if (request.has("serverExtent")){
                        cwu.setServiceBbox(new Bbox(request.getString("serverExtent")));
                    }if (request.has("tileWidth")){
                        cwu.setTileWidth(request.getInt("tileWidth"));
                    }if (request.has("tileHeight")){
                        cwu.setTileHeight(request.getInt("tileHeight"));                        
                    }if (request.has("resolutions")){
                        String resolutions = request.getString("resolutions");
                        String[] tokens = resolutions.split(",");
                        Double[] res = new Double[tokens.length];
                        for (int i=0; i < tokens.length; i++){
                            res[i] = new Double(tokens[i]);
                        }                            
                        cwu.setResolutions(res);
                    }
                    ciu = cwu;
                } else if (TMS_PROTOCOL.equals(protocol) ) {
                    CombineTMSUrl ctu = new CombineTMSUrl();
                    if (request.has("serverExtent")) {
                        ctu.setServiceBbox(new Bbox(request.getString("serverExtent")));
                    }
                    if (request.has("tileWidth")) {
                        ctu.setTileWidth(request.getInt("tileWidth"));
                    }
                    if (request.has("tileHeight")) {
                        ctu.setTileHeight(request.getInt("tileHeight"));
                    }
                    if (request.has("extension")) {
                        ctu.setExtension(request.getString("extension"));
                    }
                    if (request.has("resolutions")) {
                        String resolutions = request.getString("resolutions");
                        String[] tokens = resolutions.split(",");
                        Double[] res = new Double[tokens.length];
                        for (int i = 0; i < tokens.length; i++) {
                            res[i] = new Double(tokens[i]);
                        }
                        ctu.setResolutions(res);
                    }
                    ciu = ctu;
                }else if ( WMTS_PROTOCOL.equals(protocol) ) {
                    CombineWMTSUrl ctu = new CombineWMTSUrl();
                    if (request.has("serverExtent")) {
                        ctu.setServiceBbox(new Bbox(request.getString("serverExtent")));
                    }
                    if (request.has("tileWidth")) {
                        ctu.setTileWidth(request.getInt("tileWidth"));
                    }
                    if (request.has("tileHeight")) {
                        ctu.setTileHeight(request.getInt("tileHeight"));
                    }
                    if (request.has("extension")) {
                        ctu.setExtension(request.getString("extension"));
                    }
                    if(request.has("matrixSet")){
                        ctu.setMatrixSet(request.getJSONObject("matrixSet"));
                    }
                    String layername = request.getString("name");
                    ctu.setLayername(layername);
                    
                    ciu = ctu;
                }else if (ARCSERVERREST_PROTOCOL.equals(protocol)){
                    CombineArcServerRestUrl casr = new CombineArcServerRestUrl();
                    ciu = casr;
                }else{
                    throw new IllegalArgumentException( "Illegal servicetype: " + protocol);
                }
                ciu.setUrl(request.getString("url"));
                if (request.has("alpha")){
                    Double alpha=request.getDouble("alpha");
                    //divide by 100 (number between 0 and 1)
                    ciu.setAlpha(alpha.floatValue()/100);
                }
                if (request.has("body")){
                    ciu.setBody(request.getString("body"));  
                }
                cis.addUrl(ciu);
            }
        }
        if (settings.has("geometries")){
            JSONArray geometries = settings.getJSONArray("geometries");
            List<CombineImageWkt> wkts = new ArrayList<CombineImageWkt>();
            for (int g=0; g < geometries.length(); g++){
                JSONObject geom = geometries.getJSONObject(g);
                if (geom.has("_wktgeom")){
                    CombineImageWkt ciw = new CombineImageWkt(geom.getString("_wktgeom"));
                    if (geom.has("color") && !geom.isNull("color")){
                        ciw.setColor(geom.getString("color"));
                    }
                    if (geom.has("label") && !geom.isNull("label")){
                        ciw.setLabel(geom.getString("label"));
                    }
                    if (geom.has("strokeWidth") && !geom.isNull("strokeWidth")) {
                        ciw.setStrokeWidth((float) geom.getDouble("strokeWidth"));
                    }
                    
                    if(geom.has("style")){
                        JSONObject jsonStyle = geom.getJSONObject("style");
                        FeatureStyle fs = new FeatureStyle(jsonStyle);
                        ciw.setStyle(fs);
                    }
                    wkts.add(ciw);
                }
            }
            cis.setWktGeoms(wkts);
        }
        if (settings.has("bbox")){
            cis.setBbox(settings.getString("bbox"));                
        }
        if (settings.has("width")){
            cis.setWidth(settings.getInt("width"));
        }
        if (settings.has("height")){
            cis.setHeight(settings.getInt("height"));
        }
        if (settings.has("srid")){
            cis.setSrid(settings.getInt("srid"));
        }
        if (settings.has("angle")){
            cis.setAngle(settings.getInt("angle"));
        }
        if (settings.has("quality")){
            int quality = settings.getInt("quality");
            if (cis.getWidth() > cis.getHeight()){
                cis.setHeight(Math.round(cis.getHeight() * quality/cis.getWidth()));
                cis.setWidth(quality);
            }else{
                cis.setWidth(Math.round(cis.getWidth() * quality/cis.getHeight()));
                cis.setHeight(quality);
            }
        }
        return cis;
    }
}
