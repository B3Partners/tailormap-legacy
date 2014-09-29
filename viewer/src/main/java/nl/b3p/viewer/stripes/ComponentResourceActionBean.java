/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.b3p.viewer.stripes;

import eu.medsea.mimeutil.MimeType;
import eu.medsea.mimeutil.MimeUtil;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Collection;
import javax.servlet.http.HttpServletResponse;
import net.sourceforge.stripes.action.ActionBean;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.ErrorResolution;
import net.sourceforge.stripes.action.Resolution;
import net.sourceforge.stripes.action.StreamingResolution;
import net.sourceforge.stripes.action.StrictBinding;
import net.sourceforge.stripes.action.UrlBinding;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.components.ComponentRegistry;
import nl.b3p.viewer.components.ViewerComponent;
import nl.b3p.web.stripes.ErrorMessageResolution;
import org.apache.commons.io.IOUtils;

/** 
 * ActionBean to get the resource of a (3rd party component).
 * The resource is in the same directory (or a child) as the component class.
 * @author Roy Braam
 * @author Meine Toonen
 */

@UrlBinding("/action/componentresource")
@StrictBinding
public class ComponentResourceActionBean implements ActionBean{
    private ActionBeanContext context;

    @Validate
    private String className;
    @Validate
    private String resource;
    
    public Resolution resource() throws IOException{
        if (className==null || getResource() == null){         
            return new ErrorMessageResolution("Both 'className' and 'resource' is required.");
        }
        ViewerComponent comp = ComponentRegistry.getInstance().getViewerComponent(className);
        String path = comp.getPath();
        path+=File.separator+getResource();
        
        final File file = new File(path);
        if (!file.canRead()){
            return new ErrorResolution(HttpServletResponse.SC_NOT_FOUND,"Resource not found");
        }
        //check if the file requested is in the path of the component
        String check = file.getCanonicalPath();        
        if (!check.startsWith(comp.getPath())){
            return new ErrorResolution(HttpServletResponse.SC_FORBIDDEN,"Not allowed to access file");
        }
        
        String contentType=getContentType(file);
        return new StreamingResolution(contentType) {
            @Override
            protected void stream(HttpServletResponse response) throws IOException {
                IOUtils.copy(new FileInputStream(file), response.getOutputStream());                
            }
        };
    }
    private String getContentType(File f){
        MimeUtil.registerMimeDetector("eu.medsea.mimeutil.detector.MagicMimeMimeDetector");
        MimeUtil.registerMimeDetector("eu.medsea.mimeutil.detector.ExtensionMimeDetector");
        MimeUtil.registerMimeDetector("eu.medsea.mimeutil.detector.OpendesktopMimeDetector");
        Collection mimeTypes = MimeUtil.getMimeTypes(f);
        if (!mimeTypes.isEmpty()) {
            Object[] mimeArray = mimeTypes.toArray();
            MimeType mime = (MimeType) mimeArray[0];
            return mime.toString();
        } else {
            return "plain/text";
        }
    }
    //<editor-fold defaultstate="collapsed" desc="Getters/setters">
    public ActionBeanContext getContext() {
        return context;
    }

    public void setContext(ActionBeanContext context) {
        this.context = context;
    }
    
    public String getClassName() {
        return className;
    }
    
    public void setClassName(String className) {
        this.className = className;
    }

    public String getResource() {
        return resource;
    }

    public void setResource(String resource) {
        this.resource = resource;
    }
    
}
//</editor-fold>
