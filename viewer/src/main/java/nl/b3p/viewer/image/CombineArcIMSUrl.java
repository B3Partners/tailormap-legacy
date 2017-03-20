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

    public CombineArcIMSUrl(){
        super();
    }
    private CombineArcIMSUrl(CombineArcIMSUrl caiu) {
        super(caiu);
    }
    /**
     * Create a new CombineImageUrl with the given values. In this
     * implementation the body is changed.
     *
     * @param bbox bbox of image
     * @return new clone of this CombineImageUrl but with changed values.
     * @see CombineImageUrl#calculateNewUrl(nl.b3p.viewer.image.ImageBbox)
     */    
    @Override
    public List<CombineImageUrl> calculateNewUrl(ImageBbox bbox) {
        Integer width = bbox.getWidth();
        Integer height = bbox.getHeight();
        Bbox bb = bbox.getBbox();
        CombineArcIMSUrl ciu = new CombineArcIMSUrl(this);
        try{
            Document doc=bodyAsDocument();
            Node root=doc.getFirstChild();
            //change the bbox
            Node envelope = (Node) xPathEnvelope.evaluate(root,XPathConstants.NODE);
            NamedNodeMap nnm=envelope.getAttributes();
            nnm.getNamedItem("minx").setNodeValue(""+bb.getMinx());
            nnm.getNamedItem("maxx").setNodeValue(""+bb.getMaxx());
            nnm.getNamedItem("miny").setNodeValue(""+bb.getMiny());
            nnm.getNamedItem("maxy").setNodeValue(""+bb.getMaxy());
            //
            Node imageSize = (Node) xPathImageSize.evaluate(root,XPathConstants.NODE);
            nnm=imageSize.getAttributes();
            nnm.getNamedItem("width").setNodeValue(width.toString());
            nnm.getNamedItem("height").setNodeValue(height.toString());
            
            ciu.setBody(doc);
        }catch(Exception e){
            log.warn("Error while changing body fragment", e);
        }
        List<CombineImageUrl> list= new ArrayList<CombineImageUrl>();
        list.add(ciu);
        return list;
    }
}
