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

import java.util.Date;
import javax.persistence.*;
import net.sourceforge.stripes.action.ActionBeanContext;
import org.hibernate.annotations.GenericGenerator;

/**
 *
 * @author Matthijs Laan
 */
@Entity

@Table(
        uniqueConstraints
        = @UniqueConstraint(columnNames = {"code", "application"})
)
public class Bookmark {

    @Id
    private Long id;
    
    private String code;
    
    @Lob
    @Basic(optional=false)
    @org.hibernate.annotations.Type(type="org.hibernate.type.StringClobType")
    private String params;
    
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;
    
    private String createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    private Application application;

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

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
}
