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
package nl.b3p.viewer.util;

import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.GeometryCollection;
import com.vividsolutions.jts.geom.GeometryFactory;
import com.vividsolutions.jts.geom.MultiPolygon;
import com.vividsolutions.jts.geom.PrecisionModel;
import com.vividsolutions.jts.io.WKTReader;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.persistence.EntityManager;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.services.GeoService;
import nl.b3p.viewer.config.services.Layer;
import nl.b3p.viewer.image.CombineImageWkt;
import static nl.b3p.viewer.util.FeatureToJson.MAX_FEATURES;
import org.geotools.data.FeatureSource;
import org.geotools.data.Query;
import org.geotools.factory.CommonFactoryFinder;
import org.geotools.feature.FeatureIterator;
import org.geotools.filter.text.cql2.CQLException;
import org.geotools.filter.text.ecql.ECQL;
import org.geotools.geometry.jts.WKTReader2;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.filter.Filter;
import org.opengis.filter.FilterFactory2;

/**
 *
 * @author Meine Toonen
 */
public class FlamingoCQL {
    
    private final String BEGIN_PART = "APPLAYER(";
    
    public Filter toFilter(String filter, EntityManager em ) throws CQLException{
        filter = processFilter(filter, em);
        
        return ECQL.toFilter(filter);
    }
    
    public String processFilter(String filter, EntityManager em ) throws CQLException {
        if(filter.contains(BEGIN_PART)){
            filter = replaceApplayerFilter(filter, em);
        }
        return filter;
    }
    
    protected String replaceApplayerFilter(String filter, EntityManager em ) throws CQLException {
        
        //String input = "APPLAYER(the_geom, 1,'')";
        // zoek index op van APPLAYER(
        // ga naar rechts in de string tot einde string of foundOpenBrackets == foundClosingBrackets
            // tel alle openhaakjes op
            // zoek alle sluithaakjes
        int startIndex = filter.indexOf(BEGIN_PART) + BEGIN_PART.length();
        int closingBrackets = 0;
        int openBrackets = 1;
        int endIndex = 0;
        
        for(int i = startIndex ; i < filter.length();i++){
            char c = filter.charAt(i);
            if(c == '('){
                openBrackets++;
            }
            if(c == ')'){
                closingBrackets++;
            }
            if(openBrackets == closingBrackets){
                endIndex = i;
                break;
            }
        }
        String appLayerPart = filter.substring(startIndex,endIndex);
        // call recursively to parse out all the applayer filters
        //appLayerPart = processFilter(appLayerPart);
        String f = rewriteAppLayerFilter(appLayerPart, em);
        return f;
    }
    
    protected String rewriteAppLayerFilter(String applayerfilter, EntityManager em ) throws CQLException{
        
        //String input = "the_geom, 6,''";
        int firstIndex = applayerfilter.indexOf(", ");
        int secondIndex = applayerfilter.indexOf(",", firstIndex +1);
        String attribute=  applayerfilter.substring(0, firstIndex);
        String appLayerId = applayerfilter.substring(firstIndex + 1, secondIndex);
        appLayerId = appLayerId.trim();
        Long id = Long.parseLong(appLayerId);
        
        String filter = applayerfilter.substring(secondIndex + 1);
        String geom =getUnionedFeatures(filter, id, em);
        //String geom = "MULTIPOLYGON(((150218.522352941 432398.543058824,142036.882823529 432504.798117647,142355.648 437923.806117647,150218.522352941 432398.543058824)),((156487.570823529 452161.984,156912.591058823 442917.793882353,191870.505411764 441111.457882353,191870.505411764 454712.105411765,191870.505411764 454712.105411765,156487.570823529 452161.984)),((137467.915294117 453543.299764706,137680.425411764 443130.304,144693.259294117 443874.089411765,145437.044705882 451418.198588236,145437.044705882 451418.198588236,137467.915294117 453543.299764706)))";// getUnionedFeatures(filter, id, em);
        String nieuwFilter = "intersects (" + attribute + ", " + geom + ")";
        return nieuwFilter;
    }
    
    private String getUnionedFeatures(String filter, Long appLayerId, EntityManager em ) throws CQLException {
        try {
            ApplicationLayer al = em.find(ApplicationLayer.class, appLayerId);
            
            GeoService gs = al.getService();
            Layer l = gs.getLayer(al.getLayerName(), em);
            
            if (l.getFeatureType() == null) {
                // throw new Exception("Layer has no feature type");
            }
            
            FeatureSource fs = l.getFeatureType().openGeoToolsFeatureSource();
            
            GeometryFactory gf = new GeometryFactory(new PrecisionModel(), 28992);
            
            Query q = new Query(fs.getName().toString());
            if(filter != null){
                Filter attributeFilter = ECQL.toFilter(filter);
                attributeFilter = (Filter)attributeFilter.accept(new ChangeMatchCase(false), null);
                
                q.setFilter(attributeFilter);
            }
            
            q.setMaxFeatures(MAX_FEATURES);
            
            FeatureIterator<SimpleFeature> it = fs.getFeatures(q).features();
            
            try {
                Geometry gc = new GeometryCollection(null, gf);
                while (it.hasNext()) {
                    SimpleFeature f = it.next();
                    Geometry g = (Geometry) f.getDefaultGeometry();
                    if (g!=null){
                        gc = gc.union(g);
                    }
                }
                
                return gc.toText();
                
            } finally {
                it.close();
                fs.getDataStore().dispose();
            }
        }   catch (Exception ex) {
            Logger.getLogger(FlamingoCQL.class.getName()).log(Level.SEVERE, null, ex);
        }
        return null;
    }
}
