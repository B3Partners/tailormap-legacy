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
package nl.b3p.viewer.config.app;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Date;
import javax.persistence.*;

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
        org.apache.commons.io.IOUtils.copy(data, bos);
        this.data = bos.toByteArray();
    }
}
