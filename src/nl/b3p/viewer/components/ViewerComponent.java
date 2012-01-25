/*
 * Copyright (C) 2012 B3Partners B.V.
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
package nl.b3p.viewer.components;

import java.io.File;
import org.json.JSONObject;

/**
 *
 * @author Matthijs Laan
 */
public class ViewerComponent {
    private String path;
    private String className;
    private File[] sources;
    private JSONObject metadata;

    private String[] compiledSourceCache;

    public ViewerComponent(String path, String className, File[] sources, JSONObject metadata) {
        this.path = path;
        this.className = className;
        this.sources = sources;
        compiledSourceCache = new String[sources.length];
        this.metadata = metadata;
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
}
