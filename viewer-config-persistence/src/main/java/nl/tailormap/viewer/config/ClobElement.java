/*
 * Copyright (C) 2012-2021 B3Partners B.V.
 */
package nl.tailormap.viewer.config;

import org.apache.commons.lang3.StringUtils;
import org.hibernate.annotations.Type;

import javax.persistence.Embeddable;
import javax.persistence.Lob;

/**
 *
 * @author Matthijs Laan
 */
@Embeddable
public class ClobElement {
    @Lob
    @Type(type = "org.hibernate.type.TextType")
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
