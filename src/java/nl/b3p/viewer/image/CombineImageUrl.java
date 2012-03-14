package nl.b3p.viewer.image;

import java.net.URL;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 * B3partners B.V. http://www.b3partners.nl
 * @author Roy
 * Created on 20-okt-2009, 10:30:38
 */
public class CombineImageUrl {
    private static final Log log = LogFactory.getLog(CombineImageSettings.class);
    private String url=null;
    private String body=null;
    private URL realUrl;
    private Float alpha =null;

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

}
