package nl.b3p.viewer.image;

import java.net.URL;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 * Class to store a image request. Extend this to overwrite functions. This class
 * is typical used for WMS requests
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 * Created on 20-okt-2009, 10:30:38
 */
public class CombineImageUrl {
    private static final Log log = LogFactory.getLog(CombineImageSettings.class);
    public static final String WMS = "WMS";
    public static final String ARCIMS = "ARCIMS";
    public static final String ARCSERVER = "ARCSERVER";
    private String url=null;
    private String body=null;
    private URL realUrl;
    private Float alpha =null;
    private String protocol=WMS;

    public CombineImageUrl() {
    }

    public CombineImageUrl(String url, Float alpha) {
        setUrl(url);
        setAlpha(alpha);
    }

    public CombineImageUrl(URL realUrl, Float alpha) {
        setRealUrl(realUrl);
        setAlpha(alpha);
    }

    public CombineImageUrl(String u) {
        int alphaIndex=u.lastIndexOf("#");
        Float al=null;
        if (alphaIndex > 0){
            try{
                if (alphaIndex+1!=u.length())
                    al=new Float(u.substring(alphaIndex+1,u.length()));
            }catch(Exception e){
                log.error("Fout bij parsen van Alpha: ",e);
                al=null;
            }
            u=u.substring(0, alphaIndex);
        }
        setUrl(u);
        setAlpha(al);
    }

    //<editor-fold defaultstate="collapsed" desc="Getters and setters">
    /**
     * @return the url
     */
    public String getUrl() {
        return url;
    }
    
    /**
     * @param url the url to set
     */
    public void setUrl(String url) {
        this.url = url;
    }
    
    public URL getRealUrl() {
        return realUrl;
    }
    
    public void setRealUrl(URL realUrl) {
        this.realUrl = realUrl;
    }
    
    /**
     * @return the alpha
     */
    public Float getAlpha() {
        return alpha;
    }
    
    /**
     * @param alpha the alpha to set
     */
    public void setAlpha(Float alpha) {
        if (alpha==null){
            this.alpha=null;
        }else if (alpha > 1){
            alpha= new Float("1");
        }else if (alpha < 0){
            alpha= new Float("0");
        }
        this.alpha = alpha;
    }
    
    public void setBody(String body) {
        this.body=body;
    }
    
    public String getBody() {
        return this.body;
    }
    
    public String toString(){
        String returnValue="";
        if (url!=null){
            returnValue+=url+" ";
        }
        if (alpha!=null){
            returnValue+="("+alpha+")";
        }
        return returnValue;
    }
    
    public String getProtocol() {
        return protocol;
    }
    
    public void setProtocol(String protocol) {
        this.protocol = protocol;
    }
    //</editor-fold>

    public CombineImageUrl calculateNewUrl(ImageBbox imbbox) {
        return calculateNewUrl(imbbox.getWidth(),imbbox.getHeight(),imbbox.getBbox());
    }
    public CombineImageUrl calculateNewUrl(Integer width, Integer height, Bbox bbox) {
        CombineImageUrl ciu = this.clone();
        if (CombineImageUrl.WMS.equals(ciu.getProtocol())){
            ciu.changeParameter("bbox", bbox.toString());
            ciu.changeParameter("width", width.toString());
            ciu.changeParameter("height", height.toString());
        }
        return ciu;
    }
    /**
     * Returned a url with changed param     
     * @param key the param name
     * @param newValue the new value
     * @return the changed url
     *
     */
    private void changeParameter(String key,String newValue) {
        String lowerUrl = url.toLowerCase();
        if (lowerUrl.indexOf("?" + key + "=") >= 0 || lowerUrl.indexOf("&" + key + "=") >= 0) {
            int beginIndex = 0;
            int endIndex = lowerUrl.length();
            if (lowerUrl.indexOf("?" + key + "=") >= 0) {
                beginIndex = lowerUrl.indexOf("?" + key + "=") + key.length() + 2;
            } else {
                beginIndex = lowerUrl.indexOf("&" + key + "") + key.length() + 2;
            }
            if (lowerUrl.indexOf("&", beginIndex) > 0) {
                endIndex = lowerUrl.indexOf("&", beginIndex);
            }
            if (beginIndex < endIndex) {
                String newUrl="";
                if (beginIndex>0){
                    newUrl+=url.substring(0,beginIndex);
                }
                newUrl+=newValue;
                if (endIndex < url.length()){
                    newUrl+=url.substring(endIndex,url.length());
                }
                url=newUrl;
            }
        }
    }
     /**
      * Get a parameter from this url.      
      * @param key
      * @return 
      */
    public String getParameter(String key) {
        String lowerUrl = url.toLowerCase();
        if (lowerUrl.indexOf("?" + key + "=") >= 0 || lowerUrl.indexOf("&" + key + "=") >= 0) {
            int beginIndex = 0;
            int endIndex = lowerUrl.length();
            if (lowerUrl.indexOf("?" + key + "=") >= 0) {
                beginIndex = lowerUrl.indexOf("?" + key + "=") + key.length() + 2;
            } else {
                beginIndex = lowerUrl.indexOf("&" + key + "") + key.length() + 2;
            }
            if (lowerUrl.indexOf("&", beginIndex) > 0) {
                endIndex = lowerUrl.indexOf("&", beginIndex);
            }
            if (beginIndex < endIndex) {
                return url.substring(beginIndex, endIndex);
            }
        }
        return null;
    }
    /**
     * Clone this
     * @return a clone
     */
    @Override
    public CombineImageUrl clone(){        
        CombineImageUrl ciu = new CombineImageUrl();
        return clone(ciu);
    }
    public CombineImageUrl clone(CombineImageUrl ciu){
        ciu.setUrl(url);
        ciu.setAlpha(alpha);
        ciu.setBody(body);
        ciu.setRealUrl(realUrl);
        ciu.setProtocol(protocol);
        return ciu;
    }
}
