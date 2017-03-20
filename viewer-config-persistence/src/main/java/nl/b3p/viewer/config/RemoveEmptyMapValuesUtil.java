/*
 * Copyright (C) 2012-2016 B3Partners B.V.
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

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.apache.commons.lang3.StringUtils;

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
