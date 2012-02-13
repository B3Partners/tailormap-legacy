/*
 * Copyright (C) 2011 B3Partners B.V.
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
package nl.b3p.viewer.config.services;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.persistence.*;
import nl.b3p.web.WaitPageStatus;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.DataStore;
import org.geotools.data.DataStoreFinder;
import org.geotools.data.simple.SimpleFeatureSource;
import org.json.JSONException;
import org.json.JSONObject;
import org.opengis.feature.type.AttributeType;

/**
 *
 * @author jytte
 * @author Matthijs Laan
 */
@Entity
@DiscriminatorValue(JDBCFeatureSource.PROTOCOL)
public class JDBCFeatureSource extends FeatureSource {
    private static final Log log = LogFactory.getLog(JDBCFeatureSource.class);
    
    public static final String PROTOCOL = "jdbc";

    @Column(name="db_schema")
    private String schema;

    public String getSchema() {
        return schema;
    }

    public void setSchema(String schema) {
        this.schema = schema;
    }

    public JDBCFeatureSource() {
        super();
    }
    
    public JDBCFeatureSource(Map params) throws JSONException {
        super();
        
        JSONObject urlObj = new JSONObject();
        urlObj.put("dbtype", params.get("dbtype"));
        urlObj.put("host", params.get("host"));
        urlObj.put("port", params.get("port"));
        urlObj.put("database", params.get("database"));
        setUrl(urlObj.toString());
        
        schema = (String)params.get("schema");
        setUsername((String)params.get("user"));
        setPassword((String)params.get("passwd"));
    }
    
    public void loadFeatureTypes() throws Exception {
        loadFeatureTypes(new WaitPageStatus());
    }
    
    public void loadFeatureTypes(WaitPageStatus status) throws Exception {
        status.setCurrentAction("Databaseverbinding maken...");

        DataStore store = createDataStore();
        status.setProgress(10);
        status.setCurrentAction("Ophalen met lijst van tabellen met geo-informatie...");
        String[] typeNames = store.getTypeNames();
        status.setProgress(20);

        if(typeNames.length != 0) {
            double progress = 20.0;
            double progressPerTypeName = (80.0/typeNames.length);
            for(String typeName: typeNames) {
                status.setCurrentAction("Inladen schema van tabel \"" + typeName + "\"...");
                log.debug("Loading feature source " + typeName + " for JDBCFeatureSource " + getName());

                SimpleFeatureSource gtFs = store.getFeatureSource(typeName);

                SimpleFeatureType sft = new SimpleFeatureType();
                sft.setTypeName(typeName);
                sft.setFeatureSource(this);
                sft.setWriteable(true);
                if(gtFs.getInfo() != null) {
                    sft.setDescription(gtFs.getInfo().getDescription());
                }

                org.opengis.feature.simple.SimpleFeatureType gtFt = gtFs.getSchema();

                for(org.opengis.feature.type.AttributeDescriptor gtAtt: gtFt.getAttributeDescriptors()) {
                    AttributeDescriptor att = new AttributeDescriptor();
                    sft.getAttributes().add(att);
                    att.setName(gtAtt.getLocalName());

                    AttributeType gtType = gtAtt.getType();
                    Class binding = gtType.getBinding();

                    // XXX convert binding to AttributeDescriptor final                    
                    att.setType(null);
                }
                this.getFeatureTypes().add(sft);         
                progress += progressPerTypeName;
                status.setProgress((int)progress);
            }
        }
        store.dispose();
    }
    
    public DataStore createDataStore() throws Exception {
        Map params = new HashMap();
        JSONObject urlObj = new JSONObject(getUrl());
        params.put("dbtype", urlObj.get("dbtype"));
        params.put("host", urlObj.get("host"));
        params.put("port", urlObj.get("port"));
        params.put("database", urlObj.get("database"));
        
        params.put("schema", schema);
        params.put("user", getUsername());
        params.put("passwd", getPassword());
        
        log.debug("Opening datastore using parameters: " + params);
        try {
            DataStore ds = DataStoreFinder.getDataStore(params);      
            if(ds == null) {
                throw new Exception("Cannot open datastore using parameters " + params);
            }
            return ds;
        } catch(Exception e) {
            throw new Exception("Cannot open datastore using parameters " + params, e);
        }
    }
    
    @Override
    List<String> calculateUniqueValues(SimpleFeatureType sft, String attributeName, int maxFeatures) throws IOException {
        throw new UnsupportedOperationException("Not supported yet.");
    }
}
