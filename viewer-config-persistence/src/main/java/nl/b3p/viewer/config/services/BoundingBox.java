/*
 * Copyright (C) 2011-2013 B3Partners B.V.
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
package nl.b3p.viewer.config.services;

import javax.persistence.Embeddable;
import org.geotools.ows.wms.CRSEnvelope;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author Matthijs Laan
 */
@Embeddable
public class BoundingBox implements Cloneable {
    CoordinateReferenceSystem crs;
    Double minx, miny, maxx, maxy;

    public BoundingBox() {
    }

    public BoundingBox(CRSEnvelope e) {
        crs = new CoordinateReferenceSystem(e.getSRSName());
        minx = e.getMinX();
        miny = e.getMinY();
        maxx = e.getMaxX();
        maxy = e.getMaxY();
    }

    //<editor-fold defaultstate="collapsed" desc="getters and setters">
    public CoordinateReferenceSystem getCrs() {
        return crs;
    }

    public void setCrs(CoordinateReferenceSystem crs) {
        this.crs = crs;
    }

    public Double getMaxx() {
        return maxx;
    }

    public void setMaxx(Double maxx) {
        this.maxx = maxx;
    }

    public Double getMaxy() {
        return maxy;
    }

    public void setMaxy(Double maxy) {
        this.maxy = maxy;
    }

    public Double getMinx() {
        return minx;
    }

    public void setMinx(Double minx) {
        this.minx = minx;
    }

    public Double getMiny() {
        return miny;
    }

    public void setMiny(Double miny) {
        this.miny = miny;
    }
    //</editor-fold>
    /**
     * Set the minx, miny,maxx, maxy with a comma seperated string
     * @param bounds comma seperated coordinates.
     */
    public void setBounds(String bounds){
        String[] bboxTokens = bounds.split(",");
        setMinx(Double.parseDouble(bboxTokens[0].trim()));
        setMiny(Double.parseDouble(bboxTokens[1].trim()));
        setMaxx(Double.parseDouble(bboxTokens[2].trim()));
        setMaxy(Double.parseDouble(bboxTokens[3].trim()));
    }
    
    public static BoundingBox fromJSONObject(JSONObject obj){
        BoundingBox bbox = new BoundingBox();
        bbox.setMaxx(obj.getDouble("maxx"));
        bbox.setMaxy(obj.getDouble("maxy"));
        bbox.setMinx(obj.getDouble("minx"));
        bbox.setMiny(obj.getDouble("miny"));
        return bbox;
    }
    
    public JSONObject toJSONObject() throws JSONException {
        JSONObject o = new JSONObject();
        if(crs != null) {
            o.put("crs", crs.getName());
        }
        o.put("minx", minx);
        o.put("maxx", maxx);
        o.put("miny", miny);
        o.put("maxy", maxy);
        return o;
    }
    
    @Override
    public BoundingBox clone() throws CloneNotSupportedException {
        BoundingBox clone = (BoundingBox)super.clone();
        if(crs != null) {
            crs = (CoordinateReferenceSystem) crs.clone();
        }
        return clone;
    }
    
    @Override
    public int hashCode() {
        int hash = 5;
        hash = 89 * hash + (this.crs != null ? this.crs.hashCode() : 0);
        hash = 89 * hash + (this.minx != null ? this.minx.hashCode() : 0);
        hash = 89 * hash + (this.miny != null ? this.miny.hashCode() : 0);
        hash = 89 * hash + (this.maxx != null ? this.maxx.hashCode() : 0);
        hash = 89 * hash + (this.maxy != null ? this.maxy.hashCode() : 0);
        return hash;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj == null) {
            return false;
        }
        if (getClass() != obj.getClass()) {
            return false;
        }
        final BoundingBox other = (BoundingBox) obj;
        if (this.crs != other.crs && (this.crs == null || !this.crs.equals(other.crs))) {
            return false;
        }
        if (!this.minx.equals(other.minx )&& (this.minx == null || !this.minx.equals(other.minx))) {
            return false;
        }
        if (!this.miny.equals(other.miny) && (this.miny == null || !this.miny.equals(other.miny))) {
            return false;
        }
        if (!this.maxx.equals(other.maxx) && (this.maxx == null || !this.maxx.equals(other.maxx))) {
            return false;
        }
        if (!this.maxy.equals( other.maxy) && (this.maxy == null || !this.maxy.equals(other.maxy))) {
            return false;
        }
        return true;
    }
}
