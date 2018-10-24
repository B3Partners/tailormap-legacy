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
package nl.b3p.viewer.admin.stripes;

import java.io.IOException;
import java.text.MessageFormat;
import java.util.Date;
import java.util.List;
import javax.annotation.security.RolesAllowed;
import net.sourceforge.stripes.action.DefaultHandler;
import net.sourceforge.stripes.action.FileBean;
import net.sourceforge.stripes.action.Resolution;
import net.sourceforge.stripes.action.StreamingResolution;
import net.sourceforge.stripes.action.StrictBinding;
import net.sourceforge.stripes.action.UrlBinding;
import net.sourceforge.stripes.util.HtmlUtil;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.app.Resource;
import nl.b3p.viewer.config.security.Group;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Matthijs Laan
 */
@UrlBinding("/action/imageupload")
@StrictBinding
@RolesAllowed({Group.ADMIN,Group.APPLICATION_ADMIN}) 
public class ImageUploadActionBean extends ApplicationActionBean {
    private static final Log log = LogFactory.getLog(ImageUploadActionBean.class);
    
    private static final String IMAGE_ACTIONBEAN_URL = "/action/image/";
    
    private static final String VIEWER_URL_PARAM = "viewer.url";
    
    @Validate
    private FileBean upload;
    
    @Validate
    private String action;
    
    @Validate
    private Integer page;
    @Validate
    private Integer start;
    @Validate
    private Integer limit;
    
    @Validate
    private String image;

    //<editor-fold defaultstate="collapsed" desc="getters and setters">
    public FileBean getUpload() {
        return upload;
    }
    
    public void setUpload(FileBean upload) {
        this.upload = upload;
    }
    
    public String getAction() {
        return action;
    }
    
    public void setAction(String action) {
        this.action = action;
    }
    
    public Integer getLimit() {
        return limit;
    }
    
    public void setLimit(Integer limit) {
        this.limit = limit;
    }
    
    public Integer getPage() {
        return page;
    }
    
    public void setPage(Integer page) {
        this.page = page;
    }
    
    public Integer getStart() {
        return start;
    }
    
    public void setStart(Integer start) {
        this.start = start;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }
    //</editor-fold>
    
    private String url(Resource r) {
        return getContext().getServletContext().getInitParameter(VIEWER_URL_PARAM) + IMAGE_ACTIONBEAN_URL + r.getName();
    }

    @DefaultHandler
    public Resolution upload() throws JSONException {
        
        JSONObject j = new JSONObject();
        
        j.put("success", false);
        j.put("message", "Fout");
        
        if(upload == null) {
            j.put("errors", getBundle().getString("viewer_admin.imageuploadactionbean.noupload"));
        } else {
            
            if(Stripersist.getEntityManager().find(Resource.class, upload.getFileName()) != null) {
                j.put("errors", getBundle().getString("viewer_admin.imageuploadactionbean.namedup"));
            } else {
                try {
                    Resource r = new Resource();

                    r.setName(upload.getFileName());
                    r.setContentType(upload.getContentType());
                    r.setDataContent(upload.getInputStream(), upload.getSize());
                    r.setSize(upload.getSize());
                    r.setModified(new Date());

                    Stripersist.getEntityManager().persist(r);
                    Stripersist.getEntityManager().getTransaction().commit();

                    j.put("message",  MessageFormat.format(getBundle().getString("viewer_admin.imageuploadactionbean.imguploaded"), r.getName()));
                    JSONObject data = new JSONObject();
                    data.put("src", url(r));
                    j.put("data", data);
                    j.put("total", 1);
                    j.put("success", true);
                } catch(Exception e) {
                    j.put("errors", e.toString());
                } finally {
                    try { 
                        upload.delete();
                    } catch(IOException e) {
                        log.error("Error deleting upload", e);
                    }
                }
            }
        }
        
        // text/html and HTML encode because of http://docs.sencha.com/ext-js/4-1/#!/api/Ext.data.Connection
        // requirements (WTF???)
        return new StreamingResolution("text/html", HtmlUtil.encode(j.toString(4)));
    }
    
    public Resolution manage() throws JSONException {
        
        if("imagesList".equals(action)) {
            return imagesList();
        } else if("delete".equals(action)) {
            return delete();
        } else {
            JSONObject j = new JSONObject();
            j.put("success", false);
            j.put("message", "Fout");
            j.put("errors",  MessageFormat.format(getBundle().getString("viewer_admin.imageuploadactionbean.unkaction"), action));
                    
            return new StreamingResolution("application/json", j.toString(4));
        }
    }
            
    public Resolution imagesList() throws JSONException {
        JSONObject j = new JSONObject();
        try {
            JSONArray data = new JSONArray();
            j.put("data", data);

            j.put("total", Stripersist.getEntityManager().createQuery("select count(*) from Resource").getSingleResult());

            List<Resource> resources = Stripersist.getEntityManager().createQuery(
                    "from Resource order by name")
                    .setFirstResult(start)
                    .setMaxResults(limit)
                    .getResultList();
            for(Resource r: resources) {
                JSONObject file = new JSONObject();
                file.put("src", url(r));
                file.put("name", r.getName());
                file.put("fullname", r.getName());
                data.put(file);
            }
            j.put("success", true);
            j.put("message", "Success");
        } catch(Exception e) {
            j.put("success", false);
            j.put("message", "Fout");
            j.put("errors", e.toString());
        }

        return new StreamingResolution("application/json", j.toString(4));
    }
    
    public Resolution delete() throws JSONException {
        JSONObject j = new JSONObject();
        j.put("success", false);
        j.put("message", "Fout");
        try {
            Resource r = Stripersist.getEntityManager().find(Resource.class, image);
            
            if(r == null) {
                j.put("errors",  MessageFormat.format(getBundle().getString("viewer_admin.imageuploadactionbean.notfound"), image ));
            } else {
                Stripersist.getEntityManager().remove(r);
                Stripersist.getEntityManager().getTransaction().commit();
            }
            j.put("success", true);
            j.put("message", "Verwijderd");
        } catch(Exception e) {
            j.put("errors", e.toString());
        }
        return new StreamingResolution("application/json", j.toString(4));
    }
}
