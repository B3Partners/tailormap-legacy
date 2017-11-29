/*
 * Copyright (C) 2017 B3Partners B.V.
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
package nl.b3p.viewer.util;

import java.sql.Clob;
import java.sql.SQLException;
import java.util.Map;
import org.apache.commons.collections.map.CaseInsensitiveMap;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.hibernate.transform.BasicTransformerAdapter;

/**
 * Transform the clob in application details to a string. Avoid using with very
 * large values.
 *
 * @author Mark Prins
 */
public class ApplicationDetailsValueTransformer extends BasicTransformerAdapter {

    private static final Log LOG = LogFactory.getLog(ApplicationDetailsValueTransformer.class);
    public final static ApplicationDetailsValueTransformer INSTANCE;

    static {
        INSTANCE = new ApplicationDetailsValueTransformer();
    }

    private ApplicationDetailsValueTransformer() {

    }

    /**
     * create a CaseInsensitiveMap with key/values.
     *
     * Tuples are the elements making up each "row" of the query result. The
     * contract here is to transform these elements into the final row.
     *
     * @param tuple The result elements
     * @param aliases The result aliases ("parallel" array to tuple)
     * @return The transformed row.
     */
    @Override
    public Object transformTuple(Object[] tuple, String[] aliases) {
        Map<String, Object> map = new CaseInsensitiveMap();
        for (int i = 0; i < aliases.length; i++) {
            Object t = tuple[i];
            if (t != null && t instanceof Clob) {
                Clob c = (Clob) tuple[i];
                try {
                    t = c.getSubString(1, (int) c.length());
                } catch (SQLException e) {
                    LOG.error("Error transforming data tuple of " + aliases[i], e);
                }
            }
            map.put(aliases[i], t);
        }
        return map;
    }
}
