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

import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.Polygon;
import java.io.IOException;
import java.io.Writer;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import org.geotools.data.jdbc.FilterToSQL;
import org.geotools.filter.FilterCapabilities;
import org.geotools.filter.IsNullImpl;
import org.opengis.filter.BinaryLogicOperator;
import org.opengis.filter.Id;
import org.opengis.filter.PropertyIsBetween;
import org.opengis.filter.PropertyIsLike;
import org.opengis.filter.expression.Expression;
import org.opengis.filter.expression.Literal;
import org.opengis.filter.expression.PropertyName;
import org.opengis.filter.spatial.*;

/**
 * Convert a Filter to a where statement and separate spatial operator.
 * 
 * @author Matthijs Laan
 */
public class FilterToArcGISSQL extends FilterToSQL {
    protected Map spatialParams = new HashMap();
    
    boolean spatialOperatorAllowed = true;
    
    private static final Map<Class, String> spatialOperators;
    
    static {
        Map<Class,String> sops = new HashMap<Class, String>();        
        sops.put(Intersects.class, "esriSpatialRelIntersects");
        sops.put(Contains.class, "esriSpatialRelContains");
        sops.put(BBOX.class, "esriSpatialRelEnvelopeIntersects");
        sops.put(Overlaps.class, "esriSpatialRelOverlaps");
        sops.put(Touches.class, "esriSpatialRelTouches");
        sops.put(Within.class, "esriSpatialRelWithin");
        
        // Not natively supported by ArcGIS, use intersect with buffered geometry
        sops.put(DWithin.class, "esriSpatialRelIntersects");
        
        spatialOperators = Collections.unmodifiableMap(sops);
    }
    
    public FilterToArcGISSQL() {
        this(null);
    }
    
    public FilterToArcGISSQL(Writer w) {
        super(w);
        setInline(true);
    }
    
    public Map getSpatialParams() {
        return spatialParams;
    }
    
    @Override
    protected FilterCapabilities createFilterCapabilities() {
        FilterCapabilities caps = new FilterCapabilities();

        caps.addAll(FilterCapabilities.LOGICAL_OPENGIS);
        caps.addAll(FilterCapabilities.SIMPLE_COMPARISONS_OPENGIS);

        caps.addType(IsNullImpl.class);
        
        caps.addType(PropertyIsBetween.class);
        caps.addType(PropertyIsLike.class);
        
        // XXX does this work?
        caps.addType(Id.class);
        
        for(Class clazz: spatialOperators.keySet()) {
            caps.addType(clazz);
        }
        
        caps.addType(FilterCapabilities.SIMPLE_ARITHMETIC);

        return caps;
    }
        
    @Override
    protected Object visit(BinaryLogicOperator filter, Object extraData) {
        String op = (String)extraData;
        
        boolean saveSpatialOpAllowed = spatialOperatorAllowed;
        
        // A spatial operator can only be used if it is combined with attribute
        // queries in a boolean AND
        
        if("OR".equals(op)) {
            spatialOperatorAllowed = false;
        } 
        Object r = super.visit(filter, extraData);
        
        spatialOperatorAllowed = saveSpatialOpAllowed;
        return r;
    }
    
    @Override
    protected Object visitBinarySpatialOperator(BinarySpatialOperator filter,
            PropertyName property, Literal geometry, boolean swapped,
            Object extraData) {
        if(!spatialParams.isEmpty()) {
            // Filter could be pre-processed with ArcSdeSimplifyingFilterVisitor
            // So that INTERSECTS(the_geom, g1) OR INTERSECTS(the_geom, g2) can be merged
            // into INTERSECTS(the_geom, UNION(g1,g2))
            throw new RuntimeException("Only a single spatial operator is supported");
        }
        
        if(!spatialOperatorAllowed) {
            throw new RuntimeException("Spatial operator not allowed in this position in filter");
        }

        if(featureType != null && property.getPropertyName() != null) {
            if(!featureType.getGeometryDescriptor().getLocalName().equals(property.getPropertyName())) {
                throw new RuntimeException("Spatial operator only supported on default geometry property");
            }
        }
        
        Geometry geom = (Geometry)geometry.getValue();

        for(Map.Entry<Class,String> spatialOp: spatialOperators.entrySet()) {
            if(spatialOp.getKey().isAssignableFrom(filter.getClass())) {
                spatialParams.put("spatialRel", spatialOp.getValue());
                break;
            }
        }

        spatialParams.put("geometryType", ArcGISUtils.getGeometryType(geom));
        
        if(filter instanceof BBOX) {
            spatialParams.put("geometry", ArcGISUtils.convertToArcJSONEnvelope((Polygon)geom).toJSONString());
        } else if (filter instanceof DWithin) {
            Geometry buffered = geom.buffer(((DWithin)filter).getDistance());
            spatialParams.put("geometryType", ArcGISUtils.getGeometryType(buffered));
            spatialParams.put("geometry", ArcGISUtils.convertToArcJSONGeometry(buffered).toJSONString());
        } else {
            spatialParams.put("geometry", ArcGISUtils.convertToArcJSONGeometry(geom).toJSONString());
        }
        
            
        try {
            out.write("1 = 1");
        } catch (IOException ex) {
            throw new RuntimeException(IO_ERROR, ex);
        }
        
        return null;
    }
    
    @Override
    protected Object visitBinarySpatialOperator(BinarySpatialOperator filter, Expression e1, 
        Expression e2, Object extraData) {
        throw new RuntimeException(
            "ArcXML spatial operators only supported for default geometry and a literal operand");
    }        
}
