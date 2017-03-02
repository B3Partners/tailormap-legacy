/*
 * Copyright (C) 2010-2016 B3Partners B.V.
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
package nl.b3p.viewer.features;

import com.vividsolutions.jts.geom.LineString;
import com.vividsolutions.jts.geom.MultiLineString;
import com.vividsolutions.jts.geom.MultiPoint;
import com.vividsolutions.jts.geom.MultiPolygon;
import com.vividsolutions.jts.geom.Point;
import com.vividsolutions.jts.geom.Polygon;
import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerException;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.FeatureWriter;
import org.geotools.data.Transaction;
import org.geotools.data.shapefile.ShapefileDataStore;
import org.geotools.data.shapefile.ShapefileDataStoreFactory;
import org.geotools.feature.AttributeTypeBuilder;
import org.geotools.feature.IllegalAttributeException;
import org.geotools.feature.simple.SimpleFeatureTypeBuilder;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.simple.SimpleFeatureType;
import org.opengis.feature.type.AttributeDescriptor;
import org.opengis.feature.type.GeometryDescriptor;
import org.opengis.feature.type.Name;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.crs.CoordinateReferenceSystem;
import org.opengis.referencing.operation.TransformException;
import org.xml.sax.SAXException;

/**
 * B3partners B.V. http://www.b3partners.nl
 *
 * @author Roy Created on 9-sep-2010, 10:45:09
 */
public class StreamingShapeWriter {

    protected static final Log log = LogFactory.getLog(StreamingShapeWriter.class);
    private Map props = new HashMap();
    private HashMap<String, ShapefileDataStore> datastores = new HashMap();
    private HashMap<String, FeatureWriter> writers = new HashMap();
    private int featuresGiven = 0;
    private int featuresWritten = 0;
    private String workingDir = null;
    private boolean shapeIndex = true;
    private List<String> skipAttributeNames = null;
    private CoordinateReferenceSystem defaultCoordRefSys = null;

    /**
     * Constructor with shapeIndex=true
     */
    public StreamingShapeWriter(String workingDir, CoordinateReferenceSystem defaultCoordRefSys) throws IOException {
        this(workingDir);
        this.defaultCoordRefSys = defaultCoordRefSys;
    }

    /**
     * Constructor with shapeIndex=true
     */
    public StreamingShapeWriter(String workingDir) throws IOException {
        this(workingDir, true);
    }

    /**
     * Constructor for creating a StreamingShapeWriter. The writer wil stream
     * the features to different shapefiles in the given working dir.
     *
     * @param workingDir The working dir where the shape writer is going to
     * write the shape files
     * @param shapeIndex If true a index wil be created on the shape files.
     * @param skipAttributeNames a list of attribute names that needs to be
     * skipped (default only boundedBy)
     */
    public StreamingShapeWriter(String workingDir, boolean shapeIndex, List<String> skipAttributeNames) throws IOException {
        this(workingDir, shapeIndex);
        this.skipAttributeNames = skipAttributeNames;
    }

    /**
     * Constructor for creating a StreamingShapeWriter. The writer wil stream
     * the features to different shapefiles in the given working dir.
     *
     * @param workingDir The working dir where the shape writer is going to
     * write the shape files
     * @param shapeIndex If true a index wil be created on the shape files.
     */
    public StreamingShapeWriter(String workingDir, boolean shapeIndex) throws IOException {
        props.put(ShapefileDataStoreFactory.URLP.key, "");
        props.put(ShapefileDataStoreFactory.CREATE_SPATIAL_INDEX.key, shapeIndex);

        this.workingDir = workingDir;
        File testFile = new File(workingDir);
        if (!testFile.exists()) {
            throw new IOException("Given path does not exists");
        }
        if (!testFile.isDirectory()) {
            throw new IOException("Given path is not a directory");
        }
        if (!testFile.canWrite()) {
            throw new IOException("Can't write in given path");
        }
        this.shapeIndex = shapeIndex;

        skipAttributeNames = new ArrayList<String>();
        skipAttributeNames.add("boundedBy");
    }

