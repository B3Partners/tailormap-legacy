/*
 * Copyright (C) 2017-2018 B3Partners B.V.
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

import com.vividsolutions.jts.algorithm.Angle;
import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.GeometryCollection;
import com.vividsolutions.jts.geom.GeometryFactory;
import com.vividsolutions.jts.geom.LineString;
import com.vividsolutions.jts.geom.MultiLineString;
import com.vividsolutions.jts.geom.Point;
import com.vividsolutions.jts.geom.PrecisionModel;
import com.vividsolutions.jts.io.ParseException;
import com.vividsolutions.jts.linearref.LengthIndexedLine;
import com.vividsolutions.jts.simplify.TopologyPreservingSimplifier;
import com.vividsolutions.jts.util.GeometricShapeFactory;
import java.awt.geom.AffineTransform;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
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
import org.geotools.geometry.jts.JTS;
import org.geotools.geometry.jts.WKTReader2;
import org.geotools.referencing.operation.transform.AffineTransform2D;
import org.json.JSONArray;
import org.json.JSONObject;
import org.opengis.referencing.operation.MathTransform;
import org.opengis.referencing.operation.TransformException;
import org.opensphere.geometry.algorithm.ConcaveHull;

/**
 *
 * @author Meine Toonen
 */
@UrlBinding("/action/ontbrandings")
@StrictBinding
public class OntbrandingsActionBean implements ActionBean {

    private static final Log LOG = LogFactory.getLog(OntbrandingsActionBean.class);

    private ActionBeanContext context;
    private WKTReader2 wkt;
    private GeometryFactory gf;

    @Validate
    private String features;

    @DefaultHandler
    public Resolution calculate() throws TransformException {
        JSONObject result = new JSONObject();
        result.put("type", "calculate");
        gf = new GeometryFactory(new PrecisionModel(), 28992);
        wkt = new WKTReader2(gf);

        JSONArray jsonFeatures = new JSONArray(features);
        JSONObject mainLocation = null;
        for (Iterator<Object> iterator = jsonFeatures.iterator(); iterator.hasNext();) {
            JSONObject feature = (JSONObject) iterator.next();
            JSONObject attrs = feature.getJSONObject("attributes");
            if (attrs.getString("type").equals("audienceLocation") && attrs.getBoolean("mainLocation")) {
                mainLocation = feature;
                break;
            }
        }
        
        JSONArray safetyZones = new JSONArray();
        JSONObject referenceLine = calculateReferenceLine(jsonFeatures);
        for (Iterator<Object> iterator = jsonFeatures.iterator(); iterator.hasNext();) {
            JSONObject feature = (JSONObject) iterator.next();
            try {
                JSONArray obs = calculateSafetyZone(feature, mainLocation, referenceLine);
                if (obs != null && obs.length() > 0) {
                    for (Iterator<Object> iterator1 = obs.iterator(); iterator1.hasNext();) {
                        JSONObject g = (JSONObject) iterator1.next();
                        safetyZones.put(g);
                    }
                }
            } catch (ParseException ex) {
                LOG.debug("Error calculating safetyzone: ", ex);
            }
        }

        result.put("safetyZones", safetyZones);
        return new StreamingResolution("application/json", new StringReader(result.toString()));
    }

    private JSONObject calculateReferenceLine(JSONArray features) {
        JSONObject referenceLine = new JSONObject();
        try {
            List<Point> centroids = new ArrayList<>();
            for (Iterator<Object> iterator = features.iterator(); iterator.hasNext();) {
                JSONObject feature = (JSONObject) iterator.next();
                JSONObject attributes = feature.getJSONObject("attributes");
                String type = attributes.getString("type");

                if (type.equals("ignitionLocation")) {
                    Geometry ignition = wkt.read(feature.getString("wktgeom"));
                    centroids.add(ignition.getCentroid());
                }
            }
            GeometryCollection gc = new GeometryCollection(centroids.toArray(new Geometry[0]), gf);
            Point centerCentroid = gc.getCentroid();
            referenceLine.put("x", centerCentroid.getX());
            referenceLine.put("y", centerCentroid.getY());
                    
        } catch (ParseException ex) {
            LOG.error("Cannot parse wkt for reference line", ex);
        }
        return referenceLine;
    }

