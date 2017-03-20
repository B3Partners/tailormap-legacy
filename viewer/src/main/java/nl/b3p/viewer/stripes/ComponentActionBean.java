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
package nl.b3p.viewer.stripes;

import com.google.javascript.jscomp.CompilationLevel;
import com.google.javascript.jscomp.Compiler;
import com.google.javascript.jscomp.CompilerOptions;
import com.google.javascript.jscomp.JSError;
import com.google.javascript.jscomp.SourceFile;
import java.util.*;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.Charset;
import javax.servlet.http.HttpServletResponse;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.controller.LifecycleStage;
import net.sourceforge.stripes.validation.*;
import nl.b3p.viewer.components.ViewerComponent;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.ConfiguredComponent;
import nl.b3p.viewer.config.security.Authorizations;
import org.apache.commons.io.IOUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 *
 * @author Matthijs Laan
 */
@UrlBinding("/app/component/{className}/{$event}/{file}")
@StrictBinding
public class ComponentActionBean implements ActionBean {
    private static final Log log = LogFactory.getLog(ComponentActionBean.class);

    @Validate
    private String app;

    @Validate
    private String version;

    @Validate
    private String className;

    @Validate
    private String file;

    @Validate
    private boolean minified;

    private Application application;
    private ViewerComponent component;
    
    private ActionBeanContext context;

    private static final Map<String,Object[]> minifiedSourceCache = new HashMap<String,Object[]>();

    //<editor-fold defaultstate="collapsed" desc="getters and setters">
    public void setContext(ActionBeanContext abc) {
        this.context = abc;
    }

    public ActionBeanContext getContext() {
        return context;
    }

    public String getApp() {
        return app;
    }

    public void setApp(String app) {
        this.app = app;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getFile() {
        return file;
    }

    public void setFile(String file) {
        this.file = file;
    }

    public boolean isMinified() {
        return minified;
    }

    public void setMinified(boolean minified) {
        this.minified = minified;
    }
    //</editor-fold>

    @Before(stages=LifecycleStage.EventHandling)
    public void load() {
        application = ApplicationActionBean.findApplication(app, version);
        if(application != null && className != null) {
            for(ConfiguredComponent cc: application.getComponents()) {
                if(cc.getClassName().equals(className)) {
                    
                    if(Authorizations.isConfiguredComponentAuthorized(cc, context.getRequest())) {
                        component = cc.getViewerComponent();
                        break;
                    }
                }
            }
        }
    }

    @DefaultHandler
    public Resolution source() throws IOException {
        File[] files = null;

        if(className != null && component == null) {
            return new ErrorResolution(HttpServletResponse.SC_FORBIDDEN, "User not authorized for this components' source");
        }
        
        if(component == null) {
            // All source files for all components for this application

            // Sort list for consistency (error line numbers, cache, etc.)
            List<ConfiguredComponent> comps = new ArrayList<ConfiguredComponent>(application.getComponents());
            Collections.sort(comps);

            Set<String> classNamesDone = new HashSet<String>();

            List<File> fileList = new ArrayList<File>();

            for(ConfiguredComponent cc: comps) {
                if(!Authorizations.isConfiguredComponentAuthorized(cc, context.getRequest())) {
                    continue;
                }
                if(!classNamesDone.contains(cc.getClassName())) {
                    classNamesDone.add(cc.getClassName());

                    if(cc.getViewerComponent() != null && cc.getViewerComponent().getSources() != null) {
                        fileList.addAll(Arrays.asList(cc.getViewerComponent().getSources()));
                    }
                }
            }
            files = fileList.toArray(new File[] {});
        } else {
            // Source files specific to a component

            if(file != null) {
                // Search for the specified file in the component sources
                for(File f: component.getSources()) {
                    if(f.getName().equals(file)) {
                        files = new File[] {f};
                        break;
                    }
                }
                if(files == null) {
                    return new ErrorResolution(HttpServletResponse.SC_NOT_FOUND, file);
                }
            } else {
                // No specific sourcefile requested, return all sourcefiles
                // concatenated
                files = component.getSources();
            }
        }

        long lastModified = -1;
        for(File f: files) {
            lastModified = Math.max(lastModified, f.lastModified());
        }
        if(lastModified != -1) {
            long ifModifiedSince = context.getRequest().getDateHeader("If-Modified-Since");

            if(ifModifiedSince != -1) {
                if(ifModifiedSince >= lastModified) {
                    return new ErrorResolution(HttpServletResponse.SC_NOT_MODIFIED);
                }
            }
        }

        final File[] theFiles = files;
        StreamingResolution res = new StreamingResolution("application/javascript") {
            @Override
            public void stream(HttpServletResponse response) throws Exception {

                OutputStream out = response.getOutputStream();
                for(File f: theFiles) {
                    if(theFiles.length != 1) {
                        out.write(("\n\n// Source file: " + f.getName() + "\n\n").getBytes("UTF-8"));
                    }
                    if(isMinified()) {
                        String minified = getMinifiedSource(f);
                        if(minified != null) {
                            out.write(minified.getBytes("UTF-8"));
                        } else {
                            IOUtils.copy(new FileInputStream(f), out);
                        }
                    } else {
                        IOUtils.copy(new FileInputStream(f), out);
                    }
                }
            }
        };
        if(lastModified != -1) {
            res.setLastModified(lastModified);
        }
        return res;
    }

    public Resolution resource() throws IOException {
        // TODO conditional HTTP request
        // TODO send a resource from the subdirectory "resources" from the components.json dir for the component

        getContext().getResponse().sendError(404);
        return null;
    }

    private static synchronized String getMinifiedSource(File f) throws IOException {
        String key = f.getCanonicalPath();
        Object[] cache = minifiedSourceCache.get(key);

        if(cache != null) {
            // check last modified time
            Long lastModified = (Long)cache[0];
            if(!lastModified.equals(f.lastModified())) {
                minifiedSourceCache.remove(key);
                cache = null;
            }
        }

        if(cache != null) {
            return (String)cache[1];
        }

        String minified = null;
        try {
            Compiler compiler = new Compiler();
            CompilerOptions options = new CompilerOptions();
            CompilationLevel.SIMPLE_OPTIMIZATIONS.setOptionsForCompilationLevel(options);
            options.setOutputCharset(Charset.forName("UTF-8"));
            compiler.compile(SourceFile.fromCode("dummy.js", ""), SourceFile.fromFile(f), options);

            if(compiler.hasErrors()) {
                log.warn(compiler.getErrorCount() + " error(s) minifying source file " + f.getCanonicalPath() + "; using original source");
                minified = IOUtils.toString(new FileInputStream(f));
                
                for(int i = 0; i < compiler.getErrorCount(); i++) {
                    JSError error = compiler.getErrors()[i];
                    log.warn(String.format("#%d line %d,%d: %s: %s",
                            i+1,
                            error.lineNumber,
                            error.getCharno(),
                            error.getDefaultLevel(),
                            error.description));
                }
                
            } else {
                minified = compiler.toSource();
            }
        } catch(Exception e) {
            log.warn(String.format("Error minifying file \"%s\" using closure compiler, sending original source\n", f.getCanonicalPath()), e);
        }

        Object[] entry = new Object[] { f.lastModified(), minified};
        minifiedSourceCache.put(key, entry);

        return minified;
    }
}
