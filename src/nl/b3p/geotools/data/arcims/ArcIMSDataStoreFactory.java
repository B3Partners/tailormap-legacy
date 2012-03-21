/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.b3p.geotools.data.arcims;

import java.io.IOException;
import java.io.Serializable;
import java.net.URL;
import java.util.Map;
import org.geotools.data.AbstractDataStoreFactory;
import org.geotools.data.DataStore;
import org.geotools.data.DataStoreFactorySpi;

/**
 *
 * @author Matthijs Laan
 */
public class ArcIMSDataStoreFactory extends AbstractDataStoreFactory {
    
    public static final DataStoreFactorySpi.Param URL = new Param("url", URL.class, "URL to a ArcIMS service");
    public static final DataStoreFactorySpi.Param SERVICENAME = new Param("service_name", String.class, "ServiceName parameter if not in URL", false);    
    public static final DataStoreFactorySpi.Param USER = new Param("user", String.class, "Username", false);    
    public static final DataStoreFactorySpi.Param PASSWD = new Param("passwd", String.class, "Password", false);    
    public static final DataStoreFactorySpi.Param TIMEOUT = new Param("timeout", Integer.class, "Timeout in ms; default 30000", false);
    
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
                (Integer)params.get(TIMEOUT.key));
    }

    @Override
    public String getDescription() {
        return "ArcIMS data store";
    }

    @Override
    public Param[] getParametersInfo() {
        return new Param[] { URL, SERVICENAME, USER, PASSWD, TIMEOUT };
    }    
}
