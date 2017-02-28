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
public class AxlGetFeatures implements AxlRequest {
    @XmlAttribute
    private boolean attributes = true;

    @XmlAttribute
    private int beginrecord = 1;
    
    /**
     * Always set to true, we need well-formed XML.
     */
    @XmlAttribute
    private boolean checkesc = true;
    
    /**
     * Always set to true to simplify geometry parsing.
     */
    @XmlAttribute
    private boolean compact = true;
    
    @XmlAttribute
    private boolean envelope = false;
    
    @XmlAttribute
    private Integer featurelimit;
    
    @XmlAttribute
    private boolean geometry = true;
    
    @XmlAttribute
    private boolean globalenvelope = false;
    
    /** 
     * Always set to "newxml" to simplify XML parsing.
     */
    @XmlAttribute
    private String outputmode = "newxml";

    @XmlAttribute
    private boolean skipfeatures = false;
    
    @XmlElement(name="LAYER")
    private AxlLayerInfo layer;
    
    @XmlElements({
        @XmlElement(name = "QUERY", type = AxlQuery.class),
        @XmlElement(name = "SPATIALQUERY", type = AxlSpatialQuery.class)
    })    
    private AxlQuery query;

    public boolean isAttributes() {
        return attributes;
    }

    public void setAttributes(boolean attributes) {
        this.attributes = attributes;
    }

    public int getBeginrecord() {
        return beginrecord;
    }

    public void setBeginrecord(int beginrecord) {
        this.beginrecord = beginrecord;
    }

    public boolean isEnvelope() {
        return envelope;
    }

    public void setEnvelope(boolean envelope) {
        this.envelope = envelope;
    }

    public Integer getFeaturelimit() {
        return featurelimit;
    }

    public void setFeaturelimit(Integer featurelimit) {
        this.featurelimit = featurelimit;
    }

    public boolean isGeometry() {
        return geometry;
    }

    public void setGeometry(boolean geometry) {
        this.geometry = geometry;
    }

    public boolean isGlobalenvelope() {
        return globalenvelope;
    }

    public void setGlobalenvelope(boolean globalenvelope) {
        this.globalenvelope = globalenvelope;
    }

    public boolean isSkipfeatures() {
        return skipfeatures;
    }

    public void setSkipfeatures(boolean skipfeatures) {
        this.skipfeatures = skipfeatures;
    }

    public AxlLayerInfo getLayer() {
        return layer;
    }

    public void setLayer(AxlLayerInfo layer) {
        this.layer = layer;
    }

    public AxlQuery getQuery() {
        return query;
    }

    public void setQuery(AxlQuery query) {
        this.query = query;
    }
}