    /**
     * Writes a feature to a shape file. It also seperates the different
     * GeometryTypes into different shapefiles.
     */
    public void write(SimpleFeature f) throws IOException, TransformerConfigurationException, TransformerException, ParserConfigurationException, SAXException, TransformException, FactoryException {

        featuresGiven++;
        Class newGeomClass = null;
        String suffix = "";
        if (f.getDefaultGeometry() instanceof Point || f.getDefaultGeometry() instanceof MultiPoint) {
            newGeomClass = MultiPoint.class;
            suffix = "_p";
        } else if (f.getDefaultGeometry() instanceof Polygon || f.getDefaultGeometry() instanceof MultiPolygon) {
            newGeomClass = MultiPolygon.class;
            suffix = "_v";
        } else if (f.getDefaultGeometry() instanceof LineString || f.getDefaultGeometry() instanceof MultiLineString) {
            newGeomClass = MultiLineString.class;
            suffix = "_l";
        } else if (f.getDefaultGeometry() == null) {
            log.error("No default geometry set.");
        } else {
            log.error("Geometry type not found: " + f.getDefaultGeometry().getClass().toString());
        }

        if (newGeomClass != null) {
            String hashKey = createHashKey(newGeomClass, f.getType().getTypeName());
            FeatureWriter writer = writers.get(hashKey);
            if (writer == null) {
                writers.put(hashKey, createNewWriter(newGeomClass, f.getType(), suffix));
                writer = writers.get(hashKey);
            }
            if (writer != null) {
                write(writer, f);
                featuresWritten++;
            } else {
                log.error("writer for class: " + newGeomClass + " is not created");
            }
        }
    }

    /**
     * Function to close this writer. MUST BE CALLED!
     */
    public void close() {
        Iterator it = writers.keySet().iterator();
        while (it.hasNext()) {
            try {
                FeatureWriter writer = writers.get(it.next());
                if (writer != null) {
                    writer.close();
                }
            } catch (IOException ioe) {
                log.error("Error while closing writer: ", ioe);
            }
        }
        it = datastores.keySet().iterator();
        while (it.hasNext()) {
            ShapefileDataStore ds = datastores.get(it.next());
            if (ds != null) {
                ds.dispose();
            }
        }
    }

    /**
     * Function to write a feature to a writer.
     */
    private void write(FeatureWriter writer, SimpleFeature feature) throws IOException {
        // Write to datastore
        SimpleFeature newFeature = (SimpleFeature) writer.next();
        try {
            //controleer of de geometry al voor aan stond of dat deze is verplaatst naar voren.
            boolean geometryAttributeIsMoved = false;
            //if (feature.)
            int indexNewGeomAttribute = newFeature.getFeatureType().indexOf(newFeature.getFeatureType().getGeometryDescriptor().getName());
            int indexOldGeomAttribute = feature.getFeatureType().indexOf(feature.getFeatureType().getGeometryDescriptor().getName());
            if (indexNewGeomAttribute != indexOldGeomAttribute) {
                geometryAttributeIsMoved = true;
            }
            //omdat je niet weet wat de nieuwe volgorde is: Deze doorlopen ipv alle in 1 keer schrijven.
            List<AttributeDescriptor> ads = newFeature.getFeatureType().getAttributeDescriptors();
            for (int i = 0; i < ads.size(); i++) {
                AttributeDescriptor ad = ads.get(i);
                Name name = ad.getName();
                /*Zoek de goede name voor het attribuut op.
                 * controleer of er wel een property kan worden gevonden, dit lukt bijvoorbeeld niet
                 * als de naam korter is geworden omdat deze groter dan 10 karakters was.
                 * De originelewaarden is dan niet te vinden met de naam.
                 */
                if (feature.getProperty(name) == null) {
                    String new10CharName = name.getLocalPart();

                    if (new10CharName.length() > 10) {
                        new10CharName = new10CharName.substring(0, 10);
                    }

                    List<Name> validNames = new ArrayList<Name>();
                    List<AttributeDescriptor> oldAds = feature.getFeatureType().getAttributeDescriptors();
                    for (int a = 0; a < oldAds.size(); a++) {
                        if (oldAds.get(a).getName().getLocalPart().startsWith(new10CharName)) {
                            validNames.add(oldAds.get(a).getName());
                        }
                    }

                    if (validNames.size() == 1) {
                        name = validNames.get(0);
                    } else if (validNames.size() > 1) {
                        //als er meerdere zijn gevonden dan 1. Dan betekent het dat er 
                        //meerdere 10 karakter namen zijn die voldoen aan de criteria. Het nummer
                        //achter de naam geeft dan aan welke het moet zijn.
                        try {
                            int index = 0;
                            if (name.getLocalPart().length() > 10) {
                                index = new Integer(name.getLocalPart().substring(10, name.getLocalPart().length()));
                            }
                            if (index < validNames.size()) {
                                name = validNames.get(index);
                            } else {
                                name = validNames.get(validNames.size() - 1);
                            }

                        } catch (NumberFormatException e) {
                            log.error("Can't make a number out of the string that is added to the attribute name to make it unique.");
                        }
                    } else {
                        log.debug("Can't find the correct attribute name.");
                    }
                }
                newFeature.setAttribute(ad.getName(), feature.getAttribute(name));
            }
            newFeature.setDefaultGeometry(feature.getDefaultGeometry());
        } catch (IllegalAttributeException writeProblem) {
            throw new IllegalAttributeException("Could not create " + feature.getFeatureType().getTypeName() + " out of provided SimpleFeature: " + feature.getID() + "\n" + writeProblem);
        }
        writer.write();
    }

