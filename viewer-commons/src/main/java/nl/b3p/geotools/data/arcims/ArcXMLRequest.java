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
import java.io.OutputStream;
import java.net.URL;
import javax.xml.bind.JAXBException;
import org.geotools.data.ows.AbstractRequest;
import org.geotools.data.ows.HTTPResponse;
import org.geotools.data.ows.Response;
import org.geotools.ows.ServiceException;
import nl.b3p.geotools.data.arcims.axl.*;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 *
 * @author matthijsln
 */
public class ArcXMLRequest extends AbstractRequest {
    private static final Log log = LogFactory.getLog(ArcXMLRequest.class);

    AxlRequest request;
    
    public ArcXMLRequest(URL onlineResource, String serviceName, AxlRequest request) {
        super(onlineResource, new java.util.Properties());
        this.request = request;
        if(serviceName != null) {
            properties.setProperty("ServiceName", serviceName);
        }
        properties.setProperty("ClientVersion", "4.0");
        properties.setProperty("Form", "false");
        properties.setProperty("Encode", "false");
    }
        
    @Override
    protected void initRequest() {
    }

    @Override
    protected void initService() {
    }

    @Override
    protected void initVersion() {
    }
    
    @Override
    protected String processKey(String key) {
        if("SERVICENAME".equals(key)) {
            return "ServiceName";
        } else {
            return key;
        }
    }
    
    @Override
    public void performPostOutput(OutputStream out) throws IOException {      
        try {
            ArcXML.getJaxbContext().createMarshaller().marshal(new ArcXML(request), out);
        } catch (JAXBException ex) {
            throw new IOException("Cannot marshal request", ex);
        }
    }

    @Override
    public Response createResponse(HTTPResponse httpr) throws ServiceException, IOException {
        throw new UnsupportedOperationException("Not supported");
    }
    
    public AxlResponse parseResponse(HTTPResponse httpr) throws Exception {
        long startTime = System.currentTimeMillis();
        ArcXML axl = (ArcXML)ArcXML.getJaxbContext().createUnmarshaller().unmarshal(httpr.getResponseStream());
        if(log.isDebugEnabled()) {
            log.debug("ArcXML unmarshal time (includes server time): " + (System.currentTimeMillis() - startTime) + " ms");
        }
        
        return axl.getResponse();
    }
}
