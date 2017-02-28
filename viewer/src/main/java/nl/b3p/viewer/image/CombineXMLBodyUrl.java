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

import java.io.IOException;
import java.io.StringReader;
import java.io.StringWriter;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import org.w3c.dom.Document;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

/**
 * A abstract class for implementing the body string as a xml (document).
 *
 * @author Roy Braam
 */
public abstract class CombineXMLBodyUrl extends CombineImageUrl{
    
    public CombineXMLBodyUrl(){}
    
    public CombineXMLBodyUrl(CombineXMLBodyUrl cxu){
        super(cxu);
    }
        
    /**
     * Returns the body as a xml document.
     *
     * @return the body as document
     * @throws ParserConfigurationException if any
     * @throws SAXException if any
     * @throws IOException if any
     */
    protected Document bodyAsDocument() throws ParserConfigurationException, SAXException, IOException{
        DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
        dbf.setNamespaceAware(true);
        DocumentBuilder db = dbf.newDocumentBuilder();
        Document doc = db.parse(new InputSource(new StringReader(getBody())));
        return doc;
    }
    /**
     * Set the body with the given doc. Its transforms the document to a string.
     *
     * @param doc the Document that's the new body
     * @throws TransformerConfigurationException if any
     * @throws TransformerException if any
     */
    protected void setBody(Document doc) throws TransformerConfigurationException, TransformerException{
        DOMSource domSource = new DOMSource(doc);
        StringWriter writer = new StringWriter();
        StreamResult result = new StreamResult(writer);
        TransformerFactory tf = TransformerFactory.newInstance();
        Transformer transformer = tf.newTransformer();
        transformer.transform(domSource, result);
        this.setBody(writer.toString());
    }
}