    private JSONArray calculateSafetyZone(JSONObject feature, JSONObject mainLocation,JSONObject referenceLine) throws ParseException, TransformException {
        JSONObject attributes = feature.getJSONObject("attributes");
        String type = attributes.getString("type");
        JSONArray gs = new JSONArray();
        if (type.equals("ignitionLocation")) {
            boolean fan = false;
            if (attributes.getString("fireworks_type").equals("consumer")) {
                fan = attributes.getBoolean("zonedistance_consumer_fan");
            } else {
                fan = attributes.getBoolean("zonedistance_professional_fan");
            }

            if (fan) {
                calculateFan(feature, mainLocation, gs, referenceLine);
            } else {
                calculateNormalSafetyZone(feature, mainLocation,gs, referenceLine);
            }
        }
        return gs;
    }

    private void calculateFan(JSONObject feature, JSONObject mainLocation, JSONArray gs,JSONObject referenceLine) throws ParseException, TransformException {
        // Bereken centroide van feature: [1]
        // bereken centroide van hoofdlocatie: [2]
        // bereken lijn tussen de twee [1] en [2] centroides: [3]
        // bereken loodlijn op [3]: [4]
        // maak buffer in richting van [4] voor de fanafstand
        //Mogelijke verbetering, nu niet doen :// Voor elk vertex in feature, buffer met fan afstand in beiden richtingen van [4]
        // union alle buffers

        JSONObject attributes = feature.getJSONObject("attributes");
        double fanLength;
        double fanHeight;

        if (attributes.getString("fireworks_type").equals("consumer")) {
            fanLength = attributes.getDouble("zonedistance_consumer_m") * 1.5;
            fanHeight = attributes.getDouble("zonedistance_consumer_m");
        } else {
            fanLength = attributes.getDouble("zonedistance_professional_m") * 1.5;
            fanHeight = attributes.getDouble("zonedistance_professional_m");
        }

        Geometry ignition = wkt.read(feature.getString("wktgeom"));
        Geometry audience = wkt.read(mainLocation.getString("wktgeom"));
        Geometry boundary = ignition.getBoundary();
        LineString boundaryLS = (LineString) boundary;
        LengthIndexedLine lil = new LengthIndexedLine(boundaryLS);

        Point ignitionCentroid = ignition.getCentroid();
        Point audienceCentroid = audience.getCentroid();

        double offset = 0.1;
        int endIndex = (int) lil.getEndIndex();

        Geometry zone = createNormalSafetyZone(feature, ignition, fanHeight);
        Geometry unioned = zone;

        double dx = ignitionCentroid.getX() - audienceCentroid.getX();
        double dy = ignitionCentroid.getY() - audienceCentroid.getY();

        double theta = Math.atan2(dy, dx);
        double correctBearing = (Math.PI / 2);
        double rotation = theta - correctBearing;
        for (double i = 0; i < endIndex; i += offset) {
            Coordinate c = lil.extractPoint(i);
            Geometry fan = createEllipse(c, rotation, fanLength, fanHeight, 220);

            if (!fan.isEmpty()) {
                unioned = unioned.union(fan);
            }
        }

        ConcaveHull con = new ConcaveHull(unioned, fanHeight);
        Geometry g = con.getConcaveHull();
        TopologyPreservingSimplifier tp = new TopologyPreservingSimplifier(g);
        tp.setDistanceTolerance(0.5);
        if(attributes.getBoolean("showcircle")){
            gs.put(createFeature(tp.getResultGeometry(), "safetyZone", ""));
        }

        createSafetyDistances(gs, audience, ignition, g, attributes, referenceLine, true, fanLength, fanHeight);
    }

