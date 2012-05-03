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

import nl.b3p.viewer.image.CombineImageSettings;
import nl.b3p.viewer.image.CombineImageWkt;
import nl.b3p.viewer.image.CombineArcIMSUrl;
import nl.b3p.viewer.image.CombineImageUrl;
import nl.b3p.viewer.image.CombineArcServerUrl;
import java.awt.Color;
import java.io.OutputStream;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Random;
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
public class CombineImageActionBean implements ActionBean {
    private static final Log log = LogFactory.getLog(CombineImageActionBean.class);
    private static HashMap<String,CombineImageSettings> imageSettings = new HashMap<String,CombineImageSettings>();
    
    public static final String WMS = "WMS";
    public static final String ARCIMS = "ARCIMS";
    public static final String ARCSERVER = "ARCSERVER";
    public static final String IMAGE="IMAGE";
    
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
    //</editor-fold>
    @DefaultHandler
    public Resolution create() throws JSONException, Exception {        
        JSONObject jRequest = new JSONObject(params);
        JSONObject jResponse = new JSONObject();
        String error=null;
        String pageFormat = jRequest.has("pageformat") ? jRequest.getString("pageformat") : PrintActionBean.A4;
        String orientation = jRequest.has("orientation") ? jRequest.getString("orientation") : PrintActionBean.PORTRAIT;
        
        if (orientation==null || pageFormat ==null){
            error = "invalid parameters";
        }else{
            try{
                CombineImageSettings cis = new CombineImageSettings();            
                //get the requests
                if (jRequest.has("requests")){
                    JSONArray requests = jRequest.getJSONArray("requests");
                    for (int r=0; r < requests.length(); r++){
                        CombineImageUrl ciu = null;
                        JSONObject request=requests.getJSONObject(r);

                        String protocol = null;
                        if (request.has("protocol")){
                            protocol=request.getString("protocol");
                        }
                        if (ARCSERVER.equals(protocol)){
                            ciu= new CombineArcServerUrl();
                        }else if (ARCIMS.equals(protocol)){
                            ciu= new CombineArcIMSUrl();
                        }else if (WMS.equals(protocol)){
                            ciu = new CombineWmsUrl();
                        }else if (IMAGE.equals(protocol)) {                            
                            CombineStaticImageUrl csiu = new CombineStaticImageUrl();
                            if (request.has("extent")){
                                csiu.setBbox(new Bbox(request.getString("extent")));                                
                            }
                            ciu=csiu;
                        }
                        ciu.setUrl(request.getString("url"));
                        if (request.has("alpha")){
                            Double alpha=request.getDouble("alpha");
                            //divide by 100 (number between 0 and 1)
                            ciu.setAlpha(alpha.floatValue()/100);
                        }
                        ciu.setBody(request.getString("body"));  
                        

                        cis.addUrl(ciu);
                    }
                }
                if (jRequest.has("geometries")){
                    JSONArray geometries = jRequest.getJSONArray("geometries");
                    List<CombineImageWkt> wkts = new ArrayList<CombineImageWkt>();
                    for (int g=0; g < geometries.length(); g++){
                        JSONObject geom = geometries.getJSONObject(g);
                        if (geom.has("wkt")){
                            CombineImageWkt ciw = new CombineImageWkt(geom.getString("wkt"));
                            if (geom.has("color")){
                                ciw.setColor(geom.getString("color"));
                            }
                            wkts.add(ciw);
                        }
                    }
                    cis.setWktGeoms(wkts);
                }
                if (jRequest.has("bbox")){
                    cis.setBbox(jRequest.getString("bbox"));                
                }if (jRequest.has("width")){
                    cis.setWidth(jRequest.getInt("width"));
                }if (jRequest.has("height")){
                    cis.setHeight(jRequest.getInt("height"));
                }if (jRequest.has("srid")){
                    cis.setSrid(jRequest.getInt("srid"));
                }if (jRequest.has("angle")){
                    cis.setAngle(jRequest.getInt("angle"));
                }
                if (jRequest.has("quality")){
                    Integer quality = jRequest.getInt("quality");
                    if (cis.getWidth() > cis.getHeight()){
                        cis.setHeight(Math.round(cis.getHeight() * quality/cis.getWidth()));
                        cis.setWidth(quality);
                    }else{
                        cis.setWidth(Math.round(cis.getWidth() * quality/cis.getHeight()));
                        cis.setHeight(quality);
                    }
                }
                //if no imageId is set, create a new one.
                if (imageId==null){
                    imageId= uniqueId();
                }
                //this.getContext().getRequest().getSession().setAttribute(imageId, cis);
                //TODO: better fix....
                if (imageSettings.size()>100){                    
                    imageSettings.clear();
                }
                imageSettings.put(imageId, cis);
                String url=this.context.getRequest().getRequestURL().toString();
                url+="?getImage=t&imageId="+imageId;
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
     * @return a image.
     * @throws Exception 
     */
    public Resolution getImage() throws Exception {
        if (imageId==null || imageSettings.get(imageId)==null){
            throw new Exception("No imageId given");
        }
        //final CombineImageSettings settings = (CombineImageSettings) getContext().getRequest().getSession().getAttribute(imageId);
        final CombineImageSettings settings = imageSettings.get(imageId);
        //if these settings are given then overwrite those in the CombineImageSettings
        if (this.getWidth()!=null){
            settings.setWidth(getWidth());
        }if (this.getHeight()!=null){
            settings.setHeight(getHeight());
        }if (this.getBbox()!=null){
            settings.setBbox(getBbox());
        }
        /*if (getKeepAlive()==null || getKeepAlive().length()==0) {
            //getContext().getRequest().getSession().removeAttribute(imageId);
            imageSettings.remove(imageId);
        }*/
        //stream the result.
        StreamingResolution res = new StreamingResolution(settings.getMimeType()) {
            @Override
            public void stream(HttpServletResponse response) throws Exception {
                OutputStream out = response.getOutputStream();
                response.setDateHeader("Expires", System.currentTimeMillis() + (1000 * 60 * 60 * 24));
                CombineImagesHandler.combineImage(out, settings,settings.getMimeType(),maxResponseTime);                
            }
        };
        return res;
    }
    
    /**
     * Create unique number. 
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
