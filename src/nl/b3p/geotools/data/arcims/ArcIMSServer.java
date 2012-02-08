/*
 * Copyright (C) 2012 B3Partners B.V.
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
package nl.b3p.geotools.data.arcims;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.URI;
import java.net.URL;
import java.util.Collections;
import java.util.Set;
import org.geotools.data.ServiceInfo;
import org.geotools.data.ows.HTTPClient;
import org.geotools.data.ows.HTTPResponse;
import org.geotools.data.ows.SimpleHttpClient;

/**
 *
 * @author Matthijs Laan
 */
public class ArcIMSServer {

    private final URL serverURL;
    private final String serviceName;
    
    private HTTPClient httpClient;
    
    private AxlServiceInfo axlServiceInfo;
    
    private ServiceInfo info = new ArcIMSInfo();

    public String getServiceName() {
        return serviceName;
    }
    
    protected class ArcIMSInfo implements org.geotools.data.ServiceInfo {

        public String getTitle() {
            return serviceName;
        }

        public Set<String> getKeywords() {
            return Collections.EMPTY_SET;
        }

        public String getDescription() {
            return getTitle();
        }

        public URI getPublisher() {
            return null;
        }

        public URI getSchema() {
            return null;
        }

        public URI getSource() {
            return null;
        }
    }

    public ArcIMSServer(final URL serverURL, final String serviceName) throws Exception {
        this(serverURL, serviceName, new SimpleHttpClient());
    }
    
    private static HTTPClient buildHttpClient(final int timeout) throws Exception {
        HTTPClient client = new SimpleHttpClient();
        client.setConnectTimeout(timeout);
        client.setReadTimeout(timeout);
        return client;
    }
    
    public ArcIMSServer(final URL serverURL, final String serviceName, final int timeout) throws Exception {
        this(serverURL, serviceName, buildHttpClient(timeout));
    }
    
    public ArcIMSServer(final URL serverURL, String serviceName, final HTTPClient httpClient) throws Exception {
        if (serverURL == null) {
            throw new NullPointerException("serverURL");
        }
        
        if(serviceName == null) {
            /* try to find ServiceName=thename parameter in url */

            // XXX use httpClient 4.0 URLEncodedUtils or similar
            String q = serverURL.getQuery();
            if(q != null) {
                String needle = "servicename=";
                int i = q.toLowerCase().indexOf(needle);
                if(i != -1) {
                    q = q.substring(i+needle.length());
                    i = q.indexOf("&");
                    if(i != -1) {
                        serviceName = q.substring(0, i);
                    } else {
                        serviceName = q;
                    }
                }
            }        
        }
        
        if (serviceName == null) {
            throw new NullPointerException("serviceName");
        }        
        if (httpClient == null) {
            throw new NullPointerException("httpClient");
        }

        this.serverURL = serverURL;
        this.serviceName = serviceName;
        this.httpClient = httpClient;
               
        loadServiceInfo();
    }

    public ServiceInfo getInfo() {
        return info;
    }
    
    public AxlServiceInfo getAxlServiceInfo() {
        return axlServiceInfo;
    }
    
    protected ArcXMLRequest createRequest(AxlRequest req) {
        return new ArcXMLRequest(serverURL, serviceName, req);
    }
    
    private void loadServiceInfo() throws Exception {
        axlServiceInfo = (AxlServiceInfo) internalIssueRequest(createRequest(new AxlGetServiceInfo()));
    }    
    
    protected AxlResponse internalIssueRequest(ArcXMLRequest request) throws Exception {
        
        final URL finalURL = request.getFinalURL();

        final HTTPResponse httpResponse;

        final String postContentType = request.getPostContentType();

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        request.performPostOutput(out);
        InputStream in = new ByteArrayInputStream(out.toByteArray());

        try {
            httpResponse = httpClient.post(finalURL, in, postContentType);
        } finally {
            in.close();
        }

        return request.parseResponse(httpResponse);
    }

    public static void main(String[] args) throws Exception {     
        ArcIMSServer s = new ArcIMSServer(new URL("http://gisopenbaar.toverijs3.nl/GeoJuli2008/ims"), "ondergrond_lf");
        
        ArcXML axl = new ArcXML();
        axl.responses = Collections.singleton((AxlResponse)s.axlServiceInfo);
        ArcXML.getJaxbContext().createMarshaller().marshal(axl, System.out);
        
        System.out.println("");
    }
}
