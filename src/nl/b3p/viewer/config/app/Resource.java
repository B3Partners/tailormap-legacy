/*
 * Copyright (C) 2012 B3Partners B.V.
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
package nl.b3p.viewer.config.app;

import java.io.InputStream;
import java.sql.Blob;
import java.util.Date;
import javax.persistence.*;
import org.hibernate.Session;
import org.stripesstuff.stripersist.Stripersist;

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
    private java.sql.Blob data;

    //<editor-fold defaultstate="collapsed" desc="getters en setters">
    public Blob getData() {
        return data;
    }
    
    public void setData(Blob data) {
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
    
    public void setDataContent(InputStream data, long size) {
        EntityManager em = Stripersist.getEntityManager();
        this.data = ((Session)em.getDelegate()).getLobHelper().createBlob(data, size);
    }

    public void setDataContent(byte[] data) {
        EntityManager em = Stripersist.getEntityManager();
        this.data = ((Session)em.getDelegate()).getLobHelper().createBlob(data);
    }
}