    private void createSafetyDistances(JSONArray gs, Geometry audience, Geometry ignition, Geometry safetyZone, JSONObject attributes,JSONObject referenceLine, boolean isFan, double fanLength, double fanHeight) throws TransformException {
        ignition = ignition.buffer(0);
        boolean showLength = attributes.getBoolean("lengthdistanceline");
        boolean showLine = attributes.getBoolean("distanceline");
        if(!showLine){
            return;
        }
        // Create safetydistances
        Point audienceCentroid = audience.getCentroid();
        Point ignitionCentroid = ignition.getCentroid();
        LineString audienceIgnitionLine =gf.createLineString(new Coordinate[]{audienceCentroid.getCoordinate(),ignitionCentroid.getCoordinate()});
        Geometry ignitionBoundary = ignition.getBoundary();
        LineString ignitionBounds = (LineString) ignitionBoundary;
        LengthIndexedLine ignitionIndexedLine = new LengthIndexedLine(ignitionBounds);
        
        int factor = 3;
        double dx = (audienceCentroid.getX() -ignitionCentroid.getX()) * factor;
        double dy = (audienceCentroid.getY() - ignitionCentroid.getY()) * factor;

        double epsilon = 0.01;
        Geometry distanceLine = null;
        double offset = 10.0;
        for (int k = 1; k < 5; k++) {
            if(distanceLine != null){
                break;
            }
            offset = offset / 10;
            for (double i = 0; i < ignitionIndexedLine.getEndIndex(); i += offset) {
                Coordinate ignitionTestCoord = ignitionIndexedLine.extractPoint(i);
                double tempY = ignitionTestCoord.y + dy;
                double tempX = ignitionTestCoord.x + dx;
                Coordinate endTestLine = new Coordinate(tempX, tempY);
                LineString ls = gf.createLineString(new Coordinate[]{ignitionTestCoord, endTestLine});
                if (!ignition.crosses(ls)) {
                    Geometry cuttoffTestLine = ls.intersection(safetyZone);
                    double l = cuttoffTestLine.getLength();
                    if ((l + epsilon) >= fanHeight && ((l - epsilon) <= fanHeight)) {
                        distanceLine = cuttoffTestLine;
                        break;
                    }
                }
            }
        }
        if(distanceLine == null){
            distanceLine = audienceIgnitionLine.intersection(safetyZone).difference(ignition);
        }
        double length = distanceLine.getLength() ;
        gs.put(createFeature(distanceLine, "safetyDistance", showLength ? (double) Math.round(length * 10) / 10 + " m" : ""));
        double ratioX = (dx / length);
        double ratioY = (dy / length);
        double fanX = ratioX * -1000;
        double fanY = ratioY * -1000;
        
        double x = referenceLine.getDouble("x");
        double y = referenceLine.getDouble("y");
        Coordinate centerTip = new Coordinate(x, y);
        Coordinate audienceTail = audienceCentroid.getCoordinate();
        Coordinate ignitionTip = ignitionCentroid.getCoordinate();        
        
        // 1. afstand tussen rand afsteekzone en safetyzone: richting publiek
        Point eindLoodlijn = gf.createPoint(new Coordinate(ignitionTip.x + fanX, ignitionTip.y + fanY));
     
        // 2. afstand tussen rand afsteekzone en safetyzone: haaks op lijn uit 1.
        if (isFan) {
            double angle = Angle.angleBetweenOriented(centerTip, audienceTail, ignitionTip);
            double angleRad = Math.toRadians(angle >= 0 ? 90 : -90);
            Geometry foundLoodLijn = null;
            offset = 10.0;
            for (int k = 1; k < 5; k++) {
                if(foundLoodLijn != null){
                    break;
                }
                offset = offset/ 10;
                for (double i = 0; i < ignitionIndexedLine.getEndIndex(); i += offset) {
                    Coordinate ignitionTestCoord = ignitionIndexedLine.extractPoint(i);

                    AffineTransform affineTransform = AffineTransform.getRotateInstance(angleRad, ignitionTestCoord.x, ignitionTestCoord.y);
                    MathTransform mathTransform = new AffineTransform2D(affineTransform);
                    Geometry rotatedPoint = JTS.transform(eindLoodlijn, mathTransform);
                    Coordinate[] loodLijnCoords = {ignitionTestCoord, rotatedPoint.getCoordinate()};
                    LineString loodLijn = gf.createLineString(loodLijnCoords);
                    Geometry cutoffLoodlijn = loodLijn.intersection(safetyZone);
                    cutoffLoodlijn = cutoffLoodlijn.difference(ignition);
                    if (cutoffLoodlijn instanceof MultiLineString) {
                        MultiLineString ms = (MultiLineString) cutoffLoodlijn;
                        for (int j = 0; j < ms.getNumGeometries(); j++) {
                            Geometry g = ms.getGeometryN(j);
                            double l = g.getLength();
                            if ((l + epsilon) >= fanLength && ((l - epsilon) <= fanLength)) {
                                cutoffLoodlijn = g;
                            }
                        }
                    }
                    length = cutoffLoodlijn.getLength();
                    if ((length + epsilon) >= fanLength && ((length - epsilon) <= fanLength)) {
                        foundLoodLijn = cutoffLoodlijn;
                        break;
                    }
                }
            }
            if (foundLoodLijn == null) {
                Coordinate[] endContinuousLine = {ignitionTip, eindLoodlijn.getCoordinate()};
                LineString continuousLine = gf.createLineString(endContinuousLine);
                Geometry cutoffContLine = continuousLine.intersection(safetyZone);
                foundLoodLijn = cutoffContLine.difference(ignition);
                length = foundLoodLijn.getLength();
            }
            gs.put(createFeature(foundLoodLijn, "safetyDistance", showLength ? (double) Math.round(length * 10) / 10 + " m" : ""));
        }
    }

