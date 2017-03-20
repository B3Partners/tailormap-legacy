/*
 * Copyright (C) 2012-2016 B3Partners B.V.
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
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FilenameFilter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.servlet.ServletContext;
import org.apache.commons.io.IOUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Registry of available JavaScript viewer components.
 *
 * @author Matthijs Laan
 * @author mprins
 */
public class ComponentRegistry {
    private static final Log log = LogFactory.getLog(ComponentRegistry.class);

    private final Map<String,ViewerComponent> components = new HashMap<>();

    private final List<File> componentPaths = new ArrayList();

    /* package */ boolean loadFromPath(ServletContext sc, String p) {

        File path = this.resolvePath(sc,p);
        if (path==null){
            return false;
        }

        log.info("Loading component metadata from path " + path);

        String[] files = path.list(new FilenameFilter() {
            @Override
            public boolean accept(File dir, String name) {
                return name.equalsIgnoreCase("components.json");
            }
        });

        for(String file: files) {
            String filename = path + File.separator + file;
            try {
                String contents = IOUtils.toString(new FileInputStream(filename), "UTF-8");

                try {
                    JSONObject componentMetadata = new JSONObject(contents);

                    loadComponentMetadata(path, componentMetadata);
                } catch(JSONException e) {
                    /* See if it is an array of components */
                    try {
                        JSONArray cpms = new JSONArray(contents);
                        for (int i = 0; i < cpms.length(); i++) {
                            loadComponentMetadata(path, cpms.getJSONObject(i));
                        }
                    } catch(JSONException e2) {
                        log.error("Exception parsing file " + file, e2);
                    }
                }
            } catch(Exception e) {
                log.error("Exception reading file " + file, e);
            }
        }
        componentPaths.add(path);
        return true;
    }

    private void loadComponentMetadata(File path, JSONObject metadata) throws IOException {
        log.debug("Loading component: " + metadata + " from file " + path);

        try {
            String className = metadata.getString("className");

            if(components.containsKey(className)) {
                log.error(String.format("Ignoring duplicate component classname \"%s\" in when loading from path \"%s\"",
                        className,
                        path.toString()));
                return;
            }

            String group = "Rest";
            if(metadata.has("group")){
                group = metadata.getString("group");
            }else{
                metadata.put("group", group);
            }
            File[] sourceFiles;
            File[] configSourceFiles;
            try {
                sourceFiles = getFiles(path, metadata.optJSONArray("sources"));
                configSourceFiles = getFiles(path, metadata.optJSONArray("configSource"));
            } catch(FileNotFoundException e) {
                log.error(String.format("Error reading file in component class \"%s\": \"%s\"" ,className, e.getMessage()));
                return;
            }

            components.put(className, new ViewerComponent(path.getCanonicalPath(), className, sourceFiles, configSourceFiles, metadata,group));
            log.debug("Registered component " + className);

        } catch(JSONException e) {
            log.error("Invalid component metadata in directory " + path + ": " + e.getMessage());
        }
    }

    public static ComponentRegistry getInstance() {
        return ComponentRegistryInitializer.getInstance();
    }

    public List<String> getSortedComponentClassNameList() {
        List<String> names = new ArrayList<>(components.keySet());
        Collections.sort(names);
        return names;
    }

    public List<String> getClassNameListSortedByDisplayName() {
        List<String> names = new ArrayList<>(components.keySet());
        Collections.sort(names, new Comparator<String>() {
            @Override
            public int compare(String lhs, String rhs) {
                ViewerComponent vcLhs = components.get(lhs);
                ViewerComponent vcRhs = components.get(rhs);

                lhs = vcLhs.getMetadata().optString("name", lhs);
                rhs = vcRhs.getMetadata().optString("name", rhs);
                return lhs.compareTo(rhs);
            }
        });
        return names;
    }

    private File[] getFiles(File path, JSONArray sources) throws IOException, JSONException{
        File[] sourceFiles = new File[] {};

        if(sources != null) {
            sourceFiles = new File[sources.length()];
            for(int i = 0; i < sources.length(); i++) {
                File sourceFile = new File(path.getCanonicalPath() + File.separator + sources.getString(i));
                if(!sourceFile.canRead()) {
                    /*Maybe it's in an other configured path*/
                    sourceFile = this.getFileFromComponentPaths(sources.getString(i));
                    if (sourceFile==null){
                        throw new FileNotFoundException (String.format("Cannot read sourcefile \"%s\"",
                                sources.getString(i)));
                    }
                }
                sourceFiles[i] = sourceFile;
            }
        }
        return sourceFiles;
    }

    private File resolvePath(ServletContext sc,String p){
        File path = new File(sc.getRealPath(p));
        log.debug(String.format("Real path for \"%s\": %s", p, path));

        if (!path.exists() || !path.canRead()){
            log.debug(String.format("Cannot load component metadata from context path converted to real path: \"%s\", "
                    + "trying as file path.", path));
            path = new File(p);
        }

        if(!path.exists() || !path.canRead()) {
            log.error(String.format("Cannot load component metadata from file path \"%s\"", path));
            return null;
        }
        return path;
    }
    private File getFileFromComponentPaths(String source) throws IOException{
        File file;
        for (File path : this.componentPaths){
            file=new File(path.getCanonicalPath() + File.separator + source);
            if (file.canRead()){
                return file;
            }
        }
        return null;
    }

    public ViewerComponent getViewerComponent(String className) {
        return components.get(className);
    }

    public void setComponentPaths(ServletContext sc,String[] componentPaths) {
        this.componentPaths.clear();
        for(String componentPath : componentPaths) {
            File f = this.resolvePath(sc, componentPath);
            if (f!=null){
                this.componentPaths.add(f);
            }
        }
    }
}
