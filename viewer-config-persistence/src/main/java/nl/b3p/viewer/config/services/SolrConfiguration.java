/*
 * Copyright (C) 2013 B3Partners B.V.
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

import java.util.ArrayList;
import java.util.List;
import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;

/**
 *
 * @author Meine Toonen
 */
@Entity
public class SolrConfiguration {

    @Id
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    private SimpleFeatureType simpleFeatureType;
    
    @ManyToMany(cascade=CascadeType.ALL) // Actually @OneToMany, workaround for HHH-1268    
    @JoinTable(inverseJoinColumns=@JoinColumn(name="attribute_"))
    private List<AttributeDescriptor> attributes = new ArrayList();
    

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public SimpleFeatureType getSimpleFeatureType() {
        return simpleFeatureType;
    }

    public void setSimpleFeatureType(SimpleFeatureType simpleFeatureType) {
        this.simpleFeatureType = simpleFeatureType;
    }


    public List<AttributeDescriptor> getAttributes() {
        return attributes;
    }

    public void setAttributes(List<AttributeDescriptor> attributes) {
        this.attributes = attributes;
    }
}
