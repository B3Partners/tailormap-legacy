/*
 * Copyright (C) 2014-2016 B3Partners B.V.
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
package nl.b3p.viewer.features;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.TransformerException;
import nl.b3p.viewer.config.app.ConfiguredAttribute;
import nl.b3p.viewer.config.services.AttributeDescriptor;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang.RandomStringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.simple.SimpleFeatureSource;
import org.geotools.feature.simple.SimpleFeatureBuilder;
import org.geotools.feature.simple.SimpleFeatureTypeBuilder;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.operation.TransformException;
import org.xml.sax.SAXException;

/**
 * Download the features in shape format. Actually, a zip file with all the
 * files corresponding to the shape format.
 *
 * @author Meine Toonen
 */
public class ShapeDownloader extends FeatureDownloader {
    private static final Log log = LogFactory.getLog(ShapeDownloader.class);
    private StreamingShapeWriter ssw;

    private SimpleFeatureBuilder featureBuilder;
    
    private File dir;

    public ShapeDownloader(List<ConfiguredAttribute> attributes,SimpleFeatureSource fs, Map<String, AttributeDescriptor> featureTypeAttributes, Map<String, String> attributeAliases, String params) {
        super(attributes, fs, featureTypeAttributes,attributeAliases, params);
    }

    @Override
    public void init() throws IOException {
        try {
            String uniqueName = RandomStringUtils.randomAlphanumeric(8);
            dir = new File(System.getProperty("java.io.tmpdir"), uniqueName);
            dir.mkdir();
            ssw = new StreamingShapeWriter(dir.getAbsolutePath() + File.separator);
             
            // create the schema based on the original shapefile
            org.opengis.feature.simple.SimpleFeatureType sft = createNewFeatureType(fs, attributes, featureTypeAttributes);
         
            featureBuilder = new SimpleFeatureBuilder(sft);
        } catch (IOException ex) {
            log.error("Cannot initialize new download", ex);
            throw ex;
        }
    }

    @Override
    public void processFeature(SimpleFeature oldFeature) {
        try {
            for (ConfiguredAttribute configuredAttribute : attributes) {
                if (configuredAttribute.isVisible() && attributeAliases.get(configuredAttribute.getAttributeName()) != null) {
                    featureBuilder.add(oldFeature.getAttribute(configuredAttribute.getAttributeName()));
                }
            }
            featureBuilder.add(oldFeature.getDefaultGeometry());
            SimpleFeature feature = featureBuilder.buildFeature(null);

            ssw.write(feature);
        } catch (IOException ex) {
            log.error("Cannot write feature",ex);
        } catch (TransformerException | ParserConfigurationException | SAXException | TransformException | FactoryException ex) {
            log.error("Cannot parse features");
        }
    }

    @Override
    public File write() throws IOException{
        ssw.close();
        
        File zip = File.createTempFile("downloadshp", ".zip");
        zipDirectory(dir, zip);
        FileUtils.deleteDirectory(dir);
        return zip;
    }

    private org.opengis.feature.simple.SimpleFeatureType createNewFeatureType(SimpleFeatureSource sfs, List<ConfiguredAttribute> configuredAttributes, Map<String, AttributeDescriptor> featureTypeAttributes) throws IOException {
        org.opengis.feature.simple.SimpleFeatureType oldSft = sfs.getSchema();
        SimpleFeatureTypeBuilder b = new SimpleFeatureTypeBuilder();

        b.setName(sfs.getName());
        for (ConfiguredAttribute configuredAttribute : configuredAttributes) {
            if (configuredAttribute.isVisible()&& attributeAliases.get(configuredAttribute.getAttributeName()) != null) {
                AttributeDescriptor ad = featureTypeAttributes.get(configuredAttribute.getFullName());
                String alias = attributeAliases.get(configuredAttribute.getAttributeName());
                b.add(alias, ad.getType().getClass());
            }
        }

        b.setCRS(oldSft.getGeometryDescriptor().getCoordinateReferenceSystem());
        b.add("the_geom", oldSft.getGeometryDescriptor().getType().getBinding()); // then add geometry

        org.opengis.feature.simple.SimpleFeatureType newFeatureType = b.buildFeatureType();

        return newFeatureType;
    }

    /**
     * This method zips the directory
     *
     * @param dir
     * @param zipDirName
     */
    private void zipDirectory(File dir, File zip) throws IOException {
        try {
            List<String> filesListInDir = new ArrayList<String>();
            populateFilesList(dir, filesListInDir);
            //now zip files one by one
            //create ZipOutputStream to write to the zip file
            FileOutputStream fos = new FileOutputStream(zip);
            ZipOutputStream zos = new ZipOutputStream(fos);
            for (String filePath : filesListInDir) {
                //for ZipEntry we need to keep only relative file path, so we used substring on absolute path
                ZipEntry ze = new ZipEntry(filePath.substring(dir.getAbsolutePath().length() + 1, filePath.length()));
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
            log.error("Could not write zipfile. Exiting.",e);
            throw e;
        }
    }

    /**
     * This method populates all the files in a directory to a List
     *
     * @param dir
     * @throws IOException
     */
    private void populateFilesList(File dir, List<String> filesListInDir) throws IOException {
        File[] files = dir.listFiles();
        for (File file : files) {
            if (file.isFile()) {
                filesListInDir.add(file.getAbsolutePath());
            } else {
                populateFilesList(file, filesListInDir);
            }
        }
    }

}
