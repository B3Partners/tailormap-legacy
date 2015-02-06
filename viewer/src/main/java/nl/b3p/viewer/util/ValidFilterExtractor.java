/*
 * Copyright (C) 2013 B3Partners B.V.
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
package nl.b3p.viewer.util;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import nl.b3p.viewer.config.services.AttributeDescriptor;
import nl.b3p.viewer.config.services.FeatureTypeRelation;
import nl.b3p.viewer.config.services.FeatureTypeRelationKey;
import nl.b3p.viewer.config.services.SimpleFeatureType;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.FeatureSource;
import org.geotools.data.Query;
import org.geotools.factory.CommonFactoryFinder;
import org.geotools.feature.FeatureCollection;
import org.geotools.feature.FeatureIterator;
import org.geotools.filter.visitor.DuplicatingFilterVisitor;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.filter.BinaryComparisonOperator;
import org.opengis.filter.Filter;
import org.opengis.filter.FilterFactory2;
import org.opengis.filter.PropertyIsBetween;
import org.opengis.filter.PropertyIsEqualTo;
import org.opengis.filter.PropertyIsGreaterThan;
import org.opengis.filter.PropertyIsGreaterThanOrEqualTo;
import org.opengis.filter.PropertyIsLessThan;
import org.opengis.filter.PropertyIsLessThanOrEqualTo;
import org.opengis.filter.PropertyIsLike;
import org.opengis.filter.PropertyIsNotEqualTo;
import org.opengis.filter.expression.Expression;
import org.opengis.filter.expression.PropertyName;

/**
 * Class makes the filter valid according the given relation.
 * The parts of the filter that corresponds to the relation are replaced with a filter  
 * with the result of the subquery.
 * @author Roy Braam
 */
public class ValidFilterExtractor extends DuplicatingFilterVisitor {

    private static final Log log = LogFactory.getLog(ValidFilterExtractor.class);
    private FeatureTypeRelation relation;

    public ValidFilterExtractor(FeatureTypeRelation relation) {
        this.relation = relation;
    }
   
    @Override
    public Object visit( PropertyIsBetween filter, Object data ) {
        List<Expression> expressions = new ArrayList<Expression>();
        expressions.add(filter.getExpression());
        expressions.add(filter.getLowerBoundary());
        expressions.add(filter.getUpperBoundary());
        Filter f = visit(expressions,filter,data);
        if (f==null){
            return super.visit(filter, data);
        }
        return f;
    }

    @Override
    public Object visit( PropertyIsEqualTo filter, Object data ) {        
        Filter f = visitAbstract(filter,data);
        if (f==null){
            return super.visit(filter, data);
        }
        return f;
    }

    @Override
    public Object visit( PropertyIsNotEqualTo filter, Object data ) {
        Filter f = visitAbstract(filter,data);
        if (f==null){
            return super.visit(filter, data);
        }
        return f;
    }

    @Override
    public Object visit( PropertyIsGreaterThan filter, Object data ) {
        Filter f = visitAbstract(filter,data);
        if (f==null){
            return super.visit(filter, data);
        }
        return f;
    }

    @Override
    public Object visit( PropertyIsGreaterThanOrEqualTo filter, Object data ) {
        Filter f = visitAbstract(filter,data);
        if (f==null){
            return super.visit(filter, data);
        }
        return f;
    }

    @Override
    public Object visit( PropertyIsLessThan filter, Object data ) {
        Filter f = visitAbstract(filter,data);
        if (f==null){
            return super.visit(filter, data);
        }
        return f;
    }

    @Override
    public Object visit( PropertyIsLessThanOrEqualTo filter, Object data ) {
        Filter f = visitAbstract(filter,data);
        if (f==null){
            return super.visit(filter, data);
        }
        return f;
    }

    @Override
    public Object visit( PropertyIsLike filter, Object data ) {
        List<Expression> expressions = new ArrayList<Expression>();
        expressions.add(filter.getExpression());
        Filter f = visit(expressions,filter,data);
        if (f==null){
            return super.visit(filter, data);
        }
        return f;
    }
    
