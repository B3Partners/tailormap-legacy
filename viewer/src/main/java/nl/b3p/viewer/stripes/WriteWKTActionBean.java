/*
 * Copyright (C) 2018 B3Partners B.V.
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

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Iterator;
import java.util.ResourceBundle;
import java.util.Set;
import javax.persistence.EntityManager;
import net.sourceforge.stripes.action.ActionBean;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.Before;
import net.sourceforge.stripes.action.DefaultHandler;
import net.sourceforge.stripes.action.Resolution;
import net.sourceforge.stripes.action.StreamingResolution;
import net.sourceforge.stripes.action.StrictBinding;
import net.sourceforge.stripes.action.UrlBinding;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.ConfiguredComponent;
import org.apache.commons.io.FileUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONObject;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Meine Toonen
 */
@UrlBinding("/action/wkt")
@StrictBinding
public class WriteWKTActionBean extends LocalizableApplicationActionBean implements ActionBean{

    private static final Log log = LogFactory.getLog(SplitFeatureActionBean.class);

    private static final String COMPONENT_NAME = "viewer.components.DownloadWKT";
    private static final String BASE_PATH = "basePath";

    private ActionBeanContext context;

    @Validate
    private Application application;

    @Validate
    private String wkt;

    @Validate
    private String type;

    @Validate
    private String mailaddress;

    @Validate
    private String filename;

    @DefaultHandler
    public Resolution write()  {
        JSONObject obj = new JSONObject();
        obj.put("success", false);

        EntityManager em = Stripersist.getEntityManager();

        Set components = application.getComponents();
        for (Iterator it = components.iterator(); it.hasNext();) {
            ConfiguredComponent comp = (ConfiguredComponent) it.next();
            if (comp.getClassName().equals(COMPONENT_NAME)) {
                JSONObject config = new JSONObject(comp.getConfig());
                String basepath = config.optString(BASE_PATH);
                if (basepath != null && !basepath.isEmpty()) {
                    File base = new File(basepath, type + File.separator);
                    if(!base.exists()){
                        if(!base.mkdir()){
                            log.error("Can not create folder " + base.getAbsolutePath() + ".");
                        }
                    }
                    if (base.exists() && base.canWrite()) {
                        Date nowDate = new Date(System.currentTimeMillis());
                        SimpleDateFormat sdf = (SimpleDateFormat) SimpleDateFormat.getDateInstance();
                        sdf.applyPattern("HH-mm_dd-MM-yyyy");
                        String now = sdf.format(nowDate);
                        File f = new File(base, filename + now + ".txt");
                        try {
                            JSONObject file = new JSONObject();
                            file.put("title", filename);
                            file.put("description", mailaddress);
                            file.put("features", wkt);

                            FileUtils.writeStringToFile(f, file.toString(), "UTF-8");

                            obj.put("success", true);
                        } catch (IOException ex) {
                            obj.put("message", getBundle().getString("viewer.writewktactionbean.1"));
                            log.error("Error writing wkt file: ", ex);
                        }
                    } else {
                        obj.put("message", getBundle().getString("viewer.writewktactionbean.2"));
                    }
                } else {
                    obj.put("message", getBundle().getString("viewer.writewktactionbean.3"));
                    log.error("Error writing wkt file: Base path not configured. Contact your administrator." );
                }
                break;
            }
        }

        return new StreamingResolution("application/json", obj.toString());
    }

    // <editor-fold desc="getters and setters" defaultstate="collapsed">
    public Application getApplication() {
        return application;
    }

    public void setApplication(Application application) {
        this.application = application;
    }

    public String getWkt() {
        return wkt;
    }

    public void setWkt(String wkt) {
        this.wkt = wkt;
    }

    public String getMailaddress() {
        return mailaddress;
    }

    public void setMailaddress(String mailaddress) {
        this.mailaddress = mailaddress;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public ActionBeanContext getContext() {
        return context;
    }

    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
    // </editor-fold>

}
