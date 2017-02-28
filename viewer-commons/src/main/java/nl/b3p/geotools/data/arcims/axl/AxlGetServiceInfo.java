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

import javax.xml.bind.annotation.*;

/**
 *
 * @author matthijsln
 */
@XmlAccessorType(XmlAccessType.FIELD)
public class AxlGetServiceInfo implements AxlRequest {
    
    @XmlAttribute
    private boolean envelope = true;
    
    @XmlAttribute
    private boolean extensions = false;
    
    @XmlAttribute
    private boolean fields = true;
    
    @XmlAttribute
    private boolean renderer = false;

    public boolean isEnvelope() {
        return envelope;
    }

    public void setEnvelope(boolean envelope) {
        this.envelope = envelope;
    }

    public boolean isExtensions() {
        return extensions;
    }

    public void setExtensions(boolean extensions) {
        this.extensions = extensions;
    }

    public boolean isFields() {
        return fields;
    }

    public void setFields(boolean fields) {
        this.fields = fields;
    }

    public boolean isRenderer() {
        return renderer;
    }

    public void setRenderer(boolean renderer) {
        this.renderer = renderer;
    }       
}
