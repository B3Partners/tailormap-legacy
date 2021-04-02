/*
 * Copyright (C) 2013-2016 B3Partners B.V.
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

import java.util.Iterator;
import java.util.List;
import nl.b3p.web.WaitPageStatus;
import org.apache.commons.lang3.mutable.MutableBoolean;
import org.apache.commons.lang3.tuple.MutablePair;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import javax.persistence.EntityManager;

/**
 *
 * @author Roy Braam
 */
public abstract class UpdatableFeatureSource extends FeatureSource{

    /**
     * return a list of featuretypes that are currently present in the
     * FeatureSource.
     *
     * @param wps status page to monitor featuretype creation
     * @return a list of created featuretypes
     * @throws java.lang.Exception if any
     */
    public abstract List<SimpleFeatureType> createFeatureTypes(WaitPageStatus wps) throws Exception;
}
