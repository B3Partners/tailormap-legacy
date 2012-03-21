/*
 * Copyright (C) 2012 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package nl.b3p.geotools.data.arcims;

import com.vividsolutions.jts.geom.*;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.StringTokenizer;
import nl.b3p.geotools.data.arcims.axl.*;

/**
 *
 * @author Matthijs Laan
 */
public class ArcXMLUtils {

    public static Geometry convertGeometry(AxlGeometry axlg, GeometryFactory gf) throws IOException {
        
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
}
