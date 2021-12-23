/*
 * Copyright (C) 2012-2021 B3Partners B.V.
 */
package nl.tailormap.viewer.config.app;

import org.apache.commons.io.IOUtils;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Lob;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Date;

/**
 *
 * @author Matthijs Laan
 */
@Entity
@Table(name="resource_")
public class Resource {
    
    @Id
    private String name;

    private String contentType;
    
    @Column(nullable=false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date modified;

    @Column(nullable=false, name="size_")
    private long size;

    @Column(nullable=false, name="data_")
    @Lob
    private byte[] data;

    //<editor-fold defaultstate="collapsed" desc="getters en setters">
    public byte[] getData() {
        return data;
    }
    
    public void setData(byte[] data) {
        this.data = data;
    }
   
    public Date getModified() {
        return modified;
    }
    
    public void setModified(Date modified) {
        this.modified = modified;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public long getSize() {
        return size;
    }
    
    public void setSize(long size) {
        this.size = size;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }
    //</editor-fold>
    
    public void setDataContent(InputStream data, long size) throws IOException {
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        IOUtils.copy(data, bos);
        this.data = bos.toByteArray();
    }
}
