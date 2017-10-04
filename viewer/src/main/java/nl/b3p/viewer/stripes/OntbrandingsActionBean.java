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
import com.vividsolutions.jts.geom.CoordinateSequence;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.GeometryFactory;
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
        JSONArray safetyZones = new JSONArray();
        for (Iterator<Object> iterator = jsonFeatures.iterator(); iterator.hasNext();) {
            JSONObject feature = (JSONObject)iterator.next();
            JSONObject safetyZone;
            try {
                safetyZone = calculateSafetyZone(feature);
                if(safetyZone != null){
                    safetyZones.put(safetyZone);
                }
            } catch (ParseException ex) {
                LOG.debug("Error calculating safetyzone: ", ex);
            }
        }
        
        result.put("safetyZones", safetyZones);
        return new StreamingResolution( "application/json",new StringReader(result.toString()));
    }
    
    private JSONObject calculateSafetyZone(JSONObject feature) throws ParseException{
        JSONObject attributes = feature.getJSONObject("attributes");
        String type = attributes.getString("type");
        if (type.equals("ignitionLocation")) {
            Integer zoneDistance = attributes.optInt("zonedistance_m", 0);
            if(zoneDistance == 0){
                zoneDistance = attributes.optInt("custom_zonedistance_m", 0);
            }
            boolean fan = attributes.getBoolean("fan");
            Geometry geom = wkt.read(feature.getString("wktgeom"));
            Geometry combined = geom.buffer(zoneDistance);
 
            if(combined != null){
                JSONObject feat = new JSONObject();
                JSONObject attrs = new JSONObject();
                feat.put("attributes",attrs);
                feat.put("wktgeom",combined.toText());
                
                attrs.put("type", "safetyZone");
                attrs.put("label", "Veiligheidszone");
                        
                return feat;
            }
        }
        return null;
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
