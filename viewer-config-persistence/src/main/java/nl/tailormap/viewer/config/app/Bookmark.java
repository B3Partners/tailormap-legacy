/*
 * Copyright (C) 2012-2021 B3Partners B.V.
 */
package nl.tailormap.viewer.config.app;


import org.hibernate.annotations.Type;

import javax.persistence.Basic;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.Lob;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.persistence.UniqueConstraint;
import java.util.Date;

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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String code;
    
    @Lob
    @Basic(optional=false)
    @Type(type = "org.hibernate.type.TextType")
    private String params;
    
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;
    
    private String createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application")
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
}
