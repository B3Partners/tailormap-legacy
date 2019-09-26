/*
 * Copyright (C) 2012-2013 B3Partners B.V.
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
package nl.b3p.geotools.data.arcgis;

import java.io.IOException;
import java.io.Serializable;
import java.net.URL;
import java.util.Map;
import org.geotools.data.DataStore;
import org.geotools.data.DataStoreFactorySpi;
import org.opengis.referencing.crs.CoordinateReferenceSystem;

/**
 *
 * @author Matthijs Laan
 * @author mprins
 */
public class ArcGISDataStoreFactory implements DataStoreFactorySpi {

    public static final DataStoreFactorySpi.Param URL = new Param("url", URL.class, "ArcGIS Server REST URL ending in /MapServer or /FeatureServer");
    public static final DataStoreFactorySpi.Param USER = new Param("user", String.class, "Username", false);    
    public static final DataStoreFactorySpi.Param PASSWD = new Param("passwd", String.class, "Password", false);    
    public static final DataStoreFactorySpi.Param TIMEOUT = new Param("timeout", Integer.class, "Timeout in ms; default 30000", false);
    public static final DataStoreFactorySpi.Param TRY_GZIP = new Param("try_gzip", Boolean.class, "Request server to use gzip compression", false);
    public static final DataStoreFactorySpi.Param CRS = new Param("crs", CoordinateReferenceSystem.class, "Coordinate reference system", false);
    public static final DataStoreFactorySpi.Param AGS_ASSUME_VERSION = new Param("ags_assume_version", String.class, "Assume this ArcGIS Server version (e.g. 10.x, 9.x)", false);
    //public static final DataStoreFactorySpi.Param HTTP_CACHE = new Param("http_cache", HTTPCache.class, "HTTPCache instance to enable HTTP caching", false);
    // TODO: add CURRENT_VERSION param
    
    @Override
    public DataStore createDataStore(Map<String, Serializable> params) throws IOException {
        return createNewDataStore(params);
    }

    @Override
    public DataStore createNewDataStore(Map<String, Serializable> params) throws IOException {
        return new ArcGISDataStore(
                (URL)params.get(URL.key), 
                (String)params.get(USER.key),
                (String)params.get(PASSWD.key),
                (Integer)params.get(TIMEOUT.key),
                (Boolean)params.get(TRY_GZIP.key),
                (CoordinateReferenceSystem)params.get(CRS.key),
                null,//(HTTPCache)params.get(HTTP_CACHE.key)
                (String)params.get(AGS_ASSUME_VERSION.key)
        );
    }

    @Override
    public String getDescription() {
        return "ArcGIS Server REST data store";
    }

    @Override
    public Param[] getParametersInfo() {
        return new Param[] { URL, USER, PASSWD, TIMEOUT, TRY_GZIP, CRS, AGS_ASSUME_VERSION /*, HTTP_CACHE*/ };
    }

    @Override
    public String getDisplayName() {
        return "ArcGISDataStore";
    }

    @Override
    public boolean isAvailable() {
        return true;
    }
}
