/*
 * Copyright (C) 2012-2013 B3Partners B.V.
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
package nl.b3p.geotools.data.arcgis;

import org.locationtech.jts.geom.*;
import java.util.Date;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.opengis.geometry.BoundingBox;

/**
 *
 * @author Matthijs Laan
 */
public class ArcGISUtils {
    private static final Log log = LogFactory.getLog(ArcGISUtils.class);
    
    public static Class getBinding(String esriType) {
        if(esriType.equals("esriFieldTypeGeometry")) {
            return Geometry.class;
        } else if(esriType.equals("esriFieldTypeDate")) {
            return Date.class;
        } else if(esriType.equals("esriFieldTypeDouble")) {
            return Double.class;
        } else if(esriType.equals("esriFieldTypeGUID")) {
            return String.class;
        } else if(esriType.equals("esriFieldTypeGlobalID")) {
            return String.class;
        } else if(esriType.equals("esriFieldTypeInteger")) {
            return Integer.class;
        } else if(esriType.equals("esriFieldTypeOID")) {
            return Integer.class;
        } else if(esriType.equals("esriFieldTypeSingle")) {
            return Float.class;
        } else if(esriType.equals("esriFieldTypeSmallInteger")) {
            return Integer.class;
        } else if(esriType.equals("esriFieldTypeString")) {
            return String.class;
        } else {
            return String.class;
        }
    }    
    
    public static Class getGeometryBinding(String esriGeometryType) {
        // These are the only geometry types which have a JSON syntax described 
        // in the API docs.
        if("esriGeometryPolyline".equals(esriGeometryType)) {
            return MultiLineString.class;
        } else if("esriGeometryMultipoint".equals(esriGeometryType)) {
            return MultiPoint.class;
        } else if("esriGeometryPoint".equals(esriGeometryType)) {
            return Point.class;
        } else if("esriGeometryPolygon".equals(esriGeometryType)) {
            return MultiPolygon.class;
        } else {
            log.warn("ArcGIS layer geometryType not supported: \"" + esriGeometryType + "\", using generic Geometry");

            return Geometry.class;
        }        
    }
    
    public static String getGeometryType(Geometry geometry) {
        if(geometry instanceof LineString || geometry instanceof MultiLineString) {
            return "esriGeometryPolyline";
        } else if(geometry instanceof MultiPoint) {
            return "esriGeometryMultipoint";
        } else if(geometry instanceof Point) {
            return "esriGeometryPoint";
        } else if(geometry instanceof Polygon || geometry instanceof MultiPolygon) {
            return "esriGeometryPolygon";
        } else {
            throw new IllegalArgumentException("geometry class not supported: " + geometry.getClass());
        }        
    }
    
    public static Geometry convertToJTSGeometry(JSONObject j, Class binding, GeometryFactory gf) {
        if(binding.equals(Point.class)) {
            Object jx = j.get("x");
            Object jy = j.get("y");
            double x = jx instanceof Long ? ((Long)jx).doubleValue() : (Double)jx;
            double y = jy instanceof Long ? ((Long)jy).doubleValue() : (Double)jy;
            return gf.createPoint(new Coordinate(x,y));
            
        } else if(binding.equals(MultiPoint.class)) {
            Coordinate[] coordinates = JSONtoCoordinates((JSONArray)j.get("points"));
            return gf.createMultiPoint(coordinates);
            
        } else if(binding.equals(MultiLineString.class)) {
            JSONArray paths = (JSONArray)j.get("paths");
            LineString[] lines = new LineString[paths.size()];
            for(int i = 0; i < paths.size(); i++) {
                JSONArray jcoords = (JSONArray)paths.get(i);
                Coordinate[] coordinates = JSONtoCoordinates(jcoords);
                lines[i] = gf.createLineString(coordinates);
            }
            return gf.createMultiLineString(lines);
            
        } else if(binding.equals(MultiPolygon.class)) {
            // XXX no holes
            JSONArray rings = (JSONArray)j.get("rings");
            Polygon[] polygons = new Polygon[rings.size()];
            for(int i = 0; i < rings.size(); i++) {
                JSONArray jcoords = (JSONArray)rings.get(i);
                Coordinate[] coordinates = JSONtoCoordinates(jcoords);
                polygons[i] = gf.createPolygon(gf.createLinearRing(coordinates), null);
            }
            return gf.createMultiPolygon(polygons);
        } else { 
            throw new IllegalArgumentException("Don't know how to convert ArcGIS JSON geometry to JTS class " + binding.getName());
        }
    }
    
