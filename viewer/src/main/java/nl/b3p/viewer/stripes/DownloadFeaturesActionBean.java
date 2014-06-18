/*
 * Copyright (C) 2012-2014 B3Partners B.V.
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
package nl.b3p.viewer.stripes;

import org.apache.commons.lang.RandomStringUtils;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import javax.activation.MimetypesFileTypeMap;
import javax.servlet.http.HttpServletResponse;
import net.sourceforge.stripes.action.ActionBean;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.After;
import net.sourceforge.stripes.action.Before;
import net.sourceforge.stripes.action.Resolution;
import net.sourceforge.stripes.action.StreamingResolution;
import net.sourceforge.stripes.action.StrictBinding;
import net.sourceforge.stripes.action.UrlBinding;
import net.sourceforge.stripes.controller.LifecycleStage;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.geotools.filter.visitor.RemoveDistanceUnit;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.app.ConfiguredAttribute;
import nl.b3p.viewer.config.security.Authorizations;
import nl.b3p.viewer.config.services.AttributeDescriptor;
import nl.b3p.viewer.config.services.FeatureTypeRelation;
import nl.b3p.viewer.config.services.Layer;
import nl.b3p.viewer.config.services.SimpleFeatureType;
import nl.b3p.viewer.config.services.WFSFeatureSource;
import nl.b3p.viewer.util.ChangeMatchCase;
import nl.b3p.viewer.util.FeatureToJson;
import org.apache.commons.io.IOUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.DataStore;
import org.geotools.data.DataUtilities;
import org.geotools.data.FeatureSource;
import org.geotools.data.FeatureStore;
import org.geotools.data.Query;
import org.geotools.data.Transaction;
import org.geotools.data.shapefile.ShapefileDataStore;
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.data.simple.SimpleFeatureIterator;
import org.geotools.data.simple.SimpleFeatureSource;
import org.geotools.data.wfs.WFSDataStoreFactory;
import org.geotools.factory.CommonFactoryFinder;
import org.geotools.factory.GeoTools;
import org.geotools.feature.FeatureCollection;
import org.geotools.feature.simple.SimpleFeatureBuilder;
import org.geotools.feature.simple.SimpleFeatureTypeBuilder;
import org.geotools.filter.text.cql2.CQL;
import org.json.JSONException;
import org.json.JSONObject;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.filter.Filter;
import org.opengis.filter.FilterFactory2;
import org.opengis.filter.sort.SortBy;
import org.opengis.filter.sort.SortOrder;

/**
 *
 * @author Meine Toonen
 */
@UrlBinding("/action/downloadfeatures")
@StrictBinding
public class DownloadFeaturesActionBean implements ActionBean {

    private static final Log log = LogFactory.getLog(DownloadFeaturesActionBean.class);

    private ActionBeanContext context;

    private boolean unauthorized;

    @Validate
    private Application application;

    @Validate
    private ApplicationLayer appLayer;

    @Validate
    private SimpleFeatureType featureType;

    private Layer layer = null;

    @Validate
    private int limit;

    @Validate
    private String filter;

    @Validate
    private boolean debug;

    @Validate
    private String type;

    //<editor-fold defaultstate="collapsed" desc="getters and setters">
    @Override
    public void setContext(ActionBeanContext abc) {
        this.context = abc;
    }

    @Override
    public ActionBeanContext getContext() {
        return context;
    }

    public boolean isUnauthorized() {
        return unauthorized;
    }

    public void setUnauthorized(boolean unauthorized) {
        this.unauthorized = unauthorized;
    }

    public Application getApplication() {
        return application;
    }

    public void setApplication(Application application) {
        this.application = application;
    }

    public ApplicationLayer getAppLayer() {
        return appLayer;
    }

    public void setAppLayer(ApplicationLayer appLayer) {
        this.appLayer = appLayer;
    }

    public SimpleFeatureType getFeatureType() {
        return featureType;
    }

    public void setFeatureType(SimpleFeatureType featureType) {
        this.featureType = featureType;
    }

    public Layer getLayer() {
        return layer;
    }

    public void setLayer(Layer layer) {
        this.layer = layer;
    }

    public int getLimit() {
        return limit;
    }

    public void setLimit(int limit) {
        this.limit = limit;
    }

    public String getFilter() {
        return filter;
    }

    public void setFilter(String filter) {
        this.filter = filter;
    }

    public boolean isDebug() {
        return debug;
    }

