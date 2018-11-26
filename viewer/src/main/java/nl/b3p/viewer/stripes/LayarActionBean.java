/*
 * Copyright (C) 2011-2016 B3Partners B.V.
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

package nl.b3p.viewer.stripes;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import java.io.StringReader;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import net.sourceforge.stripes.action.ActionBean;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.Resolution;
import net.sourceforge.stripes.action.StreamingResolution;
import net.sourceforge.stripes.action.StrictBinding;
import net.sourceforge.stripes.action.UrlBinding;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.csw.jaxb.gml.MultiGeometry;
import nl.b3p.viewer.config.ClobElement;
import nl.b3p.viewer.config.services.LayarService;
import nl.b3p.viewer.config.services.LayarSource;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.FeatureSource;
import org.geotools.data.Query;
import org.geotools.factory.CommonFactoryFinder;
import org.geotools.feature.FeatureIterator;
import org.geotools.geometry.jts.JTS;
import org.geotools.geometry.jts.JTSFactoryFinder;
import org.geotools.referencing.CRS;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.filter.Filter;
import org.opengis.filter.FilterFactory2;
import org.opengis.geometry.MismatchedDimensionException;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.crs.CoordinateReferenceSystem;
import org.opengis.referencing.operation.MathTransform;
import org.opengis.referencing.operation.TransformException;
import org.stripesstuff.stripersist.Stripersist;

/**
 * @author Roy Braam
 */
@UrlBinding("/action/layar")
@StrictBinding
public class LayarActionBean implements ActionBean {
    private static final Log log = LogFactory.getLog(LayarActionBean.class);
    private static final Integer TIMEOUT=10000;
    private static final Integer DEFAULT_RADIUS=5000;    
    private static Integer MAX_FEATURES=500;
    private static GeometryFactory geometryFactory = JTSFactoryFinder.getGeometryFactory(null);
    private static CoordinateReferenceSystem DEFAULT_CRS;
    private static CoordinateReferenceSystem layarCRS;
    private static FilterFactory2 ff = CommonFactoryFinder.getFilterFactory2();
    /**
     * Init fallback CRS and the LayarCrs.
     */
    static{
        try {
            layarCRS=CRS.decode("EPSG:4326");
            DEFAULT_CRS=CRS.decode("EPSG:28992");            
        } catch (Exception e){
            log.error("Error while getting CRS.",e);
        }
    }
    
