/*
 * Copyright (C) 2012-2016 B3Partners B.V.
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

import nl.b3p.viewer.image.CombineImageSettings;
import nl.b3p.viewer.image.CombineImageWkt;
import nl.b3p.viewer.image.CombineArcIMSUrl;
import nl.b3p.viewer.image.CombineImageUrl;
import nl.b3p.viewer.image.CombineArcServerUrl;
import java.io.OutputStream;
import java.io.StringReader;
import java.util.*;
import javax.servlet.http.HttpServletResponse;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.image.*;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author Roy Braam
 */
@UrlBinding("/action/combineimage")
@StrictBinding
public class CombineImageActionBean extends LocalizableActionBean implements ActionBean {
    private static final Log log = LogFactory.getLog(CombineImageActionBean.class);
    private static LinkedHashMap<String,CombineImageSettings> imageSettings = new LinkedHashMap<String,CombineImageSettings>();

    public static final String WMS = "WMS";
    public static final String ARCIMS = "ARCIMS";
    public static final String ARCSERVER = "ARCSERVER";
    public static final String IMAGE="IMAGE";
    public static final String ARCSERVERREST = "ARCSERVERREST";

    private static int maxStoredSettings= 500;
    private static int minStoredSettings=400;

    private ActionBeanContext context;

    private int maxResponseTime = 10000;

    @Validate
    private String params;
    @Validate
    private String imageId;
    @Validate
    private String keepAlive;
    //These settings can overwrite the earlier setttings (these depends on how big the image must be)
    @Validate
    private Integer width=null;
    @Validate
    private Integer height=null;
    @Validate
    private String bbox=null;
    @Validate
    private String geom = null;

    //<editor-fold defaultstate="collapsed" desc="Getters and Setters">
    public void setContext(ActionBeanContext context) {
        this.context=context;
    }

    public ActionBeanContext getContext() {
        return this.context;
    }

    public String getParams() {
        return params;
    }

    public void setParams(String params) {
        this.params = params;
    }

    public String getImageId() {
        return imageId;
    }

    public void setImageId(String imageId) {
        this.imageId = imageId;
    }

    public String getKeepAlive() {
        return keepAlive;
    }

    public void setKeepAlive(String keepAlive) {
        this.keepAlive = keepAlive;
    }

    public Integer getWidth() {
        return width;
    }

    public void setWidth(Integer width) {
        this.width = width;
    }

    public Integer getHeight() {
        return height;
    }

    public void setHeight(Integer height) {
        this.height = height;
    }

    public String getBbox() {
        return bbox;
    }

    public void setBbox(String bbox) {
        this.bbox = bbox;
    }

    public String getGeom() {
        return geom;
    }

    public void setGeom(String geom) {
        this.geom = geom;
    }
    //</editor-fold>

    @DefaultHandler
    public Resolution create() throws JSONException, Exception {
        JSONObject jRequest = new JSONObject(params);
        JSONObject jResponse = new JSONObject();
        String error=null;
        String pageFormat = jRequest.has("pageformat") ? jRequest.getString("pageformat") : PrintActionBean.A4;
        String orientation = jRequest.has("orientation") ? jRequest.getString("orientation") : PrintActionBean.PORTRAIT;

        if (orientation==null || pageFormat ==null){
            error = getBundle().getString("viewer.combineimageactionbean.1");
        }else{
            try{

                CombineImageSettings cis =CombineImageSettings.fromJson(jRequest);
                //if no imageId is set, create a new one.
                if (imageId==null){
                    imageId= uniqueId();
                }
                //this.getContext().getRequest().getSession().setAttribute(imageId, cis);
                //TODO: better fix....
                if (imageSettings.size()>maxStoredSettings){
                    Set<String> keyset=imageSettings.keySet();
                    for (Iterator<String> iterator = keyset.iterator(); iterator.hasNext();) {
                        iterator.next();
                        iterator.remove();
                        if (imageSettings.size() < minStoredSettings) {
                            break;
                        }
                    }
                }
                imageSettings.put(imageId, cis);
                String url=this.context.getRequest().getRequestURL().toString();
                url+="?getImage=t&imageId="+imageId;
                String jsessionId = null;
                String j = "jsessionid";
                int index = url.toLowerCase().indexOf(j);
                if( index != -1){
                    index += j.length() +1;
                    jsessionId = url.substring(index, index + 32);
                }else{
                    jsessionId = context.getRequest().getSession().getId();
                }
                url += "&JSESSIONID=" + jsessionId;
                jResponse.put("imageUrl", url );
                jResponse.put("success", Boolean.TRUE);
            }catch(Exception e){
                log.error("",e);
            }
        }
        if(error != null) {
            jResponse.put("error", error);

        }
        return new StreamingResolution("application/json", new StringReader(jResponse.toString()));
    }
    /**
     * Combines the image settings to a new image.
     *
     * @return an image
     * @throws Exception if any
     */
    public Resolution getImage() throws Exception {
        if (imageId==null || imageSettings.get(imageId)==null){
            throw new Exception("No imageId provided");
        }
        //final CombineImageSettings settings = (CombineImageSettings) getContext().getRequest().getSession().getAttribute(imageId);
        final CombineImageSettings settings = imageSettings.get(imageId);
        //if these settings are given then overwrite those in the CombineImageSettings
        if (this.getWidth() != null && this.getWidth() > 0) {
            settings.setWidth(getWidth());
        }
        if (this.getHeight() != null && this.getHeight() > 0) {
            settings.setHeight(getHeight());
        }
        if (this.getBbox() != null) {
            settings.setBbox(getBbox());
        }
        if (this.getGeom() != null) {
            String firstChar = geom.substring(0, 1);
            try {
                int test = Integer.parseInt(firstChar);
                // This is a bounding box, so parse it into a linestring
                String[] tokens = geom.split(",");
                String minx = tokens[0];
                String miny = tokens[1];
                String maxx = tokens[2];
                String maxy = tokens[3];
                String wkt = "LINESTRING(";
                wkt += minx + " " + miny + ", ";
                wkt += maxx + " " + miny + ", ";
                wkt += maxx + " " + maxy + ", ";
                wkt += minx + " " + maxy + ", ";
                wkt += minx + " " + miny + ")";
                this.geom = wkt;
            } catch (NumberFormatException e) {
                // this is not a boundingbox
            }
            CombineImageWkt ciw = new CombineImageWkt(geom);
            ciw.setStrokeWidth(8f);
            if(settings.getWktGeoms() == null){
               settings.setWktGeoms(new ArrayList());
            }
            settings.getWktGeoms().add(ciw);
        }

        //stream the result.
        StreamingResolution res = new StreamingResolution(settings.getMimeType()) {
            @Override
            public void stream(HttpServletResponse response) throws Exception {
                OutputStream out = response.getOutputStream();
                response.setDateHeader("Expires", System.currentTimeMillis() + (1000 * 60 * 60 * 24));
                CombineImagesHandler.combineImage(out, settings,settings.getMimeType(),maxResponseTime, context.getRequest());
            }
        };
        return res;
    }

    /**
     * Create unique number.
     * @return a unique number
     */
    public static String uniqueId() {
        // Use miliseconds to generate a code
        long now = (new Date()).getTime();
        String val1 = Long.toString(now, Character.MAX_RADIX).toUpperCase();
        // add random to make sure it's unique
        Random rg = new Random();
        long rnum = (long) rg.nextInt(1000);
        String val2 = Long.toString(rnum, Character.MAX_RADIX).toUpperCase();
        return val1 + val2;
    }
}
