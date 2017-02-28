/*
 * Copyright (C) 2011-2013 B3Partners B.V.
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

import javax.persistence.Basic;
import javax.persistence.Entity;
import javax.persistence.Id;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author Jytte Schaeffer
 */
@Entity
public class Document {
    @Id
    private Long id;
    
    @Basic(optional=false)
    private String name;
    
    @Basic(optional=false)
    private String url;
    
    private String category;

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

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public JSONObject toJSONObject() throws JSONException {
        JSONObject o = new JSONObject();
        
        o.put("id", id);
        o.put("name", name);
        o.put("url", url);
        o.put("category", category);
        
        return o;
    }
}
