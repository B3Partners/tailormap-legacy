/*
 * Copyright (C) 2012-2013 B3Partners B.V.
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

import com.google.javascript.jscomp.Compiler;
import com.google.javascript.jscomp.*;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FilenameFilter;
import java.io.IOException;
import java.nio.charset.Charset;
import java.util.*;
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
 */
public class ComponentRegistry {
    private static final Log log = LogFactory.getLog(ComponentRegistry.class);

    private Map<String,ViewerComponent> components = new HashMap<String,ViewerComponent>();
    
    private List<File> componentPaths = new ArrayList();
    
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
                String contents = "";
                
                Compiler compiler = new Compiler();
                CompilerOptions options = new CompilerOptions();
                CompilationLevel.WHITESPACE_ONLY.setOptionsForCompilationLevel(options);
                options.setOutputCharset("UTF-8");
                
                compiler.compile(JSSourceFile.fromCode("dummy.js",""), JSSourceFile.fromFile(filename, Charset.forName("UTF-8")), options);
                
                if(compiler.hasErrors()) {
                    log.warn(compiler.getErrorCount() + " error(s) minifying source file " + filename + "; using original source");
                    contents = IOUtils.toString(new FileInputStream(filename), "UTF-8");

                    for(int i = 0; i < compiler.getErrorCount(); i++) {
                        JSError error = compiler.getErrors()[i];
                        String er = String.format("#%d line %d,%d: %s: %s",
                                i+1,
                                error.lineNumber,
                                error.getCharno(),
                                error.level.toString(),
                                error.description);
                        log.warn(er);
                    }

                } else {
                    contents = compiler.toSource();
                }
                try {
                    JSONObject componentMetadata = new JSONObject(contents);

                    loadComponentMetadata(path, componentMetadata);
                } catch(JSONException e) {
                    /* See if it is an array of components */
                    try {
                        /* NOTE: org.json version in Maven repo's don't ignore
                         * comments before '['! Patched version is in local repo.
                         */
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
        
        return true;
    }

    private void loadComponentMetadata(File path, JSONObject metadata) throws IOException {
        log.debug("Load component: " + metadata);

        try {
            String className = metadata.getString("className");

            if(components.containsKey(className)) {
                log.error("Duplicate component classname: " + className);
                return;
            }
            
            String group = "Rest";
            if(metadata.has("group")){
                group = metadata.getString("group");
            }else{
                metadata.put("group", group);
            }
            File[] sourceFiles = new File[]{};
            File[] configSourceFiles = new File[]{};            
            try{            
                sourceFiles = getFiles(path, metadata.optJSONArray("sources"));
                configSourceFiles=getFiles(path, metadata.optJSONArray("configSource"));
            }catch(FileNotFoundException e){
                log.error(String.format("Error reading file in component class \"%s\": \"%s\"" ,className,e.getMessage()));
                return;
            }

            components.put(className, new ViewerComponent(path.getCanonicalPath(), className, sourceFiles,configSourceFiles, metadata,group));
            log.info("Registered component " + className);

        } catch(JSONException e) {
            log.error("Invalid component metadata in directory " + path + ": " + e.getMessage());
        }
    }

    public static ComponentRegistry getInstance() {
        return ComponentRegistryInitializer.getInstance();
    }

    public List<String> getSortedComponentClassNameList() {
        List<String> names = new ArrayList<String>(components.keySet());
        Collections.sort(names);
        return names;
    }
    
    public List<String> getClassNameListSortedByDisplayName() {
        List<String> names = new ArrayList<String>(components.keySet());
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
            log.info(String.format("Cannot load component metadata from non-existing or unreadable paths \"%s\"."
                    + "trying as non-virtual path.", path));
            path = new File(p);
        }
        
        if(!path.exists() || !path.canRead()) {
            log.error(String.format("Cannot load component metadata from non-existing or unreadable paths \"%s\"", path));
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
        for (int i = 0; i<componentPaths.length; i++){
            File f = this.resolvePath(sc, componentPaths[i]);
            if (f!=null){
                this.componentPaths.add(f);
            }
        }
    }
}
