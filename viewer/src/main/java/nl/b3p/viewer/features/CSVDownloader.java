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
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import nl.b3p.viewer.config.app.ConfiguredAttribute;
import nl.b3p.viewer.config.services.AttributeDescriptor;
import org.geotools.data.simple.SimpleFeatureSource;
import org.opengis.feature.simple.SimpleFeature;

/**
 * Download features as csv-file
 * @author Meine Toonen
 */
public class CSVDownloader extends FeatureDownloader{


    private char separator = ';';
    private PrintWriter pw;
    private File f;
    public CSVDownloader(List<ConfiguredAttribute> attributes, SimpleFeatureSource fs, Map<String, AttributeDescriptor> featureTypeAttributes, Map<String, String> attributeAliases, String params) {
        super(attributes, fs, featureTypeAttributes,attributeAliases, params);
    }

    @Override
    public void init() throws IOException {
        f = File.createTempFile("csvFeatures", ".csv");
        pw = new PrintWriter(f);
        List<String> header = new ArrayList<String>();
        for (ConfiguredAttribute configuredAttribute : attributes) {
            if(configuredAttribute.isVisible()){
                String alias = attributeAliases.get(configuredAttribute.getAttributeName());
                if(alias != null){
                    header.add(alias);
                }
            }
        }
        writeRow(header);
    }

    @Override
    public void processFeature(SimpleFeature oldFeature) {
        List<String> row = new ArrayList<String>();
        for (ConfiguredAttribute configuredAttribute : attributes) {
            if(configuredAttribute.isVisible() && attributeAliases.get(configuredAttribute.getAttributeName()) != null){
                Object attribute = oldFeature.getAttribute(configuredAttribute.getAttributeName());
                String value = null;
                if(attribute != null){
                    value = attribute.toString();
                }
                row.add(value);
            }
        }
        writeRow(row);
    }

    @Override
    public File write() throws IOException {
        pw.close();
        return f;
    }

    private void writeRow(List<String> row){
        String completeString = "";
        for (String col : row) {
            if(col != null){
                completeString += col;
            }
            completeString +=  separator;
        }
        completeString = completeString.substring(0, completeString.length() - 1);
        pw.println(completeString);
    }
}
