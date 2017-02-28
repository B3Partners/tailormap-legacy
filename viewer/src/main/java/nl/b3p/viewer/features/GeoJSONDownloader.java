/*
 * Copyright (C) 2016 B3Partners B.V.
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

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.List;
import java.util.Map;
import nl.b3p.viewer.config.app.ConfiguredAttribute;
import nl.b3p.viewer.config.services.AttributeDescriptor;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.simple.SimpleFeatureSource;
import org.geotools.geojson.feature.FeatureJSON;
import org.json.JSONArray;
import org.json.JSONObject;
import org.opengis.feature.simple.SimpleFeature;

/**
 *
 * @author meine
 */
public class GeoJSONDownloader extends FeatureDownloader{
    private static final Log log = LogFactory.getLog(GeoJSONDownloader.class);

    private FeatureJSON fjson;
    private JSONArray features = new JSONArray();
    
    public GeoJSONDownloader(List<ConfiguredAttribute> attributes, SimpleFeatureSource fs, Map<String, AttributeDescriptor> featureTypeAttributes, Map<String, String> attributeAliases, String params) {
        super(attributes, fs, featureTypeAttributes, attributeAliases, params);
        
    }

    @Override
    public void init() throws IOException {
        fjson = new FeatureJSON();
    }

    @Override
    public void processFeature(SimpleFeature oldFeature) {
        try {
            StringWriter sw = new StringWriter();
            fjson.writeFeature(oldFeature, sw);
            JSONObject featureObject = new JSONObject(sw.toString());
            features.put(featureObject);
        } catch (IOException ex) {
            log.error("Cannot write feature: ", ex);
        }
    }

    @Override
    public File write() throws IOException {
        JSONObject featureCollection = new JSONObject();
        featureCollection.put("type", "FeatureCollection");
        featureCollection.put("features", features);
        
        File f = File.createTempFile("GeoJSON", ".json");
        PrintWriter pw = new PrintWriter(f);
        pw.write(featureCollection.toString());
        pw.close();
        return f;
    }
    
}
