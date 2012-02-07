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

import java.io.IOException;
import java.util.*;
import javax.persistence.*;

/**
 *
 * @author Matthijs Laan
 */
@Entity
@DiscriminatorColumn(name="protocol")
public abstract class FeatureSource {
    
    @Id
    private Long id;

    @Column(unique=true)
    @Basic(optional=false)
    private String name;

    @Basic(optional=false)
    private String url;

    private String username;
    private String password;
    
    @OneToMany(orphanRemoval=true)
    @JoinTable(inverseJoinColumns=@JoinColumn(name="feature_type"))
    @OrderColumn(name="list_index")
    private List<SimpleFeatureType> featureTypes = new ArrayList<SimpleFeatureType>();

    //<editor-fold defaultstate="collapsed" desc="getters en setters">

    public List<SimpleFeatureType> getFeatureTypes() {
        return featureTypes;
    }

    public void setFeatureTypes(List<SimpleFeatureType> featureTypes) {
        this.featureTypes = featureTypes;
    }

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
    //</editor-fold>

    public String getProtocol() {
        return getClass().getAnnotation(DiscriminatorValue.class).value();
    }    

}