    /**
     * Creates a new FeatureWriter.
     *
     * @param geomClass The Geometry class for which the writer must be created.
     * @param type The featureType for which the writer is created.
     * @param suffix A suffix after the shapefile name to indicate the
     * difference between geometry types. For example "_p" (for points)
     * @return a new featurewriter
     * @throws MalformedURLException
     * @throws IOException
     */
    private FeatureWriter createNewWriter(Class geomClass, SimpleFeatureType type, String suffix) throws MalformedURLException, IOException {
        //create the file path
        String filePath = "";
        filePath += getWorkingDir();
        if (type.getTypeName().indexOf(":") >= 0) {
            filePath += type.getTypeName().split(":")[1];
        } else {
            filePath += type.getTypeName();
        }
        filePath += suffix;
        filePath += ".shp";
        String hashKey = createHashKey(geomClass, type.getTypeName());
        //get the datastore and create the writer
        ShapefileDataStore ds = datastores.get(hashKey);
        if (ds == null) {
            ShapefileDataStoreFactory factory = new ShapefileDataStoreFactory();
            File newShape = new File(filePath);
            props.put(ShapefileDataStoreFactory.URLP.key, newShape.toURI().toURL());
            ds = (ShapefileDataStore) factory.createNewDataStore(props);
            ds.createSchema(changeGeometryBinding(type, geomClass));
            datastores.put(hashKey, ds);
        }

        /* TODO: Bij een zelf meegegeven crs geeft dit mogelijk nog een lock op
         * de .prj file en kan deze niet verwijderd worden. forceSchemaCRS()
         * doet nog wat funky's met storageFile.replaceOriginal()
         */
        if (defaultCoordRefSys != null) {
            ds.forceSchemaCRS(defaultCoordRefSys);
        }

        //create transaction and writer
        //sometimes (when a crs is forced) the typename is resolved bij the shp fileName... 
        //So check if the suffix is needed because the suffix is in the filename.
        String[] typeNames = ds.getTypeNames();
        for (int i = 0; i < typeNames.length; i++) {
            if (typeNames[i].equals(type.getTypeName())) {
                return ds.getFeatureWriterAppend(type.getTypeName(), Transaction.AUTO_COMMIT);
            } else if (typeNames[i].equals(type.getTypeName() + suffix)) {
                return ds.getFeatureWriterAppend(type.getTypeName() + suffix, Transaction.AUTO_COMMIT);
            }
        }
        //hmm, not found? Just return the only available?
        if (ds.getTypeNames().length == 1) {
            return ds.getFeatureWriterAppend(ds.getTypeNames()[0], Transaction.AUTO_COMMIT);
        }
        return ds.getFeatureWriterAppend(type.getTypeName() + suffix, Transaction.AUTO_COMMIT);
    }

    private String createHashKey(Class newGeomClass, String typeName) {
        return typeName + " " + newGeomClass.getName();
    }

    public static SimpleFeatureType changeGeometryBinding(SimpleFeatureType ft, Class geomBinding) {
        List<AttributeDescriptor> attributeDescriptors = new ArrayList<AttributeDescriptor>(ft.getAttributeDescriptors());
        SimpleFeatureTypeBuilder builder = new SimpleFeatureTypeBuilder();
        builder.init(ft);
        if (ft.getGeometryDescriptor() != null) {
            AttributeDescriptor gd = changeGeometryBinding(ft.getGeometryDescriptor(), geomBinding);
            attributeDescriptors.set(ft.indexOf(ft.getGeometryDescriptor().getName()), gd);
            builder.setDefaultGeometry(ft.getGeometryDescriptor().getName().getLocalPart());
            builder.setAttributes(attributeDescriptors);
        }
        SimpleFeatureType newFt = builder.buildFeatureType();
        return newFt;
    }

    /**
     * Function to change the geometryBinding of a GeometryDescriptor
     */
    public static AttributeDescriptor changeGeometryBinding(GeometryDescriptor gd, Class geomBinding) {
        AttributeTypeBuilder builder = new AttributeTypeBuilder();
        builder.init(gd);
        builder.setBinding(geomBinding);
        builder.setCRS(gd.getCoordinateReferenceSystem());
        return builder.buildDescriptor(gd.getLocalName());
    }

    // <editor-fold defaultstate="collapsed" desc="getters and setters">
    public int getFeaturesGiven() {
        return featuresGiven;
    }

    public int getFeaturesWritten() {
        return featuresWritten;
    }

    public String getWorkingDir() {
        return workingDir;
    }

    public boolean isShapeIndex() {
        return shapeIndex;
    }

    public List<String> getSkipAttributeNames() {
        return skipAttributeNames;
    }

    public void setSkipAttributeNames(List<String> skipAttributeNames) {
        this.skipAttributeNames = skipAttributeNames;
    }

    // </editor-fold>
}
