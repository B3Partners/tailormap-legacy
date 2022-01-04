/*
 * Copyright (C) 2012-2021 B3Partners B.V.
 */
package nl.tailormap.viewer.config;

import org.apache.commons.lang3.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 *
 * @author Matthijs Laan
 */
public class RemoveEmptyMapValuesUtil {

    /**
     * IMPORTANT TO CALL THIS BEFORE SAVING / UPDATING AN ENTITY WITH A DETAILS
     * MAP. Hibernate fails to remove map entries with a null value when calling
     * clear() on a map on Oracle. This leads to duplicate key violations when
     * updating layer details.
     *
     * {@code @PreUpdate}/{@code @PrePersist} nor {@code @EntityListeners} do
     * not work consistenly with cascaded objects in Hibernate, so call this
     * manually!
     *
     * @param map the map to clean up
     */
    public static void removeEmptyMapValues(Map map) {
        List keysToRemove = new ArrayList();
        for(Map.Entry entry: (Set<Map.Entry>)map.entrySet()) {
            if(entry.getValue() == null 
                || (entry.getValue() instanceof String && StringUtils.isEmpty((String)entry.getValue()))
                || (entry.getValue() instanceof ClobElement && StringUtils.isEmpty(((ClobElement)entry.getValue()).getValue()))) {
                keysToRemove.add(entry.getKey());
            }
        }
        for(Object key: keysToRemove) {
            map.remove(key);
        }
    }
}
