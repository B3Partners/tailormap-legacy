/*
 * Copyright (C) 2012-2013 B3Partners B.V.
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
package nl.b3p.viewer.components;

import java.io.File;
import org.json.JSONObject;

/**
 *
 * @author Matthijs Laan
 */
public class ViewerComponent implements Comparable<ViewerComponent>{
    private String path;
    private String className;
    private File[] sources;
    private File[] configSources;
    private JSONObject metadata;
    private String group;

    public ViewerComponent(String path, String className, File[] sources, File[] configSources, JSONObject metadata, String group) {
        this.path = path;
        this.className = className;
        this.sources = sources;
        this.configSources = configSources;
        this.metadata = metadata;
        this.group = group;
    }

    public String getClassName() {
        return className;
    }

    public JSONObject getMetadata() {
        return metadata;
    }

    public String getPath() {
        return path;
    }

    public File[] getSources() {
        return sources;
    }
    
    public File[] getConfigSources(){
        return configSources;
    }

    public String getGroup() {
        return group;
    }

    public void setGroup(String group) {
        this.group = group;
    }

    @Override
    public int compareTo(ViewerComponent o) {
        return className.compareTo(o.getClassName());
    }
}
