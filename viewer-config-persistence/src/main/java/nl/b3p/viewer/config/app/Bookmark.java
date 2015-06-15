/*
 * Copyright (C) 2012-2013 B3Partners B.V.
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

import java.io.Serializable;
import java.util.Date;
import javax.persistence.*;
import net.sourceforge.stripes.action.ActionBeanContext;
import nl.b3p.viewer.config.app.Bookmark.BookmarkPK;
import org.hibernate.annotations.GenericGenerator;

/**
 *
 * @author Matthijs Laan
 */
@Entity
@IdClass(BookmarkPK.class)
public class Bookmark {
    
    @Id
    @GeneratedValue(generator="uuid")
    @GenericGenerator(name="uuid", strategy="uuid")
    private String code;
    
    @Lob
    @Basic(optional=false)
    @org.hibernate.annotations.Type(type="org.hibernate.type.StringClobType")
    private String params;
    
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;
    
    private String createdBy;

    @Id
    @ManyToOne
    private Application application;

    @ManyToOne
    private Application basedOnApplication;

    //<editor-fold defaultstate="collapsed" desc="getters & setters">
    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getParams() {
        return params;
    }

    public void setParams(String params) {
        this.params = params;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public Application getApplication() {
        return application;
    }

    public void setApplication(Application application) {
        this.application = application;
    }

    public Application getBasedOnApplication() {
        return basedOnApplication;
    }

    public void setBasedOnApplication(Application basedOnApplication) {
        this.basedOnApplication = basedOnApplication;
    }
    // </editor-fold>

    @Override
    public Bookmark clone(){
        Bookmark clone = new Bookmark();
        clone.setCode(code);
        clone.setCreatedAt(new Date());
        clone.setParams(params);
        return clone;
    }

    public static String createCreatedBy(ActionBeanContext context){
        String createdBy = "IP: " + context.getRequest().getRemoteAddr();
        if (context.getRequest().getHeader("x-forwarded-for") != null) {
            createdBy = "IP: " + context.getRequest().getHeader("x-forwarded-for") + "(proxy " + createdBy + ")";
        }
        if (context.getRequest().getRemoteUser() != null) {
            createdBy += ", user: " + context.getRequest().getRemoteUser();
        }
        return createdBy;
    }

    public static class BookmarkPK implements Serializable{
          private String code;
          private Application application;

        public BookmarkPK() {
        }

        public BookmarkPK(String code, Application application) {
            this.code = code;
            this.application = application;
        }

        public String getCode() {
            return code;
        }

        public void setCode(String code) {
            this.code = code;
        }

        public Application getApplication() {
            return application;
        }

        public void setApplication(Application application) {
            this.application = application;
        }

        @Override
        public int hashCode() {
            int hash = this.application.getId().intValue() + code.hashCode();
            return hash;
        }

        @Override
        public boolean equals(Object obj) {
            if (obj == null ) {
                return false;
            }
            if (getClass() != obj.getClass()) {
                return false;
            }

            final BookmarkPK other = (BookmarkPK) obj;
            if(other.getApplication() == null){
                return this.application == null && this.code.equals(other.getCode());
            }
            return other.getCode().equals(code) && this.getApplication().getId().equals(other.getApplication().getId());
        }
        
    }
}
