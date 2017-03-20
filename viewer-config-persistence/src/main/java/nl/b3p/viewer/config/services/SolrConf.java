/*
 * Copyright (C) 2013 B3Partners B.V.
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

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import javax.persistence.CollectionTable;
import javax.persistence.Column;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author Meine Toonen
 */
@Entity
public class SolrConf {

    @Id
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    private SimpleFeatureType simpleFeatureType;
    
    @ElementCollection
    @CollectionTable(
          name="solr_conf_index_attributes",
          joinColumns=@JoinColumn(name="solr_conf")
    )
    @Column(name="attribute_")
    private List<String> indexAttributes = new ArrayList();
    
    @ElementCollection
    @CollectionTable(
          name="solr_conf_result_attributes",
          joinColumns=@JoinColumn(name="solr_conf")
    )
    @Column(name="attribute_")
    private List<String> resultAttributes = new ArrayList();
    
    private String name;
    
    
    @Temporal(TemporalType.TIMESTAMP)
    private Date lastUpdated = new Date();

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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<String> getIndexAttributes() {
        return indexAttributes;
    }

    public void setIndexAttributes(List<String> indexAttributes) {
        this.indexAttributes = indexAttributes;
    }

    public List<String> getResultAttributes() {
        return resultAttributes;
    }

    public void setResultAttributes(List<String> resultAttributes) {
        this.resultAttributes = resultAttributes;
    }

    public Date getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(Date lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public JSONObject toJSON() throws JSONException {
        JSONObject json = new JSONObject();
        json.put("id", id);
        json.put("name", name);
        String last = "Niet ingelezen";
        if (lastUpdated != null) {
            SimpleDateFormat sdf = (SimpleDateFormat) SimpleDateFormat.getDateInstance();
            sdf.applyPattern("HH-mm_dd-MM-yyyy");
            last = sdf.format(lastUpdated);
        }
        json.put("lastUpdated", last);
        if (simpleFeatureType != null) {
            json.put("featureTypeId", simpleFeatureType.getId());
            json.put("featureTypeName", simpleFeatureType.getTypeName());
            json.put("featureSourceName", simpleFeatureType.getFeatureSource().getName());
        }
        return json;
    }
}
