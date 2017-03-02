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
package nl.b3p.viewer.config;

import javax.persistence.Embeddable;
import javax.persistence.Lob;
import org.apache.commons.lang3.StringUtils;

/**
 *
 * @author Matthijs Laan
 */
@Embeddable
public class ClobElement {
    @Lob
    @org.hibernate.annotations.Type(type="org.hibernate.type.StringClobType")
    private String value;

    public ClobElement() {
    }
    
    public ClobElement(String value) {
        this.value = value;
    }
    
    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj == null) {
            return false;
        }
        if (getClass() != obj.getClass()) {
            return false;
        }
        final ClobElement other = (ClobElement) obj;
        if ((this.value == null) ? (other.value != null) : !this.value.equals(other.value)) {
            return false;
        }
        return true;
    }

    @Override
    public int hashCode() {
        int hash = 3;
        hash = 71 * hash + (this.value != null ? this.value.hashCode() : 0);
        return hash;
    }

    @Override
    public String toString() {
        return value;
    }
    
    public static boolean isNotBlank(ClobElement e) {
        return e != null && StringUtils.isNotBlank(e.getValue());
    }
    
    public static String nullSafeGet(ClobElement e) {
        return e == null ? null : e.getValue();
    }
}
