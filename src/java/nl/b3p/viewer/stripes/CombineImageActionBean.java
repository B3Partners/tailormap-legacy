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

import java.io.OutputStream;
import java.io.StringReader;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Random;
import java.util.Set;
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
    
    private ActionBeanContext context;
    private int maxResponseTime = 10000;
    
    @Validate
    private String params;
    @Validate
    private String imageId;
    @Validate
    private String keepAlive;
    
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
    //</editor-fold>
    @DefaultHandler
    public Resolution create() throws JSONException, Exception {        
        JSONObject jRequest = new JSONObject(params);
        JSONObject jResponse = new JSONObject();
        String error=null;
        String orientation=jRequest.getString("orientation");
        String pageFormat= jRequest.getString("pageformat");
        
        if (orientation==null || pageFormat ==null){
            error = "invalid parameters";
        }else{
            try{
                CombineImageSettings cis = new CombineImageSettings();            
                //get the requests
                JSONArray requests = jRequest.getJSONArray("requests");
                for (int r=0; r < requests.length(); r++){
                    CombineImageUrl ciu = null;
                    JSONObject request=requests.getJSONObject(r);
                    
                    String protocol = null;
                    if (request.has("protocol")){
                        protocol=request.getString("protocol");
                    }
                    if (CombineImageUrl.ARCSERVER.equals(protocol)){
                        ciu= new CombineArcServerUrl();
                    }else if (CombineImageUrl.ARCIMS.equals(protocol)){
                        ciu= new CombineArcIMSUrl();
                    }else{
                        ciu = new CombineImageUrl();
                    }
                    ciu.setProtocol(protocol);
                    ciu.setUrl(request.getString("url"));
                    if (request.has("alpha")){
                        Double alpha=request.getDouble("alpha");
                        ciu.setAlpha(alpha.floatValue());
                    }
                    ciu.setBody(request.getString("body"));                    
                    
                    cis.addUrl(ciu);
                }
                if (jRequest.has("bbox")){
                    cis.setBbox(jRequest.getString("bbox"));                
                }if (jRequest.has("width")){
                    cis.setWidth(jRequest.getInt("width"));
                }if (jRequest.has("height")){
                    cis.setHeight(jRequest.getInt("height"));
                }if (jRequest.has("srid")){
                    cis.setSrid(jRequest.getInt("srid"));
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
                //todo: better fix....
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
        log.info("get    "+imageId+" sessionid: "+this.getContext().getRequest().getSession().getId());
        //final CombineImageSettings settings = (CombineImageSettings) getContext().getRequest().getSession().getAttribute(imageId);
        final CombineImageSettings settings = imageSettings.get(imageId);
        if (getKeepAlive()==null || getKeepAlive().length()==0) {
            //getContext().getRequest().getSession().removeAttribute(imageId);
            imageSettings.remove(imageId);
        }
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
