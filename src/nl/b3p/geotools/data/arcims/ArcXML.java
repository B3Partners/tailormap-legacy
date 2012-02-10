/*
 * Copyright (C) 2012 Expression organization is undefined on line 4, column 61 in Templates/Licenses/license-gpl30.txt.
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
package nl.b3p.geotools.data.arcims;

import java.util.Collections;
import java.util.Set;
import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.annotation.*;

/**
 *
 * @author matthijsln
 */
@XmlRootElement(name="ARCXML")
@XmlAccessorType(XmlAccessType.FIELD)
public class ArcXML {
    private static JAXBContext jaxbContext = null;
    
    static {
        try {
            jaxbContext = JAXBContext.newInstance(ArcXML.class);
        } catch(JAXBException e) {
            e.printStackTrace();
        }
    }    
    
    @XmlAttribute
    protected String version = "1.1";
    
    @XmlElementWrapper(name="REQUEST")
    @XmlElements({
        @XmlElement(name = "GET_SERVICE_INFO", type = AxlGetServiceInfo.class),
        @XmlElement(name = "GET_FEATURES", type = AxlGetFeatures.class)
    })
    protected Set<AxlRequest> requests;
    
    @XmlElement(name="RESPONSE")
    protected AxlResponse response;
    
    public ArcXML() {
    }
    
    public ArcXML(AxlRequest request) {
        requests = Collections.singleton(request);
    }
    
    public AxlResponse getResponse() {
        return response;
    }

    public static JAXBContext getJaxbContext() {
        return jaxbContext;
    }
}
