/*
 * Copyright (C) 2011 B3Partners B.V.
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
package nl.b3p.viewer.config.services;

import javax.persistence.Embeddable;
import org.geotools.data.ows.CRSEnvelope;
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
}
