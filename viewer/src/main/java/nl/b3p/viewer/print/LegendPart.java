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
package nl.b3p.viewer.print;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author Roy Braam
 */

@XmlRootElement(name="legendPart")
@XmlType(propOrder = {"label","url", "width", "height","serviceId"})
public class LegendPart {
    private String label;
    private String url;
    private Integer width, height;
    private Integer serviceId;

    LegendPart(){}
    LegendPart(JSONObject json) throws JSONException {
        if (json.has("label")){
            this.setLabel(json.getString("label"));
        }
        if (json.has("url")){
            this.setUrl(json.getString("url"));
        }
        if (json.has("serviceId")){
            setServiceId(json.getInt("serviceId"));
        }
    }

    @XmlElement(name="label")
    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    @XmlElement(name="url")
    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public Integer getWidth() {
        return width;
    }

    public void setWidth(Integer width) {
        this.width = width;
    }

    public Integer getHeight() {
        return height;
    }

    public void setHeight(Integer height) {
        this.height = height;
    }

    public Integer getServiceId() {
        return serviceId;
    }

    public void setServiceId(Integer serviceId) {
        this.serviceId = serviceId;
    }
}
