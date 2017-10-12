/*
 * Copyright (C) 2012-2016 B3Partners B.V.
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
package nl.b3p.viewer.image;

import java.awt.image.BufferedImage;
import java.io.IOException;
import javax.servlet.http.HttpServletRequest;
import javax.xml.xpath.XPathExpressionException;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.httpclient.methods.StringRequestEntity;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.jdom2.JDOMException;

/**
 * Class that gets the image in 2 steps. First sumbit the body and then recieve the url from the response.
 * Get the image with the url in the response.
 * @author Roy Braam
 */
public abstract class PrePostImageCollector extends ImageCollector{
    private static final Log log = LogFactory.getLog(PrePostImageCollector.class);
    private String body;
    
    public PrePostImageCollector(CombineImageUrl ciu, int maxResponseTime, HttpClient client, HttpServletRequest req){
        super(ciu,maxResponseTime,client, req);
        this.body=ciu.getBody();
    }
    
    @Override
    protected BufferedImage loadImage(String url,String user, String pass) throws IOException, Exception{
        String theUrl=url;
        if (this.getBody()!=null){
            PostMethod method = null;            
            try{                
                method=new PostMethod(url);
                method.setRequestEntity(new StringRequestEntity(this.getBody()));
                int statusCode = client.executeMethod(method);
                if (statusCode != HttpStatus.SC_OK) {
                    throw new Exception("Error connecting to server. HTTP status code: " + statusCode);
                }
                String returnXML=method.getResponseBodyAsString();
                theUrl= getUrlFromXML(returnXML);
                if (theUrl==null && returnXML!=null){
                    throw new Exception("Error getting the correct url. Server returned: \n"+returnXML);
                }
            }finally{
                if (method!=null){
                    method.releaseConnection();
                }
            }
            
        }
        return super.loadImage(theUrl, user, pass);
    }
    
    //<editor-fold defaultstate="collapsed" desc="Getters and Setters">
    public String getBody() {
        return body;
    }
    
    public void setBody(String body) {
        this.body = body;
    }
    //</editor-fold>
    /**
     * Recieve the url from the xml.
     * @param returnXML The xml that is recieved bij doing a post request
     * @return the url.
     * @throws XPathExpressionException if any
     * @throws JDOMException if any
     * @throws IOException if any
     */
    protected abstract String getUrlFromXML(String returnXML) throws XPathExpressionException, JDOMException, IOException;

}
