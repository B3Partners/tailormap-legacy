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
package nl.b3p.viewer.stripes;

import java.util.*;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import javax.servlet.http.HttpServletResponse;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.controller.LifecycleStage;
import net.sourceforge.stripes.validation.*;
import nl.b3p.viewer.components.ViewerComponent;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.ConfiguredComponent;
import org.apache.commons.io.IOUtils;

/**
 *
 * @author Matthijs Laan
 */
@UrlBinding("/app/component/{className}/{$event}/{file}")
@StrictBinding
public class ComponentActionBean implements ActionBean {

    @Validate
    private String app;

    @Validate
    private String version;

    @Validate
    private String className;

    @Validate
    private String file;

    private Application application;
    private ViewerComponent component;

    private ActionBeanContext context;

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
    //</editor-fold>

    @Before(stages=LifecycleStage.EventHandling)
    public void load() {
        application = ApplicationActionBean.findApplication(app, version);
        if(application != null && className != null) {
            for(ConfiguredComponent cc: application.getComponents()) {
                if(cc.getClassName().equals(className)) {

                    // TODO: check readers, return SC_FORBIDDEN if not authorized
                    component = cc.getViewerComponent();
                    break;
                }
            }
        }
    }

    @DefaultHandler
    public Resolution source() throws IOException {
        // TODO use closure compiler

        File[] files = null;

        if(component == null) {
            // All source files for all components for this application

            // Sort list for consistency (error line numbers, cache, etc.)
            List<ConfiguredComponent> comps = new ArrayList<ConfiguredComponent>(application.getComponents());
            Collections.sort(comps);

            Set<String> classNamesDone = new HashSet<String>();

            List<File> fileList = new ArrayList<File>();

            for(ConfiguredComponent cc: comps) {
                if(!classNamesDone.contains(cc.getClassName())) {
                    classNamesDone.add(cc.getClassName());

                    // TODO: check readers, skip if not authorized

                    fileList.addAll(Arrays.asList(cc.getViewerComponent().getSources()));
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
                    IOUtils.copy(new FileInputStream(f), out);
                }
            }
        };
        if(lastModified != -1) {
            res.setLastModified(lastModified);
        }
        if(file != null) {
            res.setFilename(files[0].getName());
        }
        return res;
    }

    public Resolution resource() throws IOException {
        // TODO conditional HTTP request
        // TODO send a resource from the subdirectory "resources" from the components.json dir for the component

        getContext().getResponse().sendError(404);
        return null;
    }
}
