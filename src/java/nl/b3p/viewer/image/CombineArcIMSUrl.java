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

import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathFactory;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.w3c.dom.Document;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;

/**
 *
 * @author Roy Braam
 */
public class CombineArcIMSUrl extends CombineXMLBodyUrl{
    
    private static final Log log = LogFactory.getLog(CombineArcServerUrl.class);
    
    private static XPathExpression xPathEnvelope;
    private static XPathExpression xPathImageSize;
    
    static{
        XPathFactory factory = XPathFactory.newInstance();
        XPath xPath =  factory.newXPath();        
        try {
            xPathEnvelope = xPath.compile("//ENVELOPE");
            xPathImageSize = xPath.compile("//IMAGESIZE");
            
        } catch (Exception ex) {
            log.error("Error while creating xpath expr",ex);
        }
    }
    /**
     * Create a new CombineImageUrl with the given values
     * In this implementation the body is changed.
     * @param width width
     * @param height height
     * @param bbox bbox
     * @return new clone of this CombineImageUrl but with changed values.
     * @see CombineImageUrl#calculateNewUrl(java.lang.Integer, java.lang.Integer, nl.b3p.viewer.image.Bbox) 
     */    
    @Override
    public CombineImageUrl calculateNewUrl(Integer width, Integer height, Bbox bbox) {
        CombineArcIMSUrl ciu = new CombineArcIMSUrl();
        ciu=(CombineArcIMSUrl)this.clone(ciu);        
        try{
            Document doc=bodyAsDocument();
            Node root=doc.getFirstChild();
            //change the bbox
            Node envelope = (Node) xPathEnvelope.evaluate(root,XPathConstants.NODE);
            NamedNodeMap nnm=envelope.getAttributes();
            nnm.getNamedItem("minx").setNodeValue(""+bbox.getMinx());
            nnm.getNamedItem("maxx").setNodeValue(""+bbox.getMaxx());
            nnm.getNamedItem("miny").setNodeValue(""+bbox.getMiny());
            nnm.getNamedItem("maxy").setNodeValue(""+bbox.getMaxy());
            //
            Node imageSize = (Node) xPathImageSize.evaluate(root,XPathConstants.NODE);
            nnm=imageSize.getAttributes();
            nnm.getNamedItem("width").setNodeValue(width.toString());
            nnm.getNamedItem("height").setNodeValue(height.toString());
            
            ciu.setBody(doc);
        }catch(Exception e){
            log.warn("Error while changing body fragment", e);
        }
        return ciu;
        
        
    }
}
