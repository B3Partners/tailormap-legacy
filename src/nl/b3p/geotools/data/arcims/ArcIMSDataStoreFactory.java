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
    
    public static final DataStoreFactorySpi.Param PARAM_URL = new Param("url", URL.class, "url to a ArcIMS service");
    public static final DataStoreFactorySpi.Param PARAM_SERVICENAME = new Param("service_name", String.class, "Service name parameter");    
    public static final DataStoreFactorySpi.Param PARAM_USER = new Param("user", String.class, "Username");    
    public static final DataStoreFactorySpi.Param PARAM_PASSWD = new Param("passwd", String.class, "Password");    
    
    @Override
    public DataStore createDataStore(Map<String, Serializable> params) throws IOException {
        return createNewDataStore(params);
    }

    @Override
    public DataStore createNewDataStore(Map<String, Serializable> params) throws IOException {
        return new ArcIMSDataStore(
                (URL)params.get(PARAM_URL.key), 
                (String)params.get(PARAM_SERVICENAME.key),
                (String)params.get(PARAM_USER.key),
                (String)params.get(PARAM_PASSWD.key));
    }

    @Override
    public String getDescription() {
        return "ArcIMS data store";
    }

    @Override
    public Param[] getParametersInfo() {
        return new Param[] { PARAM_URL, PARAM_SERVICENAME };
    }    
}
