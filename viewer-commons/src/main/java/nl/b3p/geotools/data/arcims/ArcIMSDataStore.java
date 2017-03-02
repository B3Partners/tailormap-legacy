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
package nl.b3p.geotools.data.arcims;

import java.io.IOException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import org.geotools.data.ows.HTTPClient;
import org.geotools.data.ows.SimpleHttpClient;
import org.geotools.data.store.ContentDataStore;
import org.geotools.data.store.ContentEntry;
import org.geotools.data.store.ContentFeatureSource;
import org.geotools.feature.NameImpl;
import org.opengis.feature.type.Name;
import nl.b3p.geotools.data.arcims.axl.AxlLayerInfo;
import org.opengis.referencing.crs.CoordinateReferenceSystem;

/**
 *
 * @author Matthijs Laan
 */
public class ArcIMSDataStore extends ContentDataStore {
    
    private URL url;
    private String serviceName;
    private String user;
    private String passwd;
    private Integer timeout;
    private CoordinateReferenceSystem crs;
    
    private ArcIMSServer arcims;
    
    private List<Name> typeNames;
    
    public ArcIMSDataStore(URL url, String serviceName) {
        this(url, serviceName, null, null, null, null);
    }
    
    public ArcIMSDataStore(URL url, String serviceName, String user, String passwd, Integer timeout, CoordinateReferenceSystem crs) {
        this.url = url;
        this.serviceName = serviceName;
        this.user = user;
        this.passwd = passwd;
        this.timeout = timeout;
        this.crs = crs;
    }

    public ArcIMSServer getArcIMSServer() throws IOException {
        if(arcims == null) {
            HTTPClient client = new SimpleHttpClient();
            client.setUser(user);
            client.setPassword(passwd);
            if(timeout != null) {
                client.setConnectTimeout(timeout);
                client.setReadTimeout(timeout);
            }

            try {
                arcims = new ArcIMSServer(url, serviceName, client);
            } catch(IOException e) {
                throw e;
            } catch(Exception e) {
                throw new IOException(e);
            }
        }
        return arcims;
    }
    
    @Override
    protected List<Name> createTypeNames() throws IOException {
        if(typeNames == null) {
            getArcIMSServer();

            typeNames = new ArrayList<Name>();
            for(AxlLayerInfo l: arcims.getAxlServiceInfo().getLayers()) {
                if(AxlLayerInfo.TYPE_FEATURECLASS.equals(l.getType())) {
                    typeNames.add(new NameImpl(l.getId()));
                }
            }
        }
        return typeNames;
    }

    @Override
    protected ContentFeatureSource createFeatureSource(ContentEntry ce) throws IOException {
        return new ArcIMSFeatureSource(ce);
    }
    
    public AxlLayerInfo getAxlLayerInfo(String layer) throws IOException {
        getArcIMSServer();
        
        for(AxlLayerInfo l: arcims.getAxlServiceInfo().getLayers()) {
            if(layer.equals(l.getId())) {
                return l;
            }
        }
        return null;
    }
    
    public CoordinateReferenceSystem getCRS() {
        return crs;
    }
    
    @Override
    public String toString() {
        return "ArcIMSDataStore URL=" + url.toString() + " ServiceName=" + serviceName;
    }
}
