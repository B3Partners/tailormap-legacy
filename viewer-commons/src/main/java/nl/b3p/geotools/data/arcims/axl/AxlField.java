/*
 * Copyright (C) 2012-2013 B3Partners B.V.
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
package nl.b3p.geotools.data.arcims.axl;

import org.locationtech.jts.geom.*;
import java.io.IOException;
import java.math.BigInteger;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import javax.xml.bind.Unmarshaller;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlTransient;
import nl.b3p.geotools.data.arcims.ArcXMLUtils;

/**
 *
 * @author matthijsln
 */
@XmlAccessorType(XmlAccessType.FIELD)
public class AxlField {
    public static final int TYPE_ROW_ID        = -99;
    public static final int TYPE_SHAPE         = -98;
    public static final int TYPE_BOOLEAN       = -7;
    public static final int TYPE_BIG_INTEGER   = -5; 
    public static final int TYPE_CHAR          = 1;
    public static final int TYPE_INTEGER       = 4;
    public static final int TYPE_SMALL_INTEGER = 5;
    public static final int TYPE_FLOAT         = 6;
    public static final int TYPE_DOUBLE        = 8;
    public static final int TYPE_STRING        = 12;
    public static final int TYPE_DATE          = 91;
   
    @XmlAttribute
    private String name;
    
    @XmlAttribute
    private String value;
    
    @XmlTransient
    private AxlFeature feature;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }
    
    public static DateFormat createDateFormat() {
        return new SimpleDateFormat("{ts 'YYYY-MM-dd HH:mm:ss'}");
    }
    
    public Object getConvertedValue(Class binding, GeometryFactory geometryFactory) throws ParseException, IOException {
        if(value == null) {
            return null;
        }
        if(binding.equals(String.class)) {
            return value;
        } else if(binding.equals(Boolean.class)) {
            return "true".equals(value);
        }
        
        // For the following bindings empty string is null
        if(value.trim().length() == 0) {
            return null;
        }
        
        if(binding.equals(Integer.class)) {
            return Integer.parseInt(value);
        } else if(binding.equals(BigInteger.class)) {
            return new BigInteger(value);
        } else if(binding.equals(Character.class)) {
            return value.charAt(0);
        } else if(binding.equals(Float.class)) {
            return Float.parseFloat(value.replace(',', '.'));
        } else if(binding.equals(Double.class)) {
            return Double.parseDouble(value.replace(',', '.'));
        } else if(binding.equals(Date.class)) {
            return new Date(Long.parseLong(value));
        } else if(binding.getName().startsWith("org.locationtech.jts.geom.")) {
            
            if(this.feature == null) {
                return null;
            } else {
                return ArcXMLUtils.convertToJTSGeometry(feature.getGeometry(), geometryFactory);
            }
        } 
           
        return null;
    }
    
    void afterUnmarshal(Unmarshaller u, Object parent) {
        if(parent instanceof AxlFeature) {
            this.feature = (AxlFeature)parent;
        }
    }
}
