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

import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.Polygon;
import java.io.IOException;
import java.io.Writer;
import nl.b3p.geotools.data.arcims.axl.AxlBuffer;
import nl.b3p.geotools.data.arcims.axl.AxlSpatialFilter;
import nl.b3p.geotools.data.arcims.axl.AxlSpatialQuery;
import org.geotools.data.jdbc.FilterToSQL;
import org.geotools.filter.FilterCapabilities;
import org.geotools.filter.IsNullImpl;
import org.opengis.filter.*;
import org.opengis.filter.expression.Expression;
import org.opengis.filter.expression.Literal;
import org.opengis.filter.expression.PropertyName;
import org.opengis.filter.spatial.*;

/**
 *
 * @author Matthijs Laan
 */
public class FilterToArcXMLSQL extends FilterToSQL {
    
    protected AxlSpatialQuery axlQuery;
    
    boolean spatialOperatorAllowed = true;
    
    public FilterToArcXMLSQL(AxlSpatialQuery query) {
        this(null, query);
    }
    
    public FilterToArcXMLSQL(Writer w, AxlSpatialQuery axlQuery) {
        super(w);
        this.axlQuery = axlQuery;
        setInline(true);
    }
    
    @Override
    protected FilterCapabilities createFilterCapabilities() {
        FilterCapabilities caps = new FilterCapabilities();

        caps.addAll(FilterCapabilities.LOGICAL_OPENGIS);
        caps.addAll(FilterCapabilities.SIMPLE_COMPARISONS_OPENGIS);

        caps.addType(IsNullImpl.class);
        
        caps.addType(PropertyIsBetween.class);
        caps.addType(PropertyIsLike.class);
        
        caps.addType(Id.class);
        
        caps.addType(BBOX.class);
        caps.addType(Intersects.class);
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
        if(axlQuery.getSpatialFilter() != null) {
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
        
        AxlSpatialFilter axlFilter = new AxlSpatialFilter();
        axlQuery.setSpatialFilter(axlFilter);
        
        if(filter instanceof BBOX) {
            axlFilter.setGeometryOrEnvelope(ArcXMLUtils.convertToAxlEnvelope((Polygon)geom));
            axlFilter.setRelation(AxlSpatialFilter.RELATION_ENVELOPE_INTERSECTION);
        } else if(filter instanceof Intersects) {
            
            axlFilter.setGeometryOrEnvelope(ArcXMLUtils.convertToAxlGeometry(geom));
            axlFilter.setRelation(AxlSpatialFilter.RELATION_AREA_INTERSECTION);

        } else if(filter instanceof DWithin) {
            
            axlFilter.setGeometryOrEnvelope(ArcXMLUtils.convertToAxlGeometry(geom));
            axlFilter.setRelation(AxlSpatialFilter.RELATION_AREA_INTERSECTION);
            
            axlFilter.setBuffer(new AxlBuffer(((DWithin)filter).getDistance()));
        }
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
