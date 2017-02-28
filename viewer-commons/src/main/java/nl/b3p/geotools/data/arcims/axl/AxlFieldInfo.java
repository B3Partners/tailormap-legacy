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

import com.vividsolutions.jts.geom.MultiLineString;
import com.vividsolutions.jts.geom.MultiPoint;
import com.vividsolutions.jts.geom.MultiPolygon;
import java.math.BigInteger;
import java.util.Date;
import javax.xml.bind.annotation.XmlAttribute;

/**
 *
 * @author Matthijs Laan
 */
public class AxlFieldInfo extends AxlField {
    @XmlAttribute
    private Integer type;
    
    @XmlAttribute
    private Integer precision;
    
    @XmlAttribute
    private Integer size;

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
    
}
