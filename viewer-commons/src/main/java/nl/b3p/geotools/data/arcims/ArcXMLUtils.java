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
package nl.b3p.geotools.data.arcims;

import com.vividsolutions.jts.geom.*;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.StringTokenizer;
import nl.b3p.geotools.data.arcims.axl.*;
import org.opengis.geometry.BoundingBox;

/**
 *
 * @author Matthijs Laan
 */
public class ArcXMLUtils {

    public static Geometry convertToJTSGeometry(AxlGeometry axlg, GeometryFactory gf) throws IOException {
        
        if(axlg instanceof AxlMultiPoint) {
            return gf.createMultiPoint(parseAxlCoords(((AxlMultiPoint)axlg).getCoords()));
        } else if(axlg instanceof AxlPolyline) {
            List<LineString> lines = new ArrayList<LineString>();
            
            for(AxlCoords axlc: ((AxlPolyline)axlg).getPaths()) {
                Coordinate[] coords = parseAxlCoords(axlc.getCoords());
                lines.add(gf.createLineString(coords));
            }
            return gf.createMultiLineString(lines.toArray(new LineString[] {}));
        } else if(axlg instanceof AxlPolygon) {
            List<Polygon> polygons = new ArrayList<Polygon>();
            
            for(AxlRing axlr: ((AxlPolygon)axlg).getRings()) {
                LinearRing shell = gf.createLinearRing(parseAxlCoords(axlr.getCoords()));
                List<LinearRing> holes = null;
                if(axlr.getHoles() != null) {
                    holes = new ArrayList<LinearRing>();
                    for(AxlCoords hole: axlr.getHoles()) {
                        holes.add(gf.createLinearRing(parseAxlCoords(hole.getCoords())));
                    }
                }
                polygons.add(gf.createPolygon(shell, holes == null ? null : holes.toArray(new LinearRing[] {})));
            }
            return gf.createMultiPolygon(polygons.toArray(new Polygon[] {}));            
        }
        return null;
    }

    public static Coordinate[] parseAxlCoords(String coords) throws IOException {
        List<Coordinate> c = new ArrayList<Coordinate>();
        
        StringTokenizer tok = new StringTokenizer(coords, " ;");
        
        while(tok.hasMoreTokens()) {
            String sx = tok.nextToken();
            if(!tok.hasMoreTokens()) {
                break;
            }
            String sy = tok.nextToken();
            
            sx = sx.replace(',', '.');
            sy = sy.replace(',', '.');
            
            try {
                Coordinate coordinate = new Coordinate(Double.parseDouble(sx), Double.parseDouble(sy));
                c.add(coordinate);
            } catch(NumberFormatException nfe) {
                throw new IOException("Cannot parse ArcXML coordinate (" + sx + "," + sy +")", nfe);
            }            
        }
        
        return c.toArray(new Coordinate[] {});
    }
    
    public static String toAxlCoords(Coordinate[] coords) {
        StringBuilder sb = new StringBuilder();
        
        boolean first = true;
        for(Coordinate c: coords) {
            if(first) {
                first = false;
            } else {
                sb.append(";");
            }
            sb.append(c.x);
            sb.append(" ");
            sb.append(c.y);
        }
        return sb.toString();
    }
    
    public static AxlEnvelope convertToAxlEnvelope(BoundingBox bbox) {
        AxlEnvelope e = new AxlEnvelope();
        e.setMinx(bbox.getMinX() + "");
        e.setMaxx(bbox.getMaxX() + "");
        e.setMiny(bbox.getMinY() + "");
        e.setMaxy(bbox.getMaxY() + "");
        return e;        
    }
    
    public static AxlEnvelope convertToAxlEnvelope(Polygon bbox) {
        Coordinate c1 = bbox.getExteriorRing().getCoordinateN(0);
        Coordinate c2 = bbox.getExteriorRing().getCoordinateN(2);
        AxlEnvelope e = new AxlEnvelope();
        e.setMinx(c1.x + "");
        e.setMaxx(c2.x + "");
        e.setMiny(c1.y + "");
        e.setMaxy(c2.y + "");
        return e;        
    }
        
    public static AxlGeometry convertToAxlGeometry(Geometry g) {
        if(g instanceof Point || g instanceof MultiPoint) {
            AxlMultiPoint ag = new AxlMultiPoint();
            ag.setCoords(toAxlCoords(g.getCoordinates()));
            return ag;
        } else if(g instanceof LineString || g instanceof MultiLineString) {
            AxlPolyline ag = new AxlPolyline();
            ag.setPaths(new ArrayList<AxlCoords>());
            
            if(g instanceof LineString) {
                ag.getPaths().add(new AxlCoords(toAxlCoords(g.getCoordinates())));
            } else {
                for(int i = 0; i < g.getNumGeometries(); i++) {
                    LineString ls = (LineString)g.getGeometryN(i);
                    ag.getPaths().add(new AxlCoords(toAxlCoords(ls.getCoordinates())));
                }
            }
            return ag;
        } else if(g instanceof Polygon || g instanceof MultiPolygon) {
            AxlPolygon ag = new AxlPolygon();
            ag.setRings(new ArrayList<AxlRing>());
            
            if(g instanceof Polygon) {
                ag.getRings().add(polygonToAxlRing((Polygon)g));
            } else {
                for(int i = 0; i < g.getNumGeometries(); i++) {
                    Polygon p = (Polygon)g.getGeometryN(i);
                    ag.getRings().add(polygonToAxlRing(p));
                }
            }
            return ag;
        }
        return null;
    }
    
    public static AxlRing polygonToAxlRing(Polygon p) {
        AxlRing r = new AxlRing();
        r.setCoords(toAxlCoords(p.getExteriorRing().getCoordinates()));
        
        if(p.getNumInteriorRing() > 0) {
            r.setHoles(new ArrayList<AxlCoords>());
            for(int i = 0; i < p.getNumInteriorRing(); i++) {
                LineString hole = p.getInteriorRingN(i);
                r.getHoles().add(new AxlCoords(toAxlCoords(hole.getCoordinates())));
            }
        }
        return r;
    }
}
