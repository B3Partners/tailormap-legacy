/*
 * Copyright (C) 2014 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

package nl.b3p.viewer.features;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import nl.b3p.viewer.config.app.ConfiguredAttribute;
import nl.b3p.viewer.config.services.AttributeDescriptor;
import org.geotools.data.simple.SimpleFeatureSource;
import org.opengis.feature.simple.SimpleFeature;

/**
 * This interface describes which methods should be implemented when a new way of downloading (new filetype) is implemented
 * @author Meine Toonen
 */
public abstract class FeatureDownloader {
    protected List<ConfiguredAttribute> attributes;
    protected SimpleFeatureSource fs;
    protected Map<String, AttributeDescriptor> featureTypeAttributes;
    protected Map<String, String> attributeAliases;

    public FeatureDownloader(List<ConfiguredAttribute> attributes,SimpleFeatureSource fs, Map<String, AttributeDescriptor> featureTypeAttributes, Map<String, String> attributeAliases){
        this.attributes = attributes;
        this.fs = fs;
        this.featureTypeAttributes = featureTypeAttributes;
        this.attributeAliases = attributeAliases;
    }

    public abstract void init() throws IOException;
    public abstract void processFeature(SimpleFeature oldFeature);
    public abstract File write() throws IOException;

}
