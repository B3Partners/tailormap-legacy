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

import javax.xml.bind.annotation.*;

/**
 *
 * @author matthijsln
 */
@XmlAccessorType(XmlAccessType.FIELD)
public class AxlGetFeatures implements AxlRequest {
    public static String OUTPUTMODE_BINARY = "binary";
    public static String OUTPUTMODE_XML    = "xml";
    public static String OUTPUTMODE_NEWXML = "newxml";
    
    @XmlAttribute
    private boolean attributes = true;

    @XmlAttribute
    private int beginrecord = 0;
    
    @XmlAttribute
    private boolean checkesc = false;
    
    @XmlAttribute
    private boolean compact = false;
    
    @XmlAttribute
    private boolean envelope = false;
    
    @XmlAttribute
    private Integer featurelimit;
    
    @XmlAttribute
    private boolean geometry = true;
    
    @XmlAttribute
    private boolean globalenvelope = false;
    
    @XmlAttribute
    private String outputmode = "newxml";

    @XmlAttribute
    private boolean skipfeatures = false;

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

    public boolean isCheckesc() {
        return checkesc;
    }

    public void setCheckesc(boolean checkesc) {
        this.checkesc = checkesc;
    }

    public boolean isCompact() {
        return compact;
    }

    public void setCompact(boolean compact) {
        this.compact = compact;
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

    public String getOutputmode() {
        return outputmode;
    }

    public void setOutputmode(String outputmode) {
        this.outputmode = outputmode;
    }

    public boolean isSkipfeatures() {
        return skipfeatures;
    }

    public void setSkipfeatures(boolean skipfeatures) {
        this.skipfeatures = skipfeatures;
    }
}
