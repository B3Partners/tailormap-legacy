package nl.tailormap.viewer.helpers.featuresources;

import nl.tailormap.viewer.config.services.ArcGISFeatureSource;
import nl.tailormap.viewer.config.services.FeatureSource;
import nl.tailormap.viewer.config.services.FeatureSourceUpdateResult;
import nl.tailormap.viewer.config.services.JDBCFeatureSource;
import nl.tailormap.viewer.config.services.SimpleFeatureType;
import nl.tailormap.viewer.config.services.UpdateResult;
import nl.tailormap.viewer.config.services.WFSFeatureSource;
import nl.tailormap.web.WaitPageStatus;
import org.apache.commons.lang3.mutable.MutableBoolean;
import org.apache.commons.lang3.tuple.MutablePair;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.simple.SimpleFeatureIterator;
import org.geotools.data.simple.SimpleFeatureSource;
import org.geotools.factory.CommonFactoryFinder;
import org.geotools.feature.FeatureCollection;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.filter.Filter;
import org.opengis.filter.FilterFactory2;
import org.opengis.filter.expression.Function;
import org.stripesstuff.stripersist.Stripersist;

import javax.persistence.EntityManager;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

public class FeatureSourceFactoryHelper {

    public static final int MAX_FEATURES_DEFAULT = 250;
    private static final Log log = LogFactory.getLog(FeatureSourceFactoryHelper.class);
    private final static int updatebatchsize = 50;

    public static Boolean isUpdatable(FeatureSource fs){
        return fs instanceof WFSFeatureSource || fs instanceof JDBCFeatureSource;
    }

    // <editor-fold desc="opengeotoolsfeaturesource" default-state="collapsed">
    public static org.geotools.data.FeatureSource openGeoToolsFeatureSource(SimpleFeatureType sft, int timeout) throws Exception {
        return FeatureSourceFactoryHelper.openGeoToolsFeatureSource(sft.getFeatureSource(), sft, timeout);
    }
    public static org.geotools.data.FeatureSource openGeoToolsFeatureSource(SimpleFeatureType sft) throws Exception {
        return FeatureSourceFactoryHelper.openGeoToolsFeatureSource(sft.getFeatureSource(), sft, 30);
    }

    public static org.geotools.data.FeatureSource openGeoToolsFeatureSource(FeatureSource fs,SimpleFeatureType sft) throws Exception {
        return FeatureSourceFactoryHelper.openGeoToolsFeatureSource(fs, sft, 30);
    }

    public static org.geotools.data.FeatureSource openGeoToolsFeatureSource(FeatureSource fs, SimpleFeatureType sft, int timeout) throws Exception {
        FeatureSourceHelper sh = getHelper(fs);
        return sh.openGeoToolsFeatureSource(fs, sft, timeout);
    }

    // </editor-fold>

    public static List<SimpleFeatureType> createFeatureTypes(FeatureSource fs, WaitPageStatus status) throws Exception {
        FeatureSourceHelper sh = getHelper(fs);
        return sh.createFeatureTypes(fs, status);
    }

    public static FeatureSourceHelper getHelper(FeatureSource fs){
        if(fs instanceof JDBCFeatureSource){
            return new JDBCFeatureSourceHelper();
        }else if(fs instanceof WFSFeatureSource){
            return new WFSFeatureSourceHelper();
        }else if(fs instanceof ArcGISFeatureSource){
            return new ArcGISFeatureSourceHelper();
        }
        return null;
    }

    /**
     * Update this featuresource.
     *
     * @param em the entity manager to use
     * @return the result of the update
     * @throws Exception if any
     */
    public static FeatureSourceUpdateResult update(EntityManager em, FeatureSource fs) throws Exception{
        final FeatureSourceUpdateResult result = new FeatureSourceUpdateResult(fs);
        try{
            List<SimpleFeatureType> newFeatureTypes = createFeatureTypes(fs,result.getWaitPageStatus().subtask("",80));
            int processed = 0;
            //update and add the new featuretypes.
            for(SimpleFeatureType newFt : newFeatureTypes){
                MutableBoolean updated = new MutableBoolean();
                fs.addOrUpdateFeatureType(newFt.getTypeName(), newFt, updated);

                MutablePair<SimpleFeatureType, UpdateResult.Status> ftResult = result.getFeatureTypeStatus().get(newFt.getTypeName());

                if (ftResult==null){
                    result.getFeatureTypeStatus().put(newFt.getTypeName(),new MutablePair(newFt, UpdateResult.Status.NEW));
                }else{
                    if(updated.isTrue()) {
                        log.info("Feature type: "+newFt.getTypeName()+" updated");
                        ftResult.setRight(UpdateResult.Status.UPDATED);
                    }else{
                        ftResult.setRight(UpdateResult.Status.UNMODIFIED);
                    }
                }
                processed++;
                if(processed == updatebatchsize){
                    processed = 0;
                    if(!em.getTransaction().isActive()){
                        em.getTransaction().begin();
                    }
                    em.persist(fs);
                    em.getTransaction().commit();
                    em.getTransaction().begin();
                }
            }
            if(!em.getTransaction().isActive()){
                em.getTransaction().begin();
            }
            em.persist(fs);
            em.getTransaction().commit();
            em.getTransaction().begin();
            processed = 0;
            //remove featuretypes when not there
            Iterator<SimpleFeatureType> it = fs.getFeatureTypes().iterator();
            while (it.hasNext()){
                SimpleFeatureType oldFt = it.next();
                boolean stillExists=false;
                for(SimpleFeatureType newFt : newFeatureTypes){
                    if (newFt.getTypeName().equals(oldFt.getTypeName())){
                        stillExists=true;
                        break;
                    }
                }
                if(!stillExists){
                    it.remove();
                    em.remove(oldFt);
                }
                if(processed == updatebatchsize){
                    processed = 0;
                    if(!em.getTransaction().isActive()){
                        em.getTransaction().begin();
                    }
                    em.persist(fs);
                    em.getTransaction().commit();
                    em.getTransaction().begin();
                }
            }
            result.setStatus(UpdateResult.Status.UPDATED);

        }catch(Exception e){
            result.failedWithException(e);
        }
        return result;
    }

