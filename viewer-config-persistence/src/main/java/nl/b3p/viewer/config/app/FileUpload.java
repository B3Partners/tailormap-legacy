/*
 * Copyright (C) 2018 B3Partners B.V.
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
package nl.b3p.viewer.config.app;

import nl.b3p.viewer.config.services.SimpleFeatureType;
import org.json.JSONObject;

import javax.persistence.*;
import java.util.Date;

/**
 *
 * @author Meine Toonen
 */
@Entity
public class FileUpload {

    @Id
    private Long id;

    private String location;

    @ManyToOne
    private SimpleFeatureType sft;

    private String fid;
    
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;
    
    private String createdBy;

    private String filename;

    private String type_;

    private String mimetype;

    //<editor-fold defaultstate="collapsed" desc="getters & setters">

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public SimpleFeatureType getSft() {
        return sft;
    }

    public void setSft(SimpleFeatureType sft) {
        this.sft = sft;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public String getFid() {
        return fid;
    }

    public void setFid(String fid) {
        this.fid = fid;
    }

    public String getType_() {
        return type_;
    }

    public void setType_(String type_) {
        this.type_ = type_;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public String getMimetype() {
        return mimetype;
    }

    public void setMimetype(String mimetype) {
        this.mimetype = mimetype;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    // </editor-fold>


    public String toString(){
        return location;
    }

    public JSONObject toJSON(){
        JSONObject obj = new JSONObject();
        obj.put("filename", filename);
        obj.put("fid", fid);
        obj.put("type", type_);
        obj.put("id", id);
        obj.put("sft", sft.getId());
        return obj;
    }
}
