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

import java.io.*;
import javax.servlet.http.HttpServletResponse;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.app.Resource;
import org.apache.commons.io.IOUtils;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Matthijs Laan
 */
@UrlBinding("/action/image/{name}")
@StrictBinding
public class ImageActionBean implements ActionBean {
    
    private ActionBeanContext context;
    
    @Validate
    private String name;

    //<editor-fold defaultstate="collapsed" desc="getters and setters">
    public ActionBeanContext getContext() {
        return context;
    }
    
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    //</editor-fold>
    
    public Resolution download() throws FileNotFoundException {
        
        final Resource r = Stripersist.getEntityManager().find(Resource.class, name);
        if(r == null) {
            return new ErrorResolution(HttpServletResponse.SC_NOT_FOUND);
        }

        if(r.getModified() != null) {
            long ifModifiedSince = context.getRequest().getDateHeader("If-Modified-Since");

            if(ifModifiedSince != -1) {
                if(ifModifiedSince >= r.getModified().getTime()) {
                    return new ErrorResolution(HttpServletResponse.SC_NOT_MODIFIED);
                }
            }
        }     

        StreamingResolution res = new StreamingResolution(r.getContentType()) {
            @Override
            public void stream(HttpServletResponse response) throws Exception {

                OutputStream out = response.getOutputStream();

                InputStream in = new ByteArrayInputStream(r.getData());
                IOUtils.copy(in, out);
                in.close();
            }
        };            
        res.setLastModified(r.getModified().getTime());
        res.setFilename(r.getName());       
        res.setLength(r.getSize());
        res.setAttachment(false);
        return res;
    }
}