    public static void removeFeatureType(FeatureSource fs, SimpleFeatureType featureType) {
        Stripersist.getEntityManager().remove(featureType);
        fs.getFeatureTypes().remove(featureType);
    }

    public static List<String> calculateUniqueValues(SimpleFeatureType sft, String attributeName, Filter filter) throws Exception{
        return calculateUniqueValues(sft, attributeName, MAX_FEATURES_DEFAULT, filter);
    }

    public static List<String> calculateUniqueValues(SimpleFeatureType sft, String attributeName, int maxFeatures, Filter filter) throws Exception{
        org.geotools.data.FeatureSource fs = null;
        try {
            FilterFactory2 ff = CommonFactoryFinder.getFilterFactory2(null);
            Function unique = ff.function("Collection_Unique", ff.property(attributeName));
            Filter notNull = ff.not( ff.isNull( ff.property(attributeName) ));
            Filter f = notNull;
            if(filter != null){
                f = ff.and(notNull, filter);
            }
            org.geotools.data.Query q = new org.geotools.data.Query(sft.getTypeName(), f);
            if(maxFeatures != -1) {
                q.setMaxFeatures(maxFeatures);
            }

            fs = openGeoToolsFeatureSource(sft);
            FeatureCollection fc = fs.getFeatures(q);

            Object o = unique.evaluate( fc);
            Set<String> uniqueValues  = (Set<String>)o;
            if(uniqueValues == null){
                uniqueValues = new HashSet<String>();
            }
            List<String> l = new ArrayList<String>(uniqueValues);
            Collections.sort(l);
            return l;
        } catch (Exception ex) {
            throw ex;
        }finally{
            if(fs != null && fs.getDataStore() != null){
                fs.getDataStore().dispose();
            }
        }
    }

    public static Map<String, String> getKeyValuePairs(SimpleFeatureType sft, String key, String label, int maxFeatures) throws Exception {
        Map<String, String> output = new TreeMap< String, String>();
        SimpleFeatureSource fs = null;

        try {
            fs = (SimpleFeatureSource) openGeoToolsFeatureSource(sft);

            FilterFactory2 ff = CommonFactoryFinder.getFilterFactory2(null);
            Filter notNull = ff.not(ff.isNull(ff.property(key)));
            org.geotools.data.Query q = new org.geotools.data.Query(sft.getTypeName(), notNull);
            q.setMaxFeatures(maxFeatures);
            q.setPropertyNames(new String[]{key, label});

            SimpleFeatureIterator iterator = fs.getFeatures(q).features();
            try {
                while (iterator.hasNext()) {
                    SimpleFeature f = iterator.next();
                    output.put(
                            f.getAttribute(key).toString(),
                            f.getAttribute(label).toString()
                    );
                }
            } finally {
                iterator.close();
            }
            return output;
        } catch (Exception ex) {
            throw ex;
        } finally {
            if (fs != null && fs.getDataStore() != null) {
                fs.getDataStore().dispose();
            }
        }
    }

    public static Object getMaxValue(SimpleFeatureType sft, String attributeName, int maxFeatures, Filter f) throws Exception {
        org.geotools.data.FeatureSource fs = null;
        try {
            FilterFactory2 ff = CommonFactoryFinder.getFilterFactory2(null);
            Function max = ff.function("Collection_Max", ff.property(attributeName));

            fs = openGeoToolsFeatureSource(sft);
            FeatureCollection fc = f != null ? fs.getFeatures(f) : fs.getFeatures();
            Object value = max.evaluate(fc);
            return value;
        } catch (Exception ex) {
            throw ex;
        } finally {
            if (fs != null && fs.getDataStore() != null) {
                fs.getDataStore().dispose();
            }
        }
    }

    public static Object getMinValue(SimpleFeatureType sft, String attributeName, int maxFeatures, Filter filter) throws Exception {
        org.geotools.data.FeatureSource fs = null;
        try {
            FilterFactory2 ff = CommonFactoryFinder.getFilterFactory2(null);
            Function minFunction = ff.function("Collection_Min", ff.property(attributeName));
            fs = openGeoToolsFeatureSource(sft);

            FeatureCollection f = filter != null ? fs.getFeatures(filter) : fs.getFeatures();

            Object o = minFunction.evaluate(f);
            return o;
        } catch (Exception ex) {
            throw ex;
        } finally {
            if (fs != null && fs.getDataStore() != null) {
                fs.getDataStore().dispose();
            }
        }
    }
}
