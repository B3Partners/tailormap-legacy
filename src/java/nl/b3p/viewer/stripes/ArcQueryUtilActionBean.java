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
package nl.b3p.viewer.stripes;

import java.io.StringReader;
import java.io.StringWriter;
import javax.xml.bind.JAXBElement;
import javax.xml.bind.Marshaller;
import javax.xml.namespace.QName;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.geotools.data.arcims.FilterToArcXMLSQL;
import nl.b3p.geotools.data.arcims.axl.ArcXML;
import nl.b3p.geotools.data.arcims.axl.AxlSpatialQuery;
import org.geotools.filter.text.cql2.CQL;
import org.json.JSONException;
import org.json.JSONObject;
import org.opengis.filter.Filter;

/**
 *
 * @author Matthijs Laan
 */
@UrlBinding("/action/arcquery")
@StrictBinding
public class ArcQueryUtilActionBean implements ActionBean {

    @Validate
    private String cql;
    
    private ActionBeanContext context;

    public ActionBeanContext getContext() {
        return context;
    }

    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public String getCql() {
        return cql;
    }

    public void setCql(String cql) {
        this.cql = cql;
    }

    public Resolution arcXML() throws JSONException {
        JSONObject json = new JSONObject();
        
        try {
            AxlSpatialQuery aq = new AxlSpatialQuery();
            FilterToArcXMLSQL visitor = new FilterToArcXMLSQL(aq);

            Filter filter = CQL.toFilter(cql);
            String where = visitor.encodeToString(filter);
            if(where.trim().length() > 0 && !where.trim().equals("1=1")) {
                aq.setWhere(where);
            }
        
            StringWriter sw = new StringWriter();
            
            Marshaller m = ArcXML.getJaxbContext().createMarshaller();
            m.setProperty(javax.xml.bind.Marshaller.JAXB_ENCODING, "UTF-8");
            m.setProperty(javax.xml.bind.Marshaller.JAXB_FORMATTED_OUTPUT, Boolean.TRUE);
            m.setProperty(javax.xml.bind.Marshaller.JAXB_FRAGMENT, Boolean.TRUE);
            m.marshal(new JAXBElement(
                new QName(null, "SPATIALQUERY"),
                AxlSpatialQuery.class, aq), sw);
            sw.close();
            
            json.put("SPATIALQUERY", sw.toString());
            json.put("success", true);
        } catch(Exception e) {
            json.put("success", false);
            
            String message = "Fout bij maken spatial query: " + e.toString();
            Throwable cause = e.getCause();
            while(cause != null) {
                message += "; " + cause.toString();
                cause = cause.getCause();
            }
            json.put("error", message);
        }

        return new StreamingResolution("application/json", new StringReader(json.toString(4)));           
    }
}
