/*
 * Copyright (C) 2017 B3Partners B.V.
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

import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.GeometryFactory;
import com.vividsolutions.jts.geom.LineString;
import com.vividsolutions.jts.geom.Point;
import com.vividsolutions.jts.geom.PrecisionModel;
import com.vividsolutions.jts.io.ParseException;
import java.io.StringReader;
import java.util.Iterator;
import net.sourceforge.stripes.action.ActionBean;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.DefaultHandler;
import net.sourceforge.stripes.action.Resolution;
import net.sourceforge.stripes.action.StreamingResolution;
import net.sourceforge.stripes.action.StrictBinding;
import net.sourceforge.stripes.action.UrlBinding;
import net.sourceforge.stripes.validation.Validate;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.geometry.jts.WKTReader2;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 *
 * @author Meine Toonen
 */
@UrlBinding("/action/ontbrandings")
@StrictBinding
public class OntbrandingsActionBean implements ActionBean{

    private static final Log LOG = LogFactory.getLog(OntbrandingsActionBean.class);
    
    private ActionBeanContext context;
    private WKTReader2 wkt;
    private GeometryFactory gf;
    
    @Validate
    private String features;
    
    @DefaultHandler
    public Resolution calculate(){
        JSONObject result = new JSONObject();
        result.put("type", "calculate");
        gf = new GeometryFactory(new PrecisionModel(), 28992);
        wkt = new WKTReader2(gf);
        
        JSONArray jsonFeatures = new JSONArray(features);
        JSONObject mainLocation = null;
        for (Iterator<Object> iterator = jsonFeatures.iterator(); iterator.hasNext();) {
            JSONObject feature = (JSONObject)iterator.next();
            JSONObject attrs = feature.getJSONObject("attributes");
            if(attrs.getString("type").equals("audienceLocation") && attrs.getBoolean("mainLocation")){
                mainLocation = feature;
                break;
            }
            
        }
        JSONArray safetyZones = new JSONArray();
        for (Iterator<Object> iterator = jsonFeatures.iterator(); iterator.hasNext();) {
            JSONObject feature = (JSONObject)iterator.next();
            JSONObject safetyZone;
            try {
                JSONArray obs = calculateSafetyZone(feature, mainLocation);
                if(obs != null && obs.length() > 0){
                    for (Iterator<Object> iterator1 = obs.iterator(); iterator1.hasNext();) {
                        JSONObject g = (JSONObject)iterator1.next();
                        safetyZones.put(g);
                    }
                }
            } catch (ParseException ex) {
                LOG.debug("Error calculating safetyzone: ", ex);
            }
        }
        
        result.put("safetyZones", safetyZones);
        return new StreamingResolution( "application/json",new StringReader(result.toString()));
    }
    
    private JSONArray calculateSafetyZone(JSONObject feature,JSONObject mainLocation) throws ParseException{
        JSONObject attributes = feature.getJSONObject("attributes");
        String type = attributes.getString("type");
        JSONArray gs = new JSONArray();
        if (type.equals("ignitionLocation")) {
            boolean fan = attributes.getBoolean("fan");
            
            if(fan){
                calculateFan(feature, mainLocation, gs);
            }else{
                calculateNormalSafetyZone(feature, gs);
            }
        }
        return gs;
    }
    
    private void calculateFan(JSONObject feature, JSONObject mainLocation, JSONArray gs) throws ParseException{
        // Bereken centroide van feature: [1]
        // bereken centroide van hoofdlocatie: [2]
        // bereken lijn tussen de twee [1] en [2] centroides: [3]
        // bereken loodlijn op [3]: [4]
        // maak buffer in richting van [4] voor de fanafstand
            //Mogelijke verbetering, nu niet doen :// Voor elk vertex in feature, buffer met fan afstand in beiden richtingen van [4]
                // union alle buffers
                
                
        Geometry ignition = wkt.read(feature.getString("wktgeom"));
        Geometry audience = wkt.read(mainLocation.getString("wktgeom"));
        Point ignitionCentroid = ignition.getCentroid();
        Point audienceCentroid = audience.getCentroid();
        Coordinate[] coords = {ignitionCentroid.getCoordinate(), audienceCentroid.getCoordinate()};
        LineString ls = gf.createLineString(coords);
        
        gs.put(createFeature(ignitionCentroid, "temp", "ignitionCentroid"));
        gs.put(createFeature(audienceCentroid, "temp", "audienceCentroid"));
        gs.put(createFeature(ls, "temp", "audience2ignition"));
        
    }
    
    private void calculateNormalSafetyZone(JSONObject feature,  JSONArray gs) throws ParseException {
        JSONObject attributes = feature.getJSONObject("attributes");
        Integer zoneDistance = attributes.optInt("zonedistance_m", 0);
        if (zoneDistance == 0) {
            zoneDistance = attributes.optInt("custom_zonedistance_m", 0);
        }
        Geometry geom = wkt.read(feature.getString("wktgeom"));
        
        Geometry zone = geom.buffer(zoneDistance);
        gs.put(createFeature(zone, "safetyZone", "Veiligheidszone"));
    }

    private JSONObject createFeature(Geometry geom, String type, String label) {

        JSONObject feat = new JSONObject();
        JSONObject attrs = new JSONObject();
        feat.put("attributes", attrs);
        feat.put("wktgeom", geom.toText());

        attrs.put("type", type);
        attrs.put("label", label);

        return feat;
    }
    
    public Resolution print(){
        JSONObject result = new JSONObject();
        result.put("type", "print");return new StreamingResolution( "application/json",new StringReader(result.toString()));
    }
    
    // <editor-fold defaultstate="collapsed" desc="Getters and setters">
    @Override
    public ActionBeanContext getContext() {
        return context;
    }

    @Override
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }
    
    public String getFeatures() {
        return features;
    }

    public void setFeatures(String features) {
        this.features = features;
    }

    // </editor-fold>

}
