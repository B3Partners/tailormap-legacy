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
package nl.b3p.viewer.config.services;

import java.util.HashSet;
import java.util.Set;
import javax.persistence.Basic;
import javax.persistence.Column;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Lob;

/**
 * Belonging to GeoService, the configuration of a style library available for
 * use for this service's layers.
 * 
 * @author Matthijs Laan
 */
@Entity
public class StyleLibrary {
    @Id
    private Long id;    
    
    /**
     * Title for display/selection.
     */
    @Basic(optional=false)
    private String title;
    
    private boolean defaultStyle;
    
    private boolean valid;
    
    @Column(length=1000)
    private String externalUrl;
    
    @Lob
    @org.hibernate.annotations.Type(type="org.hibernate.type.StringClobType")    
    private String sldBody;
    
    @ElementCollection
    @Column(name="layer_name")    
    private Set<String> namedLayers = new HashSet<String>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public boolean isDefaultStyle() {
        return defaultStyle;
    }

    public void setDefaultStyle(boolean defaultStyle) {
        this.defaultStyle = defaultStyle;
    }
    
    public String getExternalUrl() {
        return externalUrl;
    }

    public void setExternalUrl(String externalUrl) {
        this.externalUrl = externalUrl;
    }

    public String getSldBody() {
        return sldBody;
    }

    public void setSldBody(String sldBody) {
        this.sldBody = sldBody;
    }

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public Set<String> getNamedLayers() {
        return namedLayers;
    }

    public void setNamedLayers(Set<String> namedLayers) {
        this.namedLayers = namedLayers;
    }
       
}
