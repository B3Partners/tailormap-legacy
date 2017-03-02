/*
 * Copyright (C) 2011-2016 B3Partners B.V.
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

import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author Matthijs Laan
 */
@Entity
public class AttributeDescriptor {
    public static final String TYPE_STRING = "string";
    public static final String TYPE_DOUBLE = "double";
    public static final String TYPE_INTEGER = "integer";
    public static final String TYPE_BOOLEAN = "boolean";
    public static final String TYPE_GEOMETRY = "geometry";    
    public static final String TYPE_DATE = "date";
    public static final String TYPE_TIMESTAMP = "timestamp";
    public static final String TYPE_GEOMETRY_POINT = "point";
    public static final String TYPE_GEOMETRY_MPOINT = "multipoint";
    public static final String TYPE_GEOMETRY_LINESTRING = "linestring";
    public static final String TYPE_GEOMETRY_MLINESTRING = "multilinestring";
    public static final String TYPE_GEOMETRY_POLYGON = "polygon";
    public static final String TYPE_GEOMETRY_MPOLYGON = "multipolygon";
    
    public static final Set<String> GEOMETRY_TYPES = Collections.unmodifiableSet(new HashSet(Arrays.asList(new String[] {
        TYPE_GEOMETRY,
        TYPE_GEOMETRY_POINT,
        TYPE_GEOMETRY_MPOINT,
        TYPE_GEOMETRY_LINESTRING,
        TYPE_GEOMETRY_MLINESTRING,
        TYPE_GEOMETRY_POLYGON,
        TYPE_GEOMETRY_MPOLYGON
    })));

    @Id
    private Long id;

    @Basic(optional=false)
    private String name;

    @Column(name="name_alias")
    private String alias;

    private String type;
    
    /**
     * Returns the ExtJS
     * <a href="https://docs.sencha.com/extjs/5.1/5.1.0-apidocs/#!/api/Ext.data.field.Field">field</a>
     * type for this attribute.
     *
     * @return a string representing the field type (one of
     * auto,string,int,number,boolean,date)
     */
    public String getExtJSType() {
        // default to "auto" field type
        String ext_type = "auto";

        if (this.type.equals(TYPE_STRING)) {
            ext_type = "string";
        } else if (this.type.equals(TYPE_INTEGER)) {
            ext_type = "int";
        } else if (this.type.equals(TYPE_DOUBLE)) {
            ext_type = "number";
        } else if (this.type.equals(TYPE_BOOLEAN)) {
            ext_type = "boolean";
        } else if (this.type.equals(TYPE_DATE)) {
            ext_type = "date";
        } else if (this.type.equals(TYPE_TIMESTAMP)) {
            ext_type = "date";
        }

        return ext_type;
    }

    //<editor-fold defaultstate="collapsed" desc="getters en setters">
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAlias() {
        return alias;
    }

    public void setAlias(String alias) {
        this.alias = alias;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
    //</editor-fold>
    
    public JSONObject toJSONObject() throws JSONException {
        JSONObject j = new JSONObject();
        j.put("id", id);
        j.put("name", name);
        j.put("alias", alias);
        j.put("type", type);
        return j;
    }

    @Override
    public int hashCode() {
        int hash = 7;
        hash = 97 * hash + (this.name != null ? this.name.hashCode() : 0);
        hash = 97 * hash + (this.alias != null ? this.alias.hashCode() : 0);
        hash = 97 * hash + (this.type != null ? this.type.hashCode() : 0);
        return hash;
    }
    
    @Override
    public boolean equals(Object obj) {
        if (obj == null) {
            return false;
        }
        if (getClass() != obj.getClass()) {
            return false;
        }
        final AttributeDescriptor other = (AttributeDescriptor) obj;
        if ((this.name == null) ? (other.name != null) : !this.name.equals(other.name)) {
            return false;
        }
        if ((this.alias == null) ? (other.alias != null) : !this.alias.equals(other.alias)) {
            return false;
        }
        if ((this.type == null) ? (other.type != null) : !this.type.equals(other.type)) {
            return false;
        }
        return true;
    }
}