    public void setDebug(boolean debug) {
        this.debug = debug;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
    // </editor-fold>
    
    @After(stages=LifecycleStage.BindingAndValidation)
    public void loadLayer() {
        layer = appLayer.getService().getSingleLayer(appLayer.getLayerName());
    }
    
    @Before(stages=LifecycleStage.EventHandling)
    public void checkAuthorization() {
        
        if(application == null || appLayer == null 
                || !Authorizations.isAppLayerReadAuthorized(application, appLayer, context.getRequest())) {
            unauthorized = true;
        }
    }
    

    public Resolution download() throws JSONException, FileNotFoundException {
        JSONObject json = new JSONObject();
        if (unauthorized) {
            json.put("success", false);
            json.put("message", "Not authorized");
            return new StreamingResolution("application/json", new StringReader(json.toString(4)));
        }
        File output = null;
        try {
            if (featureType != null || (layer != null && layer.getFeatureType() != null)) {
                FeatureSource fs;
                SimpleFeatureType ft = featureType;
                if (ft == null) {
                    ft = layer.getFeatureType();
                }
                if (isDebug() && ft.getFeatureSource() instanceof WFSFeatureSource) {
                    Map extraDataStoreParams = new HashMap();
                    extraDataStoreParams.put(WFSDataStoreFactory.TRY_GZIP.key, Boolean.FALSE);
                    fs = ((WFSFeatureSource) ft.getFeatureSource()).openGeoToolsFeatureSource(layer.getFeatureType(), extraDataStoreParams);
                } else {

                    fs = ft.openGeoToolsFeatureSource();
                }

                final Query q = new Query(fs.getName().toString());
                //List<String> propertyNames = FeatureToJson.setPropertyNames(appLayer,q,ft,false);

                setFilter(q, ft);

                Map<String, AttributeDescriptor> featureTypeAttributes = new HashMap<String, AttributeDescriptor>();
                featureTypeAttributes = makeAttributeDescriptorList(ft);
                List<ConfiguredAttribute> attributes =  appLayer.getAttributes();

//                q.setMaxFeatures(Math.min(limit, FeatureToJson.MAX_FEATURES));
                output = convert(ft, fs, q, null,null, type, attributes,featureTypeAttributes);
                json.put("success", true);
            }
        } catch (Exception e) {
            log.error("Error loading features", e);

            json.put("success", false);

            String message = "Fout bij ophalen features: " + e.toString();
            Throwable cause = e.getCause();
            while (cause != null) {
                message += "; " + cause.toString();
                cause = cause.getCause();
            }
            json.put("message", message);
        }
        final FileInputStream fis = new FileInputStream(output);
         StreamingResolution res = new StreamingResolution(MimetypesFileTypeMap.getDefaultFileTypeMap().getContentType(output)) {
            @Override
            public void stream(HttpServletResponse response) throws Exception {

                OutputStream out = response.getOutputStream();

                
                IOUtils.copy(fis, out);
                fis.close();
            }
        };            
        res.setFilename(output.getName());       
        res.setAttachment(true);
        return res;
    }

    private File convert(SimpleFeatureType ft, FeatureSource fs, Query q, String sort, String dir, String type, List<ConfiguredAttribute> attributes, Map<String, AttributeDescriptor> featureTypeAttributes) throws IOException {
        Map<String, String> attributeAliases = new HashMap<String, String>();
        for (AttributeDescriptor ad : ft.getAttributes()) {
            if (ad.getAlias() != null) {
                attributeAliases.put(ad.getName(), ad.getAlias());
            }
        }
        List<String> propertyNames = new ArrayList<String>();
        for (AttributeDescriptor ad : ft.getAttributes()) {
            propertyNames.add(ad.getName());
        }
        if (sort != null) {
            setSortBy(q, sort, dir);
        } /* Use the first property as sort field, otherwise geotools while give a error when quering
         * a JDBC featureType without a primary key.
         */ else if (fs instanceof org.geotools.jdbc.JDBCFeatureSource && !propertyNames.isEmpty()) {
            setSortBy(q, propertyNames.get(0), dir);
        }
        SimpleFeatureCollection fc =(SimpleFeatureCollection) fs.getFeatures(q);
        File f = null;
        try {
            if( type.equalsIgnoreCase("SHP")){
                f = convertToShape(fc, fs,attributes,featureTypeAttributes);
            }else{
                throw new IllegalArgumentException("No suitable type given: " + type);
            }
        } catch(IOException ex){
            log.error("Cannot create outputfile: ",ex);
        }finally {
            fs.getDataStore().dispose();
        }
        return f;
    }

    private File convertToShape(SimpleFeatureCollection fc, FeatureSource fs, List<ConfiguredAttribute> attributes, Map<String, AttributeDescriptor> featureTypeAttributes) throws IOException {
        String uniqueName = RandomStringUtils.randomAlphanumeric(8);
        File dir = new File(System.getProperty("java.io.tmpdir"),uniqueName);
        dir.mkdir();
        File shape = File.createTempFile("shp", ".shp", dir);
        // create a new shapefile data store
        DataStore newShapefileDataStore = new ShapefileDataStore(shape.toURI().toURL());

        // create the schema based on the original shapefile
        org.opengis.feature.simple.SimpleFeatureType sft = createNewFeatureType((SimpleFeatureSource)fs,attributes,featureTypeAttributes);
        newShapefileDataStore.createSchema(sft);

        // grab the feature source from the new shapefile data store
        FeatureSource newFeatureSource = newShapefileDataStore.getFeatureSource(sft.getName());

        // downcast FeatureSource to specific implementation of FeatureStore
        FeatureStore newFeatureStore = (FeatureStore) newFeatureSource;

        // accquire a transaction to create the shapefile from FeatureStore
        Transaction t = newFeatureStore.getTransaction();
        SimpleFeatureIterator it = fc.features();
        List<SimpleFeature> featureList = new ArrayList<SimpleFeature>();
        
        SimpleFeatureBuilder featureBuilder = new SimpleFeatureBuilder(sft);
        try {
             while( it.hasNext() ){
                  SimpleFeature feature = it.next();
                  SimpleFeature newFeature = createFeature(feature, featureBuilder, attributes);
                  // verander de feature
                  featureList.add(newFeature);
                  System.out.println( feature.getID() );
             }
         }
         finally {
             it.close();
         }
        SimpleFeatureCollection newFc = DataUtilities.collection(featureList);
        
        newFeatureStore.addFeatures(newFc);

        // filteredReader is now exhausted and closed, commit the changes
        t.commit();
        t.close();
        File zip = File.createTempFile("downloadshp", ".zip");
        zipDirectory(dir, zip);
        
        return zip;
    }
    
    private SimpleFeature createFeature(SimpleFeature oldFeature,SimpleFeatureBuilder featureBuilder, List<ConfiguredAttribute> configuredAttributes){
        for (ConfiguredAttribute configuredAttribute : configuredAttributes) {
            if(configuredAttribute.isVisible()){
                featureBuilder.add(oldFeature.getAttribute(configuredAttribute.getAttributeName()));
            }
        }
        featureBuilder.add(oldFeature.getDefaultGeometry());
        SimpleFeature feature = featureBuilder.buildFeature(null);
        return feature;
    }
    
    private org.opengis.feature.simple.SimpleFeatureType createNewFeatureType(SimpleFeatureSource sfs,List<ConfiguredAttribute> configuredAttributes,Map<String, AttributeDescriptor> featureTypeAttributes) throws IOException {
        org.opengis.feature.simple.SimpleFeatureType oldSft = sfs.getSchema();
        SimpleFeatureTypeBuilder b = new SimpleFeatureTypeBuilder();

        b.setName(sfs.getName());
        for (ConfiguredAttribute configuredAttribute : configuredAttributes) {
            if(configuredAttribute.isVisible()){
                AttributeDescriptor ad = featureTypeAttributes.get(configuredAttribute.getFullName());
                b.add(configuredAttribute.getAttributeName(),ad.getType().getClass());
            }
        }

//add a geometry property
        b.setCRS(oldSft.getGeometryDescriptor().getCoordinateReferenceSystem());
        b.add(oldSft.getGeometryDescriptor().getLocalName(),oldSft.getGeometryDescriptor().getType().getBinding()); // then add geometry

//build the type
        org.opengis.feature.simple.SimpleFeatureType nieuwFt = b.buildFeatureType();
        
        return nieuwFt;
    }
    
      /**
     * Makes a list of al the attributeDescriptors of the given FeatureType and
     * all the child FeatureTypes (related by join/relate)
     */
    private Map<String, AttributeDescriptor> makeAttributeDescriptorList(SimpleFeatureType ft) {
        Map<String,AttributeDescriptor> featureTypeAttributes = new HashMap<String,AttributeDescriptor>();
        for(AttributeDescriptor ad: ft.getAttributes()) {
            String name=ft.getId()+":"+ad.getName();
            //stop when already added. Stop a infinite configurated loop
            if (featureTypeAttributes.containsKey(name)){
                return featureTypeAttributes;
            }
            featureTypeAttributes.put(name, ad);
        }
        if (ft.getRelations()!=null){
            for (FeatureTypeRelation rel : ft.getRelations()){
                featureTypeAttributes.putAll(makeAttributeDescriptorList(rel.getForeignFeatureType()));                
            }
        }
        return featureTypeAttributes;
    }
    
     /**
     * This method zips the directory
     * @param dir
     * @param zipDirName
     */
    private void zipDirectory(File dir, File zip) {
        try {
            List<String> filesListInDir = new ArrayList<String>();
            populateFilesList(dir,filesListInDir);
            //now zip files one by one
            //create ZipOutputStream to write to the zip file
            FileOutputStream fos = new FileOutputStream(zip);
            ZipOutputStream zos = new ZipOutputStream(fos);
            for(String filePath : filesListInDir){
                System.out.println("Zipping "+filePath);
                //for ZipEntry we need to keep only relative file path, so we used substring on absolute path
                ZipEntry ze = new ZipEntry(filePath.substring(dir.getAbsolutePath().length()+1, filePath.length()));
                zos.putNextEntry(ze);
                //read the file and write to ZipOutputStream
                FileInputStream fis = new FileInputStream(filePath);
                byte[] buffer = new byte[1024];
                int len;
                while ((len = fis.read(buffer)) > 0) {
                    zos.write(buffer, 0, len);
                }
                zos.closeEntry();
                fis.close();
            }
            zos.close();
            fos.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
     
    /**
     * This method populates all the files in a directory to a List
     * @param dir
     * @throws IOException
     */
    private void populateFilesList(File dir,List<String> filesListInDir) throws IOException {
        File[] files = dir.listFiles();
        for(File file : files){
            if(file.isFile()) filesListInDir.add(file.getAbsolutePath());
            else populateFilesList(file,filesListInDir);
        }
    }

    private void convertToExcel(FeatureCollection fc) {
        /*        JSONArray features = new JSONArray();
         try {
         it = fs.getFeatures(q).features();
         int featureIndex = 0;
         while (it.hasNext()) {
         SimpleFeature feature = it.next();*/
        /* if offset not supported and there are more features returned then
         * only get the features after index >= start*/
                //JSONObject j = this.toJSONFeature(new JSONObject(), feature, ft, al, propertyNames, attributeAliases, 0);
        //features.put(j);
                /*featureIndex++;
         }
         } finally {
         if (it != null) {
         it.close();
         }
         fs.getDataStore().dispose();
         }*/
    }

    /* private void getFeatures() {
     FeatureIterator<SimpleFeature> it = null;
     JSONArray features = new JSONArray();
     try {
     it = fs.getFeatures(q).features();
     int featureIndex = 0;
     while (it.hasNext()) {
     SimpleFeature feature = it.next();
       
     if (offsetSupported || featureIndex >= start) {
     JSONObject j = this.toJSONFeature(new JSONObject(), feature, ft, al, propertyNames, attributeAliases, 0);
     features.put(j);
     }
     featureIndex++;
     }
     } finally {
     if (it != null) {
     it.close();
     }
     fs.getDataStore().dispose();
     }
     }*/
    private void setFilter(Query q, SimpleFeatureType ft) throws Exception {
        if (filter != null && filter.trim().length() > 0) {
            Filter f = CQL.toFilter(filter);
            f = (Filter) f.accept(new RemoveDistanceUnit(), null);
            f = (Filter) f.accept(new ChangeMatchCase(false), null);
            f = FeatureToJson.reformatFilter(f, ft);
            q.setFilter(f);
        }
    }

    /**
     * Set sort on query
     *
     * @param q the query on which the sort is added
     * @param sort the name of the sort column
     * @param dir sorting direction DESC or ASC
     */
    private void setSortBy(Query q, String sort, String dir) {
        FilterFactory2 ff2 = CommonFactoryFinder.getFilterFactory2(GeoTools.getDefaultHints());

        if (sort != null) {
            q.setSortBy(new SortBy[]{
                ff2.sort(sort, "DESC".equals(dir) ? SortOrder.DESCENDING : SortOrder.ASCENDING)
            });
        }

    }

}
