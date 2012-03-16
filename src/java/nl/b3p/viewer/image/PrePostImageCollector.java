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
package nl.b3p.viewer.image;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.StringReader;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;
import org.apache.commons.httpclient.Credentials;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.UsernamePasswordCredentials;
import org.apache.commons.httpclient.auth.AuthScope;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.httpclient.methods.StringRequestEntity;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.jdom.JDOMException;
import org.xml.sax.InputSource;

/**
 *
 * @author Roy Braam
 */
public class PrePostImageCollector extends ImageCollector{
    private static final Log log = LogFactory.getLog(PrePostImageCollector.class);
    private String body;
    private static XPathExpression xPathImageURL;
    
    static{
        XPathFactory factory = XPathFactory.newInstance();
        XPath xPath =  factory.newXPath();        
        try {
            xPathImageURL = xPath.compile("//ImageURL/text()");
            
        } catch (Exception ex) {
            log.error("Error while creating xpath expr",ex);
        }
    }
    public PrePostImageCollector(CombineImageUrl ciu, int maxResponseTime){
        super(ciu,maxResponseTime);
        this.body=ciu.getBody();
    }
    
    @Override
    protected BufferedImage loadImage(String url,String user, String pass) throws IOException, Exception{
        String theUrl=url;
        if (this.getBody()!=null){
            PostMethod method = null;
            HttpClient client = new HttpClient();
            client.getHttpConnectionManager().
                    getParams().setConnectionTimeout(getMaxResponseTime());
            try{
                if (user != null && pass != null) {
                    client.getParams().setAuthenticationPreemptive(true);
                    Credentials defaultcreds = new UsernamePasswordCredentials(user, pass);
                    AuthScope authScope = new AuthScope(host, port);
                    client.getState().setCredentials(authScope, defaultcreds);
                }
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

    private String getUrlFromXML(String returnXML) throws XPathExpressionException, JDOMException, IOException {
        String s=xPathImageURL.evaluate(new InputSource(new StringReader(returnXML)));
        if (s!=null && s.length() ==0){
            s=null;
        }
        return s;        
    }
}
