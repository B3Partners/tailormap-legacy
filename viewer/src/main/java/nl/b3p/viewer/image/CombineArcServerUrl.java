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

import java.util.ArrayList;
import java.util.List;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathFactory;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

/**
 *
 * @author Roy Braam
 */
public class CombineArcServerUrl extends CombineXMLBodyUrl{
    private static final Log log = LogFactory.getLog(CombineArcServerUrl.class);
    
    private static XPathExpression xPathExtent;
    private static XPathExpression xPathImageDisplay;
    
    static{
        XPathFactory factory = XPathFactory.newInstance();
        XPath xPath =  factory.newXPath();        
        try {
            xPathExtent = xPath.compile("//MapArea/Extent");
            xPathImageDisplay = xPath.compile("//ImageDisplay");
            
        } catch (Exception ex) {
            log.error("Error while creating xpath expr",ex);
        }
    }
    
    public CombineArcServerUrl(){
        super();
    }

    private CombineArcServerUrl(CombineArcServerUrl casu) {
        super(casu);
    }
    /**
     * Create a new CombineImageUrl with the given values In this implementation
     * the body is changed.
     *
     * @param imbbox bbox of image
     * @return new clone of this CombineImageUrl but with changed values.
     * @see CombineImageUrl#calculateNewUrl(nl.b3p.viewer.image.ImageBbox)
     */ 
    @Override
    public List<CombineImageUrl> calculateNewUrl(ImageBbox imbbox) {
        Integer width = imbbox.getWidth();
        Integer height = imbbox.getHeight();
        Bbox bbox = imbbox.getBbox();
        
        CombineArcServerUrl ciu = new CombineArcServerUrl(this);
        try{
            Document doc=bodyAsDocument();
            Node root=doc.getFirstChild();
            //change the bbox
            Node extent = (Node) xPathExtent.evaluate(root,XPathConstants.NODE);
            NodeList nl = extent.getChildNodes();
            for (int i=0; i < nl.getLength(); i++){
                Node child = nl.item(i);
                if ("XMin".equals(child.getLocalName())){
                    child.setTextContent(""+bbox.getMinx());
                }else if ("YMin".equals(child.getLocalName())){
                    child.setTextContent(""+bbox.getMiny());
                }else if ("XMax".equals(child.getLocalName())){
                    child.setTextContent(""+bbox.getMaxx());
                }else if ("YMax".equals(child.getLocalName())){
                    child.setTextContent(""+bbox.getMaxy());
                }
            }
            //image size
            Node imageSize = (Node) xPathImageDisplay.evaluate(root,XPathConstants.NODE);
            nl=imageSize.getChildNodes();
            for (int i=0; i < nl.getLength(); i ++){
                Node child = nl.item(i);
                if ("ImageHeight".equals(child.getLocalName())){
                    child.setTextContent(height.toString());
                }else if ("ImageWidth".equals(child.getLocalName())){
                    child.setTextContent(width.toString());
                }
            }            
            ciu.setBody(doc);
        }catch(Exception e){
            log.warn("Error while changing body fragment", e);
        }
        
        List<CombineImageUrl> list= new ArrayList<CombineImageUrl>();
        list.add(ciu);
        return list;
    }
    
}
