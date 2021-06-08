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
package nl.tailormap.viewer.config.services;

import nl.tailormap.viewer.config.ClobElement;

import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToOne;
import java.util.HashMap;
import java.util.Map;

/**
 *
 * @author Roy Braam
 */
@Entity
public class LayarSource {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "layar_service")
    private LayarService layarService;
    
    @ManyToOne
    @JoinColumn(name = "feature_type")
    private SimpleFeatureType featureType;
    
    @ElementCollection
    @JoinTable(joinColumns = @JoinColumn(name = "layar_source"))
    private Map<String, ClobElement> details = new HashMap<String,ClobElement>();

    //<editor-fold defaultstate="collapsed" desc="Getters/Setters">
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public LayarService getLayarService() {
        return layarService;
    }
    
    public void setLayarService(LayarService layerService) {
        this.layarService = layerService;
    }
    
    public SimpleFeatureType getFeatureType() {
        return featureType;
    }
    
    public void setFeatureType(SimpleFeatureType featureType) {
        this.featureType = featureType;
    }
    
    public Map<String,ClobElement> getDetails() {
        return details;
    }
    
    public void setDetails(Map<String,ClobElement> details) {
        this.details = details;
    }    
    //</editor-fold>
}
