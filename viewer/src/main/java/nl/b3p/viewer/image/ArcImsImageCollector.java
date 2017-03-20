/*
 * Copyright (C) 2012 B3Partners B.V.
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

import java.io.IOException;
import java.io.StringReader;
import javax.servlet.http.HttpServletRequest;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.jdom.JDOMException;
import org.xml.sax.InputSource;

/**
 * 
 * @author Roy Braam
 */
public class ArcImsImageCollector extends PrePostImageCollector{
    private static final Log log = LogFactory.getLog(ArcImsImageCollector.class);
    
    private static XPathExpression xPathImageURL;
        
    static{
        XPathFactory factory = XPathFactory.newInstance();
        XPath xPath =  factory.newXPath();        
        try {
            xPathImageURL = xPath.compile("//OUTPUT/@url");
        } catch (Exception ex) {
            log.error("Error while creating xpath expr",ex);
        }
    }
    
    public ArcImsImageCollector(CombineImageUrl ciu, int maxResponseTime, HttpClient client, HttpServletRequest req){
        super(ciu,maxResponseTime,client, req);
    }
    
    @Override
    protected String getUrlFromXML(String returnXML) throws XPathExpressionException, JDOMException, IOException {
        String s=xPathImageURL.evaluate(new InputSource(new StringReader(returnXML)));
        if (s!=null && s.length() ==0){
            s=null;
        }
        return s;    
    }
}
