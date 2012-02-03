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
import java.io.FileInputStream;
import java.io.FilenameFilter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import org.apache.commons.io.IOUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author Matthijs Laan
 */
public class ComponentRegistry implements ServletContextListener {
    private static final Log log = LogFactory.getLog(ComponentRegistry.class);

    private static final String COMPONENT_DIR = "viewer-html/components";

    private static ComponentRegistry registry;

    private Map<String,ViewerComponent> components = new HashMap<String,ViewerComponent>();

    @Override
    public void contextInitialized(ServletContextEvent sce) {

        String componentPath = sce.getServletContext().getInitParameter("component-path");

        if(componentPath == null) {
            componentPath = COMPONENT_DIR;
        }
        registry = new ComponentRegistry(sce.getServletContext(), componentPath);
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        
    }

    /**
     * No-arg constructor for ServletContextListener
     */
    public ComponentRegistry() {
    }

    public ComponentRegistry(ServletContext sc, String componentPath) {
        for(String p: componentPath.split(File.pathSeparator)) {
            loadPath(sc, p);
        }
    }

    private void loadPath(ServletContext sc, String p) {

        File path = new File(p);
        if(!path.isAbsolute()) {
            path = new File(sc.getRealPath(p));
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
                        JSONArray components = new JSONArray(contents);
                        for(int i = 0; i < components.length(); i++) {
                            loadComponentMetadata(path, components.getJSONObject(i));
                        }
                    } catch(JSONException e2) {
                        log.error("Exception parsing file " + file, e2);
                    }
                }
            } catch(Exception e) {
                log.error("Exception reading file " + file, e);
            }
        }
    }

    private void loadComponentMetadata(File path, JSONObject metadata) throws IOException {
        log.debug("Load component: " + metadata);

        try {
            String className = metadata.getString("className");

            if(components.containsKey(className)) {
                log.error("Duplicate component classname: " + className);
                return;
            }

            File[] sourceFiles = new File[] {};

            JSONArray sources = metadata.optJSONArray("sources");

            if(sources != null) {
                sourceFiles = new File[sources.length()];
                for(int i = 0; i < sources.length(); i++) {
                    File sourceFile = new File(path.getCanonicalPath() + File.separator + sources.getString(i));
                    if(!sourceFile.canRead()) {
                        log.error(String.format("Cannot read sourcefile \"%s\" for component class \"%s\"",
                                sources.getString(i),
                                className));
                        return;
                    }
                    sourceFiles[i] = sourceFile;
                }
            }

            components.put(className, new ViewerComponent(path.getCanonicalPath(), className, sourceFiles, metadata));
            log.info("Registered component " + className);

        } catch(JSONException e) {
            log.error("Invalid component metadata in directory " + path + ": " + e.getMessage());
        }
    }

    public static ComponentRegistry getInstance() {
        if(registry == null) {
            throw new NullPointerException("ComponentRegistry has failed to load, check logs");
        }
        return registry;
    }

    public List<String> getSortedComponentClassNameList() {
        List<String> names = new ArrayList<String>(components.keySet());
        Collections.sort(names);
        return names;
    }

    public ViewerComponent getViewerComponent(String className) {
        return components.get(className);
    }
}
