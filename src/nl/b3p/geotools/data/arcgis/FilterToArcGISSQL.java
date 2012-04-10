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
package nl.b3p.geotools.data.arcgis;

import com.vividsolutions.jts.geom.Geometry;
import java.io.IOException;
import java.io.Writer;
import java.util.HashMap;
import java.util.Map;
import nl.b3p.geotools.data.arcims.FilterToArcXMLSQL;
import org.geotools.data.jdbc.FilterToSQL;
import org.geotools.filter.FilterCapabilities;
import org.opengis.filter.BinaryLogicOperator;
import org.opengis.filter.Id;
import org.opengis.filter.PropertyIsBetween;
import org.opengis.filter.PropertyIsLike;
import org.opengis.filter.expression.Expression;
import org.opengis.filter.expression.Literal;
import org.opengis.filter.expression.PropertyName;
import org.opengis.filter.spatial.BBOX;
import org.opengis.filter.spatial.BinarySpatialOperator;
import org.opengis.filter.spatial.DWithin;
import org.opengis.filter.spatial.Intersects;

/**
 * Convert a Filter to a where statement and separate spatial operator. See 
 * {@link FilterToArcXMLSQL}.
 * 
 * @author Matthijs Laan
 */
public class FilterToArcGISSQL extends FilterToSQL {
    protected Map spatialParams = new HashMap();
    
    boolean spatialOperatorAllowed = true;
    
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

        caps.addType(PropertyIsBetween.class);
        caps.addType(PropertyIsLike.class);
        
        caps.addType(Id.class);
        
        caps.addType(BBOX.class);
        caps.addType(Intersects.class);
        
        // TODO: support by buffering geometry...
        caps.addType(DWithin.class);
        
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
        
        
        // TODO set spatial params
        /*if(filter instanceof BBOX) {
            axlFilter.setGeometryOrEnvelope(ArcXMLUtils.convertToAxlEnvelope((Polygon)geom));
            axlFilter.setRelation(AxlSpatialFilter.RELATION_ENVELOPE_INTERSECTION);
        } else if(filter instanceof Intersects) {
            
            axlFilter.setGeometryOrEnvelope(ArcXMLUtils.convertToAxlGeometry(geom));
            axlFilter.setRelation(AxlSpatialFilter.RELATION_AREA_INTERSECTION);

        } else if(filter instanceof DWithin) {
            
            axlFilter.setGeometryOrEnvelope(ArcXMLUtils.convertToAxlGeometry(geom));
            axlFilter.setRelation(AxlSpatialFilter.RELATION_AREA_INTERSECTION);
            
            axlFilter.setBuffer(new AxlBuffer(((DWithin)filter).getDistance()));
        }*/
        try {
            out.write("1=1");
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
