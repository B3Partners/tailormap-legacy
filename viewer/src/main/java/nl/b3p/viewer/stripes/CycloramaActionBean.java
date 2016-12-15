/*
 * Copyright (C) 2012-2014 B3Partners B.V.
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

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.net.Authenticator;
import java.net.PasswordAuthentication;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLEncoder;
import java.security.InvalidKeyException;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.Signature;
import java.security.SignatureException;
import java.security.interfaces.RSAPrivateKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;
import javax.persistence.EntityManager;
import net.sourceforge.stripes.action.ActionBean;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.DefaultHandler;
import net.sourceforge.stripes.action.Resolution;
import net.sourceforge.stripes.action.StreamingResolution;
import net.sourceforge.stripes.action.StrictBinding;
import net.sourceforge.stripes.action.UrlBinding;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.CycloramaAccount;
import org.apache.commons.codec.binary.Base64;
import org.apache.commons.httpclient.Credentials;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpMethod;
import org.apache.commons.httpclient.MultiThreadedHttpConnectionManager;
import org.apache.commons.httpclient.NameValuePair;
import org.apache.commons.httpclient.URIException;
import org.apache.commons.httpclient.UsernamePasswordCredentials;
import org.apache.commons.httpclient.auth.AuthScope;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.httpclient.util.URIUtil;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.http.client.utils.URIBuilder;
import org.json.JSONException;
import org.json.JSONObject;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Meine Toonen meinetoonen@b3partners.nl
 */
@UrlBinding("/action/cyclorama")
@StrictBinding
public class CycloramaActionBean implements ActionBean {

    private final String SIG_ALGORITHM = "SHA1withRSA";
    private final String URL_ENCODING = "utf-8";
    private static final Log log = LogFactory.getLog(LayerListActionBean.class);
    private ActionBeanContext context;

    @Validate
    private double x;

    @Validate
    private double y;

    @Validate
    private double offset;

    @Validate
    private Long appId;

    @Validate
    private Long accountId;

    @Validate
    private String imageId;

    private String tid;

    private String apiKey;

    //<editor-fold defaultstate="collapsed" desc="Getters and Setters">
    public ActionBeanContext getContext() {
        return context;
    }

    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public Long getAppId() {
        return appId;
    }

    public void setAppId(Long appId) {
        this.appId = appId;
    }

    public Long getAccountId() {
        return accountId;
    }

    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }

    public String getImageId() {
        return imageId;
    }

    public void setImageId(String imageId) {
        this.imageId = imageId;
    }

    public String getTid() {
        return tid;
    }

    public void setTid(String tid) {
        this.tid = tid;
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public double getX() {
        return x;
    }

    public void setX(double x) {
        this.x = x;
    }

    public double getY() {
        return y;
    }

    public void setY(double y) {
        this.y = y;
    }

    public double getOffset() {
        return offset;
    }

    public void setOffset(double offset) {
        this.offset = offset;
    }

    // </editor-fold>
    @DefaultHandler
    public Resolution sign() throws JSONException {
        JSONObject json = new JSONObject();
        json.put("success", false);
        EntityManager em = Stripersist.getEntityManager();
        CycloramaAccount account = em.find(CycloramaAccount.class, accountId);
        if (imageId != null && account != null) {

            try {
                apiKey = "K3MRqDUdej4JGvohGfM5e78xaTUxmbYBqL0tSHsNWnwdWPoxizYBmjIBGHAhS3U1";

                DateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                df.setTimeZone(TimeZone.getTimeZone("GMT"));

                String date = df.format(new Date());
                String token = "X" + account.getUsername() + "&" + imageId + "&" + date + "Z";

                String privateBase64Key = account.getPrivateBase64Key();

                if (privateBase64Key == null || privateBase64Key.equals("")) {
                    log.error("Kon private key voor aanmaken TID niet ophalen!");
                }

                tid = getTIDFromBase64EncodedString(privateBase64Key, token);

                json.put("tid", tid);
                json.put("imageId", imageId);
                json.put("apiKey", apiKey);
                json.put("success", true);
            } catch (Exception ex) {
                json.put("message", ex.getLocalizedMessage());
            }
        }

        // return new ForwardResolution("/WEB-INF/jsp/app/globespotter.jsp");
        return new StreamingResolution("application/json", json.toString());
    }

    public Resolution directRequest() throws UnsupportedEncodingException, URISyntaxException, URIException, IOException {
        JSONObject json = new JSONObject();
        json.put("success", false);
        Double x1 = x - offset;
        Double y1 = y - offset;
        Double x2 = x + offset;
        Double y2 = y + offset;
        final String username = "B3_develop";
        final String password = "8ndj39";

        URL url2 = new URL("https://atlas.cyclomedia.com/recordings/wfs?service=WFS&VERSION=1.1.0&maxFeatures=100&request=GetFeature&SRSNAME=EPSG:28992&typename=atlas:Recording"
                + "&filter=<Filter><BBOX><gml:Envelope%20srsName=%27EPSG:28992%27>"
                + "<gml:lowerCorner>" + x1.intValue() +"%20"+ y1.intValue() +"</gml:lowerCorner>"
                + "<gml:upperCorner>"+ x2.intValue() +"%20"+ y2.intValue()+"</gml:upperCorner></gml:Envelope></BBOX></Filter>");
        
        Authenticator.setDefault(new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(username, password.toCharArray());
            }
        });
        InputStream is =url2.openStream();
        
        
       // wrap the urlconnection in a bufferedreader
        BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(is));

        String line;

        StringBuilder content = new StringBuilder();
        // read from the urlconnection via the bufferedreader
        while ((line = bufferedReader.readLine()) != null) {
            content.append(line + "\n");
        }
        bufferedReader.close();

        String s = content.toString();
        json.put("features", s);
        return new StreamingResolution("application/json", json.toString());
    }

    private String getTIDFromBase64EncodedString(String base64Encoded, String token)
            throws NoSuchAlgorithmException, InvalidKeySpecException, InvalidKeyException,
            SignatureException, UnsupportedEncodingException {

        String tid = null;
        Base64 encoder = new Base64();

        byte[] tempBytes = encoder.decode(base64Encoded.getBytes());

        KeyFactory rsaKeyFac = KeyFactory.getInstance("RSA");
        PKCS8EncodedKeySpec encodedKeySpec = new PKCS8EncodedKeySpec(tempBytes);
        RSAPrivateKey privKey = (RSAPrivateKey) rsaKeyFac.generatePrivate(encodedKeySpec);

        byte[] signature = sign(privKey, token);

        String base64 = new String(encoder.encode(signature));
        tid = URLEncoder.encode(token + "&" + base64, URL_ENCODING);

        return tid;
    }

    private byte[] sign(PrivateKey privateKey, String token)
            throws NoSuchAlgorithmException, InvalidKeyException, SignatureException {

        Signature instance = Signature.getInstance(SIG_ALGORITHM);
        instance.initSign(privateKey);
        instance.update(token.getBytes());
        byte[] signature = instance.sign();

        return signature;
    }
}
