/*
 * Copyright (C) 2012-2021 B3Partners B.V.
 */
package nl.tailormap.viewer.components;

import org.json.JSONObject;

import java.io.File;

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
