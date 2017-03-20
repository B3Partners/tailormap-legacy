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
package nl.b3p.geotools.data.arcims;

import java.io.IOException;
import java.io.Serializable;
import java.net.URL;
import java.util.Map;
import org.geotools.data.AbstractDataStoreFactory;
import org.geotools.data.DataStore;
import org.geotools.data.DataStoreFactorySpi;
import org.opengis.referencing.crs.CoordinateReferenceSystem;

/**
 *
 * @author Matthijs Laan
 */
public class ArcIMSDataStoreFactory extends AbstractDataStoreFactory {
    
    public static final DataStoreFactorySpi.Param URL = new Param("url", URL.class, "ArcIMS service URL");
    public static final DataStoreFactorySpi.Param SERVICENAME = new Param("service_name", String.class, "ServiceName parameter if not in URL", false);    
    public static final DataStoreFactorySpi.Param USER = new Param("user", String.class, "Username", false);    
    public static final DataStoreFactorySpi.Param PASSWD = new Param("passwd", String.class, "Password", false);    
    public static final DataStoreFactorySpi.Param TIMEOUT = new Param("timeout", Integer.class, "Timeout in ms; default 30000", false);
    public static final DataStoreFactorySpi.Param CRS = new Param("crs", CoordinateReferenceSystem.class, "Coordinate reference system", false);
    
    @Override
    public DataStore createDataStore(Map<String, Serializable> params) throws IOException {
        return createNewDataStore(params);
    }

    @Override
    public DataStore createNewDataStore(Map<String, Serializable> params) throws IOException {
        return new ArcIMSDataStore(
                (URL)params.get(URL.key), 
                (String)params.get(SERVICENAME.key),
                (String)params.get(USER.key),
                (String)params.get(PASSWD.key),
                (Integer)params.get(TIMEOUT.key),
                (CoordinateReferenceSystem)params.get(CRS.key)
        );
    }

    @Override
    public String getDescription() {
        return "ArcIMS data store";
    }

    @Override
    public Param[] getParametersInfo() {
        return new Param[] { URL, SERVICENAME, USER, PASSWD, TIMEOUT, CRS };
    }    
}
