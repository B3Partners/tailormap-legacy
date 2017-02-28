/*
 * Copyright (C) 2014 B3Partners B.V.
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

package nl.b3p.viewer.features;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
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
    protected String params;
    protected Map<String,String> parameterMap = new HashMap();

    public FeatureDownloader(List<ConfiguredAttribute> attributes,SimpleFeatureSource fs, Map<String, AttributeDescriptor> featureTypeAttributes, Map<String, String> attributeAliases, String params){
        this.attributes = attributes;
        this.fs = fs;
        this.featureTypeAttributes = featureTypeAttributes;
        this.attributeAliases = attributeAliases;

        if(params != null && params.length() > 0) {
            String[] split = params.split(",");
            for(String s: split) {
                String[] kv = s.split("=", 2);
                if(kv.length == 2) {
                    parameterMap.put(kv[0], kv[1]);
                }
            }
        }
    }

    public abstract void init() throws IOException;
    public abstract void processFeature(SimpleFeature oldFeature);
    public abstract File write() throws IOException;

}
