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
import javax.xml.bind.annotation.XmlElement;

/**
 *
 * @author matthijsln
 */
@XmlAccessorType(XmlAccessType.FIELD)
public class AxlResponse {
    @XmlElement(name="SERVICEINFO")
    private AxlServiceInfo serviceInfo;
    
    @XmlElement(name="FEATURES")
    private AxlFeatures features;
    
    @XmlElement(name="ERROR")
    private String error;

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public AxlServiceInfo getServiceInfo() {
        return serviceInfo;
    }

    public void setServiceInfo(AxlServiceInfo serviceInfo) {
        this.serviceInfo = serviceInfo;
    }

    public AxlFeatures getFeatures() {
        return features;
    }

    public void setFeatures(AxlFeatures features) {
        this.features = features;
    }       
}
