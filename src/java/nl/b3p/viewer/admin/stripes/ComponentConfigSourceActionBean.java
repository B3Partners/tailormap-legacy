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
package nl.b3p.viewer.admin.stripes;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import javax.servlet.http.HttpServletResponse;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.components.ComponentRegistry;
import nl.b3p.viewer.components.ViewerComponent;
import org.json.JSONException;

/**
 *
 * @author Matthijs Laan
 */
@UrlBinding("/action/componentConfigSource")
@StrictBinding
public class ComponentConfigSourceActionBean implements ActionBean {
    
    private ActionBeanContext context;

    public ActionBeanContext getContext() {
        return context;
    }

    public void setContext(ActionBeanContext context) {
        this.context = context;
    }
    
    @Validate
    private String className;

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public Resolution source() {
        ViewerComponent vc = ComponentRegistry.getInstance().getViewerComponent(className);
        
        Resolution notFound = new ErrorResolution(HttpServletResponse.SC_NOT_FOUND);
        if(vc == null) {
            return notFound;
        }
        
        try {
            String configSource = vc.getMetadata().getString("configSource");
            if(configSource == null) {
                return notFound;
            }

            File f = new File(vc.getPath() + File.separator + configSource);

            if(!f.exists() || !f.canRead()) {
                return notFound;
            }
            
            long lastModified = f.lastModified();
            if(lastModified != -1) {
                long ifModifiedSince = context.getRequest().getDateHeader("If-Modified-Since");

                if(ifModifiedSince != -1) {
                    if(ifModifiedSince >= lastModified) {
                        return new ErrorResolution(HttpServletResponse.SC_NOT_MODIFIED);
                    }
                }
            }            

            return new StreamingResolution("application/javascript", new FileInputStream(f));
        } catch(FileNotFoundException fnfe) {
            return notFound;
        } catch(JSONException je) {
            return notFound;
        }
    }
}
