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

import java.util.*;
import javax.persistence.*;
import nl.b3p.web.WaitPageStatus;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.DataStore;
import org.geotools.data.DataStoreFinder;
import org.geotools.data.simple.SimpleFeatureSource;
import org.geotools.data.wfs.WFSDataStoreFactory;
import org.geotools.feature.FeatureCollection;
import org.json.JSONException;
import org.opengis.feature.type.AttributeType;
import org.opengis.feature.type.GeometryType;
import org.opengis.filter.Filter;

/**
 *
 * @author Matthijs Laan
 */
@Entity
@DiscriminatorValue(WFSFeatureSource.PROTOCOL)
public class WFSFeatureSource extends FeatureSource {

    private static final Log log = LogFactory.getLog(WFSFeatureSource.class);
    public static final String PROTOCOL = "wfs";

    public WFSFeatureSource() {
        super();
    }

    public WFSFeatureSource(Map params) throws JSONException {
        super();

        setUrl(params.get(WFSDataStoreFactory.URL.key).toString());
        setUsername((String) params.get(WFSDataStoreFactory.USERNAME.key));
        setPassword((String) params.get(WFSDataStoreFactory.PASSWORD.key));
    }

}
