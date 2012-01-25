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

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import javax.servlet.http.HttpServletResponse;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.*;
import nl.b3p.viewer.components.ComponentRegistry;
import nl.b3p.viewer.components.ViewerComponent;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.ConfiguredComponent;
import org.apache.commons.io.IOUtils;

/**
 *
 * @author Matthijs Laan
 */
@UrlBinding("/app/component/{appName}/v{version}/{name}{resource}/{$event}")
@StrictBinding
public class ComponentActionBean implements ActionBean {

    @Validate
    private String appName;

    @Validate
    private String version;

    @Validate
    private String name;

    @Validate
    private String resource;

    private ActionBeanContext context;

    public void setContext(ActionBeanContext abc) {
        this.context = abc;
    }

    public ActionBeanContext getContext() {
        return context;
    }

    public String getAppName() {
        return appName;
    }

    public void setAppName(String appName) {
        this.appName = appName;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getResource() {
        return resource;
    }

    public void setResource(String resource) {
        this.resource = resource;
    }

    @DefaultHandler
    public Resolution source() throws IOException {
        // TODO conditional HTTP request
        // TODO use closure compiler
        // TODO support specific source files instead of all concatenated (for debugging)

        Application app = ApplicationActionBean.findApplication(appName, version);
        for(ConfiguredComponent cc: app.getComponents()) {
            if(cc.getClassName().equals(name)) {
                // TODO: check readers

                final ViewerComponent vc = ComponentRegistry.getInstance().getViewerComponent(name);

                if(vc != null) {
                    return new StreamingResolution("application/javascript") {
                        public void stream(HttpServletResponse response) throws Exception {
                            OutputStream out = response.getOutputStream();
                            for(File f: vc.getSources()) {
                                out.write(("\n\n// Source file: " + f.getName() + "\n\n").getBytes("UTF-8"));
                                IOUtils.copy(new FileInputStream(f), out);
                            }
                        }
                    };
                }
                break;
            }
        }

        getContext().getResponse().sendError(404);
        return null;
    }

    public Resolution resource() throws IOException {
        // TODO conditional HTTP request
        // TODO send a resource from the subdirectory "resources" from the components.json dir for the component

        getContext().getResponse().sendError(404);
        return null;
    }
}
