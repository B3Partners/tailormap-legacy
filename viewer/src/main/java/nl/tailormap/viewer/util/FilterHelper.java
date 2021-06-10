package nl.tailormap.viewer.util;

import nl.tailormap.viewer.config.services.AttributeDescriptor;
import nl.tailormap.viewer.config.services.FeatureTypeRelation;
import nl.tailormap.viewer.config.services.FeatureTypeRelationKey;
import nl.tailormap.viewer.config.services.SimpleFeatureType;
import org.geotools.data.Query;
import org.geotools.factory.CommonFactoryFinder;
import org.geotools.filter.visitor.SimplifyingFilterVisitor;
import org.geotools.util.factory.GeoTools;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.filter.Filter;
import org.opengis.filter.FilterFactory2;
import org.opengis.filter.sort.SortBy;
import org.opengis.filter.sort.SortOrder;

import java.util.ArrayList;
import java.util.List;

public class FilterHelper {
    private static FilterFactory2 ff2 = CommonFactoryFinder.getFilterFactory2(GeoTools.getDefaultHints());
    /**
     *
     * Optimze and reformat filter. Delegates to
     * {@link #reformatFilter(org.opengis.filter.Filter, SimpleFeatureType, boolean)}
     * with the {@code includeRelations} set to {@code true}.
     *
     * @param filter the filter to process
     * @param ft featuretype to apply filter
     * @return reformatted / optimised filter
     * @throws Exception if any
     * @see #reformatFilter(org.opengis.filter.Filter,
     * SimpleFeatureType, boolean)
     */
    public static Filter reformatFilter(Filter filter, SimpleFeatureType ft) throws Exception {
        return reformatFilter(filter, ft, true);
    }

    /**
     * Optimze and reformat filter.
     *
     * @param filter the filter to process
     * @param ft featuretype to apply filter
     * @param includeRelations whether to include related (joined) data
     * @return reformatted / optimised filter
     * @throws Exception if any
     */
    public static Filter reformatFilter(Filter filter, SimpleFeatureType ft, boolean includeRelations) throws Exception {
        if (Filter.INCLUDE.equals(filter) || Filter.EXCLUDE.equals(filter)) {
            return filter;
        }
        if (includeRelations) {
            for (FeatureTypeRelation rel : ft.getRelations()) {
                if (FeatureTypeRelation.JOIN.equals(rel.getType())) {
                    filter = reformatFilter(filter, rel.getForeignFeatureType(), includeRelations);
                    filter = (Filter) filter.accept(new ValidFilterExtractor(rel), filter);
                }
            }
        }
        filter = (Filter) filter.accept(new SimplifyingFilterVisitor(), null);
        return filter;
    }

    static Filter createFilter(SimpleFeature feature, FeatureTypeRelation rel) {
        List<Filter> filters = new ArrayList<Filter>();
        for (FeatureTypeRelationKey key : rel.getRelationKeys()){
            AttributeDescriptor rightSide = key.getRightSide();
            AttributeDescriptor leftSide = key.getLeftSide();
            Object value= feature.getAttribute(leftSide.getName());
            if (value==null){
                continue;
            }
            if (AttributeDescriptor.GEOMETRY_TYPES.contains(rightSide.getType()) &&
                    AttributeDescriptor.GEOMETRY_TYPES.contains(leftSide.getType())){
                filters.add(ff2.not(ff2.isNull(ff2.property(rightSide.getName()))));
                filters.add(ff2.intersects(ff2.property(rightSide.getName()),ff2.literal(value)));
            }else{
                filters.add(ff2.equals(ff2.property(rightSide.getName()),ff2.literal(value)));
            }
        }
        if (filters.size()>1){
            return ff2.and(filters);
        }else if (filters.size()==1){
            return filters.get(0);
        }else{
            return null;
        }
    }

    /**
     * Set sort on query
     * @param q the query on which the sort is added
     * @param sort the name of the sort column
     * @param dir sorting direction DESC or ASC
     */
    public static void setSortBy(Query q, String sort, String dir){

        if(sort != null) {
            q.setSortBy(new SortBy[] {
                ff2.sort(sort, "DESC".equals(dir) ? SortOrder.DESCENDING : SortOrder.ASCENDING)
            });
        }

    }
}