    private static Coordinate[] JSONtoCoordinates(JSONArray jcoords) {
        Coordinate[] coordinates = new Coordinate[jcoords.size()];
        for(int i = 0; i < coordinates.length; i++) {
            JSONArray xy = (JSONArray)jcoords.get(i);
            Object jx = xy.get(0);
            Object jy = xy.get(1);
            double x = jx instanceof Long ? ((Long)jx).doubleValue() : (Double)jx;
            double y = jy instanceof Long ? ((Long)jy).doubleValue() : (Double)jy;
            coordinates[i] = new Coordinate(x,y);
        }
        return coordinates;
    }
    
    private static JSONArray coordinatesToJSON(Coordinate[] coordinates) {
        JSONArray jcoords = new JSONArray();
        for(int i = 0; i < coordinates.length; i++) {
            JSONArray xy = new JSONArray();
            xy.add(coordinates[i].x);
            xy.add(coordinates[i].y);
            jcoords.add(xy);
        }
        return jcoords;        
    }
    
    public static JSONObject convertToArcJSONEnvelope(BoundingBox bbox) {
        JSONObject j = new JSONObject();
        j.put("xmin", bbox.getMinX());
        j.put("ymin", bbox.getMinY());
        j.put("xmax", bbox.getMaxX());
        j.put("ymax", bbox.getMaxY());
        return j;
    }
    
    public static JSONObject convertToArcJSONEnvelope(Polygon bbox) {
        Coordinate c1 = bbox.getExteriorRing().getCoordinateN(0);
        Coordinate c2 = bbox.getExteriorRing().getCoordinateN(2);
        JSONObject j = new JSONObject();
        j.put("xmin", c1.x);
        j.put("ymin", c1.y);
        j.put("xmax", c2.x);
        j.put("ymax", c2.y);
        return j;        
    }    
    
    public static JSONObject convertToArcJSONGeometry(Geometry g) {
        JSONObject j = new JSONObject();
        if(g instanceof Point) {
            j.put("x", g.getCoordinate().x);
            j.put("y", g.getCoordinate().y);
            
        } else if(g instanceof MultiPoint) {
            j.put("points", coordinatesToJSON(g.getCoordinates()));
            
        } else if(g instanceof LineString) {
            JSONArray paths = new JSONArray();
            paths.add(coordinatesToJSON(g.getCoordinates()));
            j.put("paths", paths);
            
        } else if(g instanceof MultiLineString) {
            JSONArray paths = new JSONArray();
            for(int i = 0; i < g.getNumGeometries(); i++) {
                LineString ls = (LineString)g.getGeometryN(i);
                paths.add(coordinatesToJSON(ls.getCoordinates()));
            }
            j.put("paths", paths);
            
        } else if(g instanceof Polygon) {
            JSONArray rings = new JSONArray();
            rings.add(coordinatesToJSON(g.getCoordinates()));
            j.put("rings", rings);
            
        } else if(g instanceof MultiPolygon) {
            JSONArray rings = new JSONArray();
            for(int i = 0; i < g.getNumGeometries(); i++) {
                Polygon p = (Polygon)g.getGeometryN(i);
                // XXX ignore holes
                rings.add(p.getExteriorRing().getCoordinates());
            }
            j.put("rings", rings);
        } else {
            return null;
        }
        return j;
    }
}
