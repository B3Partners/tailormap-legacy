/*
 * Copyright (C) 2017-2021 B3Partners B.V.
 */
package nl.tailormap.viewer.util;

import org.apache.commons.collections.map.CaseInsensitiveMap;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.hibernate.transform.BasicTransformerAdapter;

import java.sql.Clob;
import java.sql.SQLException;
import java.util.Map;

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