    private ActionBeanContext context;
    /**
     * Layar request param's
     * see: http://layar.com/documentation/browser/api/getpois-request/
     */
    @Validate (required=true)
    private String lon;    
    @Validate (required=true)
    private String lat;
    @Validate
    private String countryCode;
    @Validate
    private String userId;
    @Validate
    private Integer radius;
    @Validate (required=true)    
    private String layerName;
    @Validate
    private String version;
    @Validate
    private Integer accuracy;    
    @Validate
    private String lang;
    //action: update or refresh
    @Validate
    private String action;
    /**
     * Get's the LayarService by the given name.
     * Loads features with the LayarSources and makes the hotspots.
     * @return json for the layar component
     * @throws org.json.JSONException if transforming to json fails
     */
    public Resolution json() throws JSONException{
        String error="";
        Integer errorCode=0;
        
        JSONObject root = new JSONObject();
        root.put("layar",this.layerName);
        
        LayarService layarService =(LayarService) Stripersist.getEntityManager().createQuery("from LayarService where name=:n")
                    .setParameter("n", this.layerName).getSingleResult();
        
        if (this.radius==null){
            this.radius=DEFAULT_RADIUS;
        }        
        if (layarService!=null){            
            root.put("layer", layarService.getName());
            List<LayarSource> layarSources = layarService.getLayarSources();
            Iterator<LayarSource> lit = layarSources.iterator();            
            JSONArray hotspots = new JSONArray();
            while(lit.hasNext() && MAX_FEATURES > hotspots.length()){
                LayarSource layarSource = lit.next();
                //layarSource.getFeatureType().
                FeatureSource fs=null;
                FeatureIterator<SimpleFeature> it=null;
                if(layarSource.getFeatureType()!=null){
                    try{
                        fs =layarSource.getFeatureType().openGeoToolsFeatureSource(TIMEOUT);
                        CoordinateReferenceSystem featureCrs = getCRS(fs);
                        //create filter
                        Filter filter = createFilter(fs,featureCrs);
                        Query q= new Query(fs.getName().toString(),filter);
                        q.setMaxFeatures(MAX_FEATURES-hotspots.length());
                        it = fs.getFeatures(q).features();                    
                        while(it.hasNext()){
                            SimpleFeature f = it.next();
                            try{
                                JSONObject hotspot = createHotspot(f,layarSource);
                                hotspots.put(hotspot);
                            }catch(Exception e){
                                log.error("Error creating hotspot",e);
                            }
                        }
                    }catch(Exception e){
                        log.error("Error while retrieving features ",e);
                        error= "Error while retrieving features: "+e.getMessage();
                    }finally{
                        if (it!=null){
                            it.close();
                        }
                        if(fs!=null){
                            fs.getDataStore().dispose();
                        }
                    }
                }
                
            }
            root.put("hotspots",hotspots);
        }        
        root.put("errorString",error);
        if (error.length()>0){
            //if error, errorCode must be at least 20
            if (errorCode < 20){
                errorCode=20;
            }
        }
        root.put("errorCode",errorCode);
        
        root.put("radius",this.radius);
        return new StreamingResolution("application/json", new StringReader(root.toString()));                
    }
    /**
     * Create the filter for retrieving the features.
     * @param fs 
     * @param featureCRS The CRS of the features.
     * @return
     * @throws FactoryException
     * @throws MismatchedDimensionException
     * @throws TransformException 
     */
    private Filter createFilter(FeatureSource fs, CoordinateReferenceSystem featureCRS) throws FactoryException, MismatchedDimensionException, TransformException {        
        //transform to feature CRS
        Point requestPoint = geometryFactory.createPoint(
                new Coordinate(Double.parseDouble(lon),Double.parseDouble(lat)));
        Geometry targetGeometry=transform(requestPoint, layarCRS, featureCRS);
        
        String geomAttr = fs.getSchema().getGeometryDescriptor().getLocalName();
        Filter f;        
        f = ff.intersects(ff.property(geomAttr), ff.literal(targetGeometry.buffer(this.radius)));
        return f;
        
    }
    /**
     * Get the CRS for this FeatureSource, if not found return the DEFAULT_CRS
     */
    private CoordinateReferenceSystem getCRS(FeatureSource fs) {
        CoordinateReferenceSystem crs = fs.getSchema().getCoordinateReferenceSystem();
        if (crs==null){
            log.warn("No Crs found for FeatureType: "+fs.getSchema().getName()+" make use of default crs: "+DEFAULT_CRS.toString());
            crs= DEFAULT_CRS;
        }
        return crs;
    }
    /**
     * Create the hotspot for the given feature
     * @param feature the feature that is used to make the hotspot
     * @param layarSource the layarSource that where the format is defined
     * @return JSONObject that represents the hotspot
     * @throws JSONException
     * @throws FactoryException
     * @throws MismatchedDimensionException
     * @throws TransformException
     * @throws Exception 
     */
    private JSONObject createHotspot(SimpleFeature feature,LayarSource layarSource) throws JSONException, FactoryException, MismatchedDimensionException, TransformException, Exception{
        JSONObject hotspot = new JSONObject();
        hotspot.put("id",layarSource.getFeatureType().getTypeName()+feature.getID());
        hotspot.put("anchor", createAnchor(feature));
        hotspot.put("text",createText(feature,layarSource));
        if (layarSource.getDetails().get("imageURL")!=null){
            hotspot.put("imageURL",replaceValuesInString(layarSource.getDetails().get("imageURL"),feature));
        }
        return hotspot;
    }
    /**
     * Create the geo anchor for the hotspot.
     * @param f the feature
     * @return
     * @throws FactoryException
     * @throws MismatchedDimensionException
     * @throws TransformException
     * @throws Exception 
     */
    private JSONObject createAnchor(SimpleFeature f) throws FactoryException, MismatchedDimensionException, TransformException, Exception{
        if (f.getDefaultGeometry()==null){
            throw new Exception("No geometry found for feature: "+f.getID());
        }
        JSONObject anchor = new JSONObject();
        Geometry geom = (Geometry) f.getDefaultGeometry();
        Point featurePoint;
        if (geom instanceof Point) {
            featurePoint= (Point) geom;
        } else {
            featurePoint= geom.getCentroid();
        }
        CoordinateReferenceSystem sourceCRS = f.getDefaultGeometryProperty().getDescriptor().getCoordinateReferenceSystem();
        Point latLonPoint = (Point) transform(featurePoint,sourceCRS,layarCRS);
        
        JSONObject geolocation = new JSONObject();
        geolocation.put("lat", latLonPoint.getY());
        geolocation.put("lon", latLonPoint.getX());
        anchor.put("geolocation", geolocation);
        return anchor;
    }
    /**
     * Create the text node in the hotspot.
     * @param f 
     * @param layarSource 
     * @return
     * @throws JSONException
     * @throws Exception 
     */
    private JSONObject createText(SimpleFeature f,LayarSource layarSource) throws JSONException, Exception{
        JSONObject text = new JSONObject();
        Map<String, ClobElement> details=layarSource.getDetails();
        if (details.get("text.title")==null){
            throw new Exception("text.title must be configured");
        }
        text.put("title", replaceValuesInString(details.get("text.title"),f));
        if (details.get("text.description")!=null){
            text.put("description",replaceValuesInString(details.get("text.description"),f));
        }
        if (details.get("text.footnote")!=null){
            text.put("footnote",replaceValuesInString(details.get("text.footnote"),f));
        }
        return text;
    }
    private String replaceValuesInString(ClobElement clob, SimpleFeature f) throws Exception {
        return replaceValuesInString(clob.toString(), f);
    }
    /**
     * Replace all the [attributename] in the given string with the values in the SimpleFeature
     * @param string
     * @param f
     * @return
     * @throws Exception 
     */
    private String replaceValuesInString(String string, SimpleFeature f) throws Exception {
        if (string==null){
            return null;
        }if (!string.contains("[") && !string.contains("]")) {
            return string;
        }
        StringBuilder url = new StringBuilder(string);
        
        int begin = -1;
        int end = -1;
        for (int i = 0; i < url.length(); i++) {
            char c = url.charAt(i);
            if (c == '[') {
                if (begin == -1) {
                    begin = i;
                } else {
                    throw new Exception("Configuration of \"" + string + "\" not correct. ']' missing .");
                }
            } else if (c == ']') {
                end = i;
                if (begin != -1 && end != -1) {
                    String attribName = url.substring(begin + 1, end);
                    Object value=null;
                    if (attribName == null || attribName.length() == 0) {
                        value="";
                    }else{
                        value = f.getAttribute(attribName);
                    }                    
                    if (value == null) {
                        value = "";
                    }
                    url.replace(begin, end + 1, value.toString().trim());
                    i = begin;
                    begin = -1;
                    end = -1;                    
                } else {
                    throw new Exception("Configuration of \"" + string + "\" not correct. Missing '[' .");
                }
            } else if (i == url.length() - 1 && begin != -1) {
                throw new Exception("Configuration of \"" + string + "\" not correct. Missing ']' .");
            }
        }
        return url.toString();
    }
    