    public Geometry createEllipse(Coordinate startPoint, double rotation, double fanlength, double fanheight, int numPoints) throws TransformException {
        GeometricShapeFactory gsf = new GeometricShapeFactory(gf);
        gsf.setBase(new Coordinate(startPoint.x - fanlength, startPoint.y - fanheight));
        gsf.setWidth(fanlength * 2);
        gsf.setHeight(fanheight * 2);
        gsf.setNumPoints(numPoints);
        gsf.setRotation(rotation);

        Geometry ellipse = gsf.createEllipse();
        return ellipse;
    }

    private void calculateNormalSafetyZone(JSONObject feature, JSONObject audienceObj, JSONArray gs, JSONObject referenceLine) throws ParseException, TransformException {
        Geometry ignition = wkt.read(feature.getString("wktgeom"));
        Geometry audience = wkt.read(audienceObj.getString("wktgeom"));
        JSONObject attributes = feature.getJSONObject("attributes");
        double zoneDistance;

        if (attributes.getString("fireworks_type").equals("consumer")) {
            zoneDistance = attributes.getDouble("zonedistance_consumer_m");
        } else {
            zoneDistance = attributes.getDouble("zonedistance_professional_m");
        }
        Geometry zone = createNormalSafetyZone(feature, ignition, zoneDistance);
        if (attributes.getBoolean("showcircle")) {
            gs.put(createFeature(zone, "safetyZone", ""));
        }
        createSafetyDistances(gs, audience, ignition, zone, attributes, referenceLine, false, zoneDistance, zoneDistance);
    }

    private Geometry createNormalSafetyZone(JSONObject feature, Geometry ignition, double zoneDistance) throws ParseException {
        Geometry zone = ignition.buffer(zoneDistance);
        return zone;
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

    public Resolution print() {
        JSONObject result = new JSONObject();
        result.put("type", "print");
        return new StreamingResolution("application/json", new StringReader(result.toString()));
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
