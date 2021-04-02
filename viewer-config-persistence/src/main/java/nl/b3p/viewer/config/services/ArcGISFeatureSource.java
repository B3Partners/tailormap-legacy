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

import java.net.URL;
import java.util.*;
import javax.persistence.*;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import nl.b3p.geotools.data.arcgis.ArcGISDataStoreFactory;
import nl.b3p.viewer.config.ClobElement;
import org.geotools.data.DataStore;
import org.geotools.feature.FeatureCollection;
import org.geotools.referencing.CRS;
import org.opengis.filter.Filter;

/**
 *
 * @author jytte
 */
@Entity
@DiscriminatorValue(ArcGISFeatureSource.PROTOCOL)
public class ArcGISFeatureSource extends FeatureSource {

    public static final String PROTOCOL = "arcgis";
}
