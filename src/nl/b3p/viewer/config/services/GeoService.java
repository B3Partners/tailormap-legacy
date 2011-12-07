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

import java.util.*;
import javax.persistence.*;

/**
 *
 * @author Matthijs Laan
 */
@Entity
@DiscriminatorColumn(name="protocol")
public abstract class GeoService {
    @Id
    private Long id;

    @Column(unique=true)
    @Basic(optional=false)
    private String name;

    @ManyToOne
    private Category category;

    @Basic(optional=false)
    private String url;

    private String username;
    private String password;

    private String metadataUrl;
    private String metadataStylesheetUrl;

    private boolean monitoringEnabled;

    @OneToOne(orphanRemoval=true)
    private Layer topLayer;

    @Embedded
    private Envelope extent;

    @ElementCollection
    @Column(name="keyword")
    private Set<String> keywords = new HashSet<String>();

    //<editor-fold defaultstate="collapsed" desc="getters en setters">
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public Layer getTopLayer() {
        return topLayer;
    }

    public void setTopLayer(Layer topLayer) {
        this.topLayer = topLayer;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Set<String> getKeywords() {
        return keywords;
    }

    public void setKeywords(Set<String> keywords) {
        this.keywords = keywords;
    }

    public String getMetadataStylesheetUrl() {
        return metadataStylesheetUrl;
    }

    public void setMetadataStylesheetUrl(String metadataStylesheetUrl) {
        this.metadataStylesheetUrl = metadataStylesheetUrl;
    }

    public String getMetadataUrl() {
        return metadataUrl;
    }

    public void setMetadataUrl(String metadataUrl) {
        this.metadataUrl = metadataUrl;
    }

    public Envelope getExtent() {
        return extent;
    }

    public void setExtent(Envelope extent) {
        this.extent = extent;
    }

    public boolean isMonitoringEnabled() {
        return monitoringEnabled;
    }

    public void setMonitoringEnabled(boolean monitoringEnabled) {
        this.monitoringEnabled = monitoringEnabled;
    }
    //</editor-fold>
}
