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

import com.vividsolutions.jts.geom.MultiLineString;
import com.vividsolutions.jts.geom.MultiPoint;
import com.vividsolutions.jts.geom.MultiPolygon;
import java.math.BigInteger;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;

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
    
    public static final String AXL_ID = "#ID#";
    public static final String AXL_SHAPE = "#SHAPE#";
   
    @XmlAttribute
    private String name;
    
    @XmlAttribute
    private Integer type;
    
    @XmlAttribute
    private String value;
    
    @XmlAttribute
    private Integer precision;
    
    @XmlAttribute
    private Integer size;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getPrecision() {
        return precision;
    }

    public void setPrecision(Integer precision) {
        this.precision = precision;
    }

    public Integer getSize() {
        return size;
    }

    public void setSize(Integer size) {
        this.size = size;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public Integer getType() {
        return type;
    }

    public void setType(Integer type) {
        this.type = type;
    }
    
    public Class getBinding(AxlFClass fclass) {
        Class binding = String.class;
        switch(type) {
            case AxlField.TYPE_SHAPE:
                String fcType = fclass.getType();
                if(AxlFClass.TYPE_LINE.equals(fcType)) {
                    binding = MultiLineString.class;
                } else if(AxlFClass.TYPE_POINT.equals(fcType)) {
                    binding = MultiPoint.class;
                } else {
                    binding = MultiPolygon.class;
                }

                break;
            case AxlField.TYPE_ROW_ID:
            case AxlField.TYPE_INTEGER:
            case AxlField.TYPE_SMALL_INTEGER:
                binding = Integer.class;
                break;
            case AxlField.TYPE_BOOLEAN:
                binding = Boolean.class;
                break;
            case AxlField.TYPE_BIG_INTEGER:
                binding = BigInteger.class;
                break;
            case AxlField.TYPE_CHAR:
                binding = Character.class;
                break;
            case AxlField.TYPE_FLOAT:
                binding = Float.class;
                break;
            case AxlField.TYPE_DOUBLE:
                binding = Double.class;
                break;
            case AxlField.TYPE_STRING:
                binding = String.class;
                break;
            case AxlField.TYPE_DATE:
                binding = Date.class;
                break;
        }
        return binding;
    }
    
    public static DateFormat createDateFormat() {
        return new SimpleDateFormat("{ts 'YYYY-MM-dd HH:mm:ss'}");
    }
    
    public Object getConvertedValue(Class binding, DateFormat dateFormat) throws ParseException {
        if(value == null) {
            return null;
        }
        if(binding.equals(String.class)) {
            return value;
        } else if(binding.equals(Integer.class)) {
            return Integer.parseInt(value);
        } else if(binding.equals(Boolean.class)) {
            return "true".equals(value);
        } else if(binding.equals(BigInteger.class)) {
            return new BigInteger(value);
        } else if(binding.equals(Character.class)) {
            return value.charAt(0);
        } else if(binding.equals(Float.class)) {
            return Float.parseFloat(value);
        } else if(binding.equals(Double.class)) {
            return Double.parseDouble(value);
        } else if(binding.equals(Date.class)) {
            return dateFormat.parse(value);
        } else if(binding.equals(MultiLineString.class)) {
            return null;
        } else if(binding.equals(MultiPolygon.class)) {
            return null;
        } else if(binding.equals(MultiPoint.class)) {
            return null;
        }
           
        return null;
    }
}