    private Filter visitAbstract(BinaryComparisonOperator bco, Object o) {
        List<Expression> expressions = new ArrayList<Expression>();
        expressions.add(bco.getExpression1());
        expressions.add(bco.getExpression2());        
        return visit(expressions,bco, o);
    }
    
    private Filter visit(List<Expression> expressions, Filter f,Object o) {
        List<String> propertyNames = new ArrayList<String>();
        for (Expression exp : expressions){
            if (exp instanceof PropertyName) {
                propertyNames.add(((PropertyName) exp).getPropertyName());
            }
        }
        if (propertyNames.isEmpty()) {
            return null;
        }
        return doVisit(propertyNames, f, o);
    }
    /**
     * Do the real thing.
     * @param names List of names of the properties in the filter.
     * @param filter the filter
     * @param o
     * @return the new Filter.
     */    
    private Filter doVisit(List<String> names, Filter filter,Object o){        
        boolean found = false;
        SimpleFeatureType featureType = relation.getForeignFeatureType();
        for (AttributeDescriptor ad : featureType.getAttributes()) {
            for (String propertyName : names){
                if (propertyName.equals(ad.getName())) {
                    found = true;
                    break;
                }
            }
            if (found){
                break;
            }
        }

        if (found) {
            try {
                FilterFactory2 ff = CommonFactoryFinder.getFilterFactory2();
                FeatureSource fs = featureType.openGeoToolsFeatureSource();
                Query q = new Query(fs.getName().toString());
                q.setFilter(filter);

                HashMap<String, ArrayList<Filter>> orFilters = new HashMap<String, ArrayList<Filter>>();
                //get propertynames needed.
                List<String> propertyNames = new ArrayList<String>();
                for (FeatureTypeRelationKey key : relation.getRelationKeys()) {
                    propertyNames.add(key.getRightSide().getName());
                    orFilters.put(key.getRightSide().getName(), new ArrayList<Filter>());
                }
                q.setPropertyNames(propertyNames);

                FeatureCollection fc = fs.getFeatures(q);
                FeatureIterator<SimpleFeature> it = null;
                try {
                    it = fc.features();
                    //walk the features, get the rightside values and create a list of filters (or)
                    while (it.hasNext()) {
                        SimpleFeature feature = it.next();
                        for (FeatureTypeRelationKey key : relation.getRelationKeys()) {
                            Object value = feature.getAttribute(key.getRightSide().getName());
                            if (value == null) {
                                continue;
                            }
                            Filter fil;
                            if (AttributeDescriptor.GEOMETRY_TYPES.contains(key.getRightSide().getType())
                                    && AttributeDescriptor.GEOMETRY_TYPES.contains(key.getLeftSide().getType())) {
                                fil = ff.and(ff.not(ff.isNull(ff.property(key.getLeftSide().getName()))),
                                        ff.intersects(ff.property(key.getLeftSide().getName()), ff.literal(value)));
                            } else {
                                fil = ff.equals(ff.property(key.getLeftSide().getName()), ff.literal(value));
                            }
                            orFilters.get(key.getRightSide().getName()).add(fil);
                        }
                    }
                } finally {
                    if (it != null) {
                        it.close();
                    }
                    fs.getDataStore().dispose();
                }
                //make or filters and add them to a list of and filters.
                List<Filter> andFilters = new ArrayList<Filter>();
                for (FeatureTypeRelationKey key : relation.getRelationKeys()) {
                    ArrayList<Filter> filters = orFilters.get(key.getRightSide().getName());
                    if (filters==null){
                        continue;
                    }
                    if (filters.size() == 1) {
                        andFilters.add(filters.get(0));
                    } else if (filters.size() > 1) {
                        andFilters.add(ff.or(filters));
                    }
                }
                if (andFilters.isEmpty()){
                    return Filter.EXCLUDE;
                }
                if (andFilters.size() == 1) {
                    return andFilters.get(0);
                } else {
                    return ff.and(andFilters);
                }
            } catch (Exception e) {
                log.error("Error while creating query: ",e);
                return null;
            }
        } else {
            return null;
        }
    }
}
