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

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;

/**
 *
 * @author matthijsln
 */
@XmlAccessorType(XmlAccessType.FIELD)
public class AxlField {
    public static String TYPE_ROW_ID        = "-99";
    public static String TYPE_SHAPE         = "-98";
    public static String TYPE_BOOLEAN       = "-7";
    public static String TYPE_BIG_INTEGER   = "-5"; 
    public static String TYPE_CHAR          = "1";
    public static String TYPE_INTEGER       = "4";
    public static String TYPE_SMALL_INTEGER = "5";
    public static String TYPE_FLOAT         = "6";
    public static String TYPE_DOUBLE        = "8";
    public static String TYPE_STRING        = "12";
    public static String TYPE_DATE          = "91";
   
    @XmlAttribute
    private String name;
    
    @XmlAttribute
    private String type;
    
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

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}
