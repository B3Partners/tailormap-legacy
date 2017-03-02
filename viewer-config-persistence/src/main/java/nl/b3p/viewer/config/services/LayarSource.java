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
package nl.b3p.viewer.config.services;

import java.util.HashMap;
import java.util.Map;
import javax.persistence.*;
import nl.b3p.viewer.config.ClobElement;

/**
 *
 * @author Roy Braam
 */
@Entity
public class LayarSource {
    @Id
    private Long id;
    
    @ManyToOne
    private LayarService layarService;
    
    @ManyToOne
    private SimpleFeatureType featureType;
    
    @ElementCollection
    private Map<String,ClobElement> details = new HashMap<String,ClobElement>();

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
