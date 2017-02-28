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

import java.util.List;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElement;

/**
 *
 * @author matthijsln
 */
@XmlAccessorType(XmlAccessType.FIELD)
public class AxlFClass {
    public static final String TYPE_POINT = "point";
    public static final String TYPE_POLYGON = "polygon";
    public static final String TYPE_LINE = "line";
    
    @XmlAttribute
    private String type;
    
    @XmlElement(name="ENVELOPE")
    private AxlEnvelope envelope;
    
    @XmlElement(name="FIELD")
    private List<AxlFieldInfo> fields;

    public AxlEnvelope getEnvelope() {
        return envelope;
    }

    public void setEnvelope(AxlEnvelope envelope) {
        this.envelope = envelope;
    }

    public List<AxlFieldInfo> getFields() {
        return fields;
    }

    public void setFields(List<AxlFieldInfo> fields) {
        this.fields = fields;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}
