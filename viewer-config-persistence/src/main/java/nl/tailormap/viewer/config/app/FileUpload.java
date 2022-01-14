/*
 * Copyright (C) 2018-2021 B3Partners B.V.
 */
package nl.tailormap.viewer.config.app;

import nl.tailormap.viewer.config.services.SimpleFeatureType;
import org.json.JSONObject;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import java.util.Date;

/**
 *
 * @author Meine Toonen
 */
@Entity
public class FileUpload {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String location;

    @ManyToOne
    @JoinColumn(name = "sft")
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
        obj.put("mimetype", mimetype);
        obj.put("id", id);
        obj.put("sft", sft.getId());
        return obj;
    }
}
