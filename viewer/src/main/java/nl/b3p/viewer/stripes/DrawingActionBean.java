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

import org.locationtech.jts.geom.*;
import org.locationtech.jts.io.ParseException;
import org.locationtech.jts.io.WKTReader;
import java.io.*;
import java.text.SimpleDateFormat;
import java.util.*;
import javax.servlet.http.HttpServletResponse;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.Validate;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author Meine Toonen meinetoonen@b3partners.nl
 */
@UrlBinding("/action/Drawing")
@StrictBinding
public class DrawingActionBean implements ActionBean {

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
        JSONObject json = new JSONObject();

        File features = null;
        InputStream in = null;
        OutputStream out = null;
        try {
            json.put("success", Boolean.FALSE);

            features = File.createTempFile("Import", ".txt");
            in = featureFile.getInputStream();
            out = new FileOutputStream(features);
            IOUtils.copy(in, out);
            try {
                in.close();
                out.close();
            } catch (IOException ex) {
                log.error("Error closing streams:", ex);
            }
            String contents = FileUtils.readFileToString(features);

            Map<String, Double> extent = getBBOX(contents);
            json.put("extent", extent);
            json.put("success", Boolean.TRUE);
            json.put("content", contents);
        } catch (JSONException ex) {
            log.error("Error on json", ex);
        } catch (IOException e) {
            log.error("Error reading gml file:", e);
        } finally {
            features.delete();
        }
        return new StreamingResolution("text/html", new StringReader(json.toString()));
    }

    private Map<String, Double> getBBOX(String contents) throws JSONException {
        JSONObject json = new JSONObject(contents);
        String featureString = json.getString("features");
        JSONArray features = new JSONArray(featureString);
        List<Geometry> polys = new ArrayList<Geometry>();
        Map<String, Double> extent = new HashMap<String, Double>();
        for (int i = 0; i < features.length(); i++) {
            JSONObject feature = features.getJSONObject(i);
            String wkt = feature.getString("wktgeom");
            if (wkt != null) {
                try {
                    Geometry geom = new WKTReader().read(wkt);
                    polys.add(geom);
                } catch (ParseException e) {
                    log.error("Failed to parse geometry >" + wkt + "<. Message: " + e.getMessage());
                }catch(Exception e ){
                    log.info("Error parsing feature, skipped.",e);
                }
            }
        }
        if (polys != null) {
            GeometryFactory gf = new GeometryFactory(new PrecisionModel(), 28992);
            GeometryCollection mg = new GeometryCollection(polys.toArray(new Geometry[polys.size()]), gf);
            Envelope envelope = mg.getEnvelopeInternal();
            // Maak wat groter, zodat omliggende terreinen/percelen ook te zien zijn.
            envelope.expandBy(500);

            extent.put("minx", envelope.getMinX());
            extent.put("miny", envelope.getMinY());
            extent.put("maxx", envelope.getMaxX());
            extent.put("maxy", envelope.getMaxY());
        } else {
            extent = null;
        }
        return extent;
    }

    public Resolution save() {

        Date nowDate = new Date(System.currentTimeMillis());
        SimpleDateFormat sdf = (SimpleDateFormat) SimpleDateFormat.getDateInstance();
        sdf.applyPattern("HH-mm_dd-MM-yyyy");
        String now = sdf.format(nowDate);
        final String fileName = title + now;
        return new StreamingResolution("text/plain") {

            @Override
            public void stream(HttpServletResponse response) throws Exception {
                OutputStream out = response.getOutputStream();

                try {
                    File features = File.createTempFile("Features", ".txt");
                    JSONObject file = new JSONObject();
                    file.put("title", title);
                    file.put("description", description);
                    file.put("features", saveObject);

                    FileUtils.writeStringToFile(features, file.toString());
                    InputStream in = null;
                    try {
                        in = new FileInputStream(features);
                        IOUtils.copy(in, out);
                    } catch (IOException ex) {
                        log.error("Could not write zip to output: ", ex);
                    } finally {
                        out.close();
                        in.close();
                        features.delete();
                    }
                } catch (Exception e) {
                    log.error("Error creating sld: ", e);
                    response.setContentType("text/html;charset=UTF-8");
                    PrintWriter pw = new PrintWriter(out);
                    pw.write(e.getMessage());
                    pw.flush();
                } finally {
                    out.close();
                }
            }
        }.setAttachment(true).setFilename(fileName + ".txt");
    }
}