    /**
     * Transform geometry to an CRS
     * @param sourceGeometry the geometry
     * @param fromCrs the CRS of the geometry
     * @param toCrs the new CRS of the geometry
     * @return
     * @throws FactoryException
     * @throws MismatchedDimensionException
     * @throws TransformException 
     */
    private static Geometry transform(Geometry sourceGeometry, CoordinateReferenceSystem fromCrs, CoordinateReferenceSystem toCrs) throws FactoryException, MismatchedDimensionException, TransformException {        
        MathTransform transform = CRS.findMathTransform(fromCrs, toCrs);
        Geometry targetGeometry = JTS.transform(sourceGeometry, transform);
        return targetGeometry;
    }
    
    //<editor-fold defaultstate="collapsed" desc="Getters and Setters">
    @Override
    public ActionBeanContext getContext() {
        return context;
    }
    
    @Override
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }
    
    public String getLon() {
        return lon;
    }

    public void setLon(String lon) {
        this.lon = lon;
    }

    public String getLat() {
        return lat;
    }

    public void setLat(String lat) {
        this.lat = lat;
    }

    public String getCountryCode() {
        return countryCode;
    }

    public void setCountryCode(String countryCode) {
        this.countryCode = countryCode;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Integer getRadius() {
        return radius;
    }

    public void setRadius(Integer radius) {
        this.radius = radius;
    }

    public String getLayerName() {
        return layerName;
    }

    public void setLayerName(String layerName) {
        this.layerName = layerName;
    }

    public Integer getAccuracy() {
        return accuracy;
    }

    public void setAccuracy(Integer accuracy) {
        this.accuracy = accuracy;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }
    //</editor-fold>   
}
