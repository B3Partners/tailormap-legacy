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
public abstract class CombineImageUrl {
    private static final Log log = LogFactory.getLog(CombineImageSettings.class);    
    protected String url=null;
    private String body=null;
    private URL realUrl;
    private Float alpha =null;

    public CombineImageUrl() {
    }
    
    public CombineImageUrl(CombineImageUrl ciu){
        url=ciu.getUrl();
        alpha=ciu.getAlpha();
        body=ciu.getBody();
        realUrl=ciu.getRealUrl();
    }
    

    public CombineImageUrl(String url, Float alpha) {
        setUrl(url);
        setAlpha(alpha);
    }

    public CombineImageUrl(URL realUrl, Float alpha) {
        setRealUrl(realUrl);
        setAlpha(alpha);
    }
    /**
     * Returned a url with changed param     
     * @param key the param name
     * @param newValue the new value
     * @return the changed url
     *
     */
    protected void changeParameter(String key,String newValue) {
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
    //</editor-fold>

    public abstract CombineImageUrl calculateNewUrl(ImageBbox imbbox);
}
