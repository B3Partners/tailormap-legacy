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

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;

/**
 *
 * @author matthijsln
 */
@XmlAccessorType(XmlAccessType.FIELD)
public class AxlEnvelope implements AxlGeometry {
    
    // No Doubles, decimal separator is locale dependant
    
    @XmlAttribute
    private String minx;
    @XmlAttribute
    private String maxx;
    @XmlAttribute
    private String miny;
    @XmlAttribute
    private String maxy;
    
    @XmlAttribute
    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getMaxx() {
        return maxx;
    }

    public void setMaxx(String maxx) {
        this.maxx = maxx;
    }

    public String getMaxy() {
        return maxy;
    }

    public void setMaxy(String maxy) {
        this.maxy = maxy;
    }

    public String getMinx() {
        return minx;
    }

    public void setMinx(String minx) {
        this.minx = minx;
    }

    public String getMiny() {
        return miny;
    }

    public void setMiny(String miny) {
        this.miny = miny;
    }       
}
