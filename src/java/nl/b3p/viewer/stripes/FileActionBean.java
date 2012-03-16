/*
 * Copyright (C) 2012 Expression organization is undefined on line 4, column 61 in Templates/Licenses/license-gpl30.txt.
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

import java.io.*;
import java.io.StringReader;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.http.HttpServletResponse;
import net.sourceforge.stripes.action.ActionBean;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.DefaultHandler;
import net.sourceforge.stripes.action.FileBean;
import net.sourceforge.stripes.action.Resolution;
import net.sourceforge.stripes.action.StreamingResolution;
import net.sourceforge.stripes.action.StrictBinding;
import net.sourceforge.stripes.action.UrlBinding;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.util.StreamCopy;
import org.apache.commons.io.FileUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author Meine Toonen meinetoonen@b3partners.nl
 */
@UrlBinding("/action/file")
@StrictBinding
public class FileActionBean implements ActionBean {

    private static final Log log = LogFactory.getLog(LayerListActionBean.class);
    private ActionBeanContext context;
    @Validate
    private FileBean featureFile;
    
    @Validate
    private String saveObject;
    @Validate
    private String title;
    
    @Validate
    private String description;

    //<editor-fold defaultstate="collapsed" desc="Getters and Setters">
    public ActionBeanContext getContext() {
        return context;
    }

    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public FileBean getFeatureFile() {
        return featureFile;
    }

    public void setFeatureFile(FileBean featureFile) {
        this.featureFile = featureFile;
    }

    public String getSaveObject() {
        return saveObject;
    }

    public void setSaveObject(String saveObject) {
        this.saveObject = saveObject;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    //</editor-fold>
    
    @DefaultHandler
    public Resolution upload() {
        JSONObject fileContents = new JSONObject();
        File features = null;
        InputStream in = null;
        OutputStream out = null;
        try {
            features = File.createTempFile("Import", ".txt");
            in = featureFile.getInputStream();
            out = new FileOutputStream(features);
            StreamCopy.copy(in, out);
            try {
                in.close();
                out.close();
            } catch (IOException ex) {
                log.error("Fout sluiten streams:", ex);
            }
            String contents = FileUtils.readFileToString(features);
            fileContents.put("features", new JSONObject(contents));
            
        } catch (JSONException ex) {
            log.error("Fout met jsoon",ex);
        } catch (IOException e) {
            log.error("Fout lezen gmlfile:", e);
        } finally {
            features.delete();
        }
        return new StreamingResolution("text/html", new StringReader(fileContents.toString()));
    }
    
    public Resolution save(){
        final String fileName = "pipotaart";
         return new StreamingResolution("text/html") {

            @Override
            public void stream(HttpServletResponse response) throws Exception {

                OutputStream out = response.getOutputStream();

                String workingName = System.getProperty("java.io.tmpdir") + File.separator + fileName;
                try {
                   /* Date nowDate = new Date(System.currentTimeMillis());
                    SimpleDateFormat sdf = (SimpleDateFormat) SimpleDateFormat.getDateInstance();
                    sdf.applyPattern("HH-mm_dd-MM-yyyy");
                    String now = sdf.format(nowDate);
                    final String fileName = "Export_" + now;*/
                    File features = File.createTempFile("Features", ".txt");
                    
                    
                    
                    FileUtils.writeStringToFile(features, title);
                    InputStream in = null;
                    

                    try {
                        in = new FileInputStream(features);
                        StreamCopy.copy(in, out);
                    } catch (IOException ex) {
                        log.error("Could not write zip to output: ", ex);
                    } finally {
                        out.close();
                        in.close();
                   //     features.delete();
                    }
                } catch (Exception e) {
                    log.error("Fout bij maken sld: ", e);
                    response.setContentType("text/html;charset=UTF-8");
                    PrintWriter pw = new PrintWriter(out);
                    pw.write(e.getMessage());
                } finally {
                    out.close();
                }
            }
        }.setAttachment(true).setFilename(fileName + ".txt");
    }
}
