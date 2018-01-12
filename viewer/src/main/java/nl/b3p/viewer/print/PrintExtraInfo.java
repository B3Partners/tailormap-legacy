/*
 * Copyright (C) 2014 B3Partners B.V.
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
package nl.b3p.viewer.print;

import java.io.ByteArrayInputStream;
import javax.xml.bind.annotation.XmlAnyElement;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlType;
import javax.xml.parsers.DocumentBuilderFactory;

import org.json.JSONArray;
import org.json.JSONObject;
import org.w3c.dom.Node;

/**
 *
 * @author Meine Toonen
 */
@XmlType//(propOrder = {"className","componentName","info"})
public class PrintExtraInfo {
    
    private String className;
    private String componentName;
    
    private Node info;

    
    @XmlAttribute(name="classname")
    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }
    
    @XmlAttribute(name ="componentname")
    public String getComponentName() {
        return componentName;
    }

    public void setComponentName(String componentName) {
        this.componentName = componentName;
    }
   
    @XmlAnyElement
    public Node getInfo() {
        return info;
    }

    public void setInfoText(JSONObject j) throws Exception {
        this.setInfoObject(j);
    }

    public void setInfoArray(JSONArray j) throws Exception {
        JSONObject properties = new JSONObject();
        properties.put("attr", j);
        this.setInfoObject(properties);
    }

    private void setInfoObject(JSONObject j) throws Exception {
        DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
        JSONObject root = new JSONObject();
        root.put("root", j);
        String s = org.json.XML.toString( root);
        this.info =dbf.newDocumentBuilder().parse(new ByteArrayInputStream(s.getBytes("UTF-8"))).getDocumentElement();
    }
    
}
