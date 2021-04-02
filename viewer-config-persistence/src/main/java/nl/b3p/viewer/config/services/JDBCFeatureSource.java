/*
 * Copyright (C) 2011-2013 B3Partners B.V.
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
package nl.b3p.viewer.config.services;

import java.util.*;
import javax.persistence.*;
import nl.b3p.web.WaitPageStatus;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.DataStore;
import org.geotools.data.DataStoreFinder;
import org.geotools.data.simple.SimpleFeatureSource;
import org.geotools.data.sqlserver.SQLServerDataStoreFactory;
import org.geotools.feature.FeatureCollection;
import org.geotools.jdbc.JDBCDataStoreFactory;
import org.json.JSONException;
import org.json.JSONObject;
import org.opengis.feature.type.AttributeType;
import org.opengis.feature.type.GeometryType;
import org.opengis.filter.Filter;

/**
 *
 * @author jytte
 * @author Matthijs Laan
 */
@Entity
@DiscriminatorValue(JDBCFeatureSource.PROTOCOL)
public class JDBCFeatureSource extends FeatureSource{

    public static final String PROTOCOL = "jdbc";

    @Column(name="db_schema")
    public String schema;

    public String getSchema() {
        return schema;
    }

    public void setSchema(String schema) {
        this.schema = schema;
    }

    public JDBCFeatureSource(){
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
}
