/*
 * Copyright (C) 2014 B3Partners B.V.
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
package nl.b3p.viewer.admin.stripes;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.StringReader;
import java.security.Key;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.UnrecoverableKeyException;
import java.security.cert.CertificateException;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;
import javax.annotation.security.RolesAllowed;
import javax.persistence.EntityManager;
import net.sourceforge.stripes.action.ActionBean;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.Before;
import net.sourceforge.stripes.action.DefaultHandler;
import net.sourceforge.stripes.action.FileBean;
import net.sourceforge.stripes.action.ForwardResolution;
import net.sourceforge.stripes.action.Resolution;
import net.sourceforge.stripes.action.SimpleMessage;
import net.sourceforge.stripes.action.StreamingResolution;
import net.sourceforge.stripes.action.StrictBinding;
import net.sourceforge.stripes.action.UrlBinding;
import net.sourceforge.stripes.validation.SimpleError;
import net.sourceforge.stripes.validation.Validate;
import net.sourceforge.stripes.validation.ValidateNestedProperties;
import nl.b3p.i18n.LocalizableActionBean;
import nl.b3p.viewer.config.CycloramaAccount;
import nl.b3p.viewer.config.security.Group;
import org.apache.commons.codec.binary.Base64;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.stripesstuff.stripersist.Stripersist;
import sun.security.rsa.RSAPrivateCrtKeyImpl;

/**
 *
 * @author Meine Toonen
 */
@UrlBinding("/action/cyclorama/{$event}")
@StrictBinding
@RolesAllowed({Group.ADMIN,Group.REGISTRY_ADMIN})
public class CycloramaConfigurationActionBean extends LocalizableActionBean {
    private static final Log log = LogFactory.getLog(CycloramaConfigurationActionBean.class);

    private final String CERT_TYPE = "PKCS12";
    private final String KEY_FORMAT = "PKCS#8";

    private ActionBeanContext context;
    private final String JSP = "/WEB-INF/jsp/services/cyclorama.jsp";

    @Validate
    private FileBean key;
    private List<CycloramaAccount> accounts = new ArrayList<CycloramaAccount>();

    @Validate
    @ValidateNestedProperties({
        @Validate(field = "username"),
        @Validate(field = "password")
    })
    private CycloramaAccount account;

    // <editor-fold desc="Getters and setters" defaultstate="collapsed">
    @Override
    public void setContext(ActionBeanContext abc) {
        this.context = abc;
    }

    @Override
    public ActionBeanContext getContext() {
        return context;
    }

    public FileBean getKey() {
        return key;
    }

    public void setKey(FileBean key) {
        this.key = key;
    }

    public List<CycloramaAccount> getAccounts() {
        return accounts;
    }

    public void setAccounts(List<CycloramaAccount> accounts) {
        this.accounts = accounts;
    }

    public CycloramaAccount getAccount() {
        return account;
    }

    public void setAccount(CycloramaAccount account) {
        this.account = account;
    }

    // </editor-fold>
        
    @DefaultHandler
    public Resolution view() {
        accounts = getAccountList();
        return new ForwardResolution(JSP);
    }

    public Resolution save() throws KeyStoreException {
        try {
            if (key != null) {
                String privateBase64Key = getBase64EncodedPrivateKeyFromPfxUpload(key.getInputStream(), account.getPassword());
                account.setPrivateBase64Key(privateBase64Key);
                account.setFilename(key.getFileName());
                key.delete();
            }else{
                if(account.getPrivateBase64Key() == null){
                    context.getValidationErrors().add("Key", new SimpleError(getBundle().getString("viewer_admin.cycloramaconfigurationactionbean.pfx")));
                }
            }
            EntityManager em = Stripersist.getEntityManager();
            em.persist(account);
            em.getTransaction().commit();

        } catch (Exception ex) {
            context.getValidationErrors().add("Key", new SimpleError(getBundle().getString("viewer_admin.cycloramaconfigurationactionbean.keywrong")));
            log.error("Something went wrong with reading the key",ex);
        }
        return view();
    }

    public Resolution removeKey() {
        EntityManager em = Stripersist.getEntityManager();
        em.remove(account);
        em.getTransaction().commit();
        account = new CycloramaAccount();
        this.context.getMessages().add(new SimpleMessage(getBundle().getString("viewer_admin.cycloramaconfigurationactionbean.keyrem")));
        return view();
    }

    public Resolution accountList() throws JSONException{
        List<CycloramaAccount> list = getAccountList();
        JSONArray accountArray = new JSONArray();
        for (CycloramaAccount account : list) {
            JSONObject accountObj = account.toJSON();
            accountArray.put(accountObj);
        }
        return new StreamingResolution("application/json", new StringReader(accountArray.toString()));
    }

    private String getBase64EncodedPrivateKeyFromPfxUpload(InputStream in, String password)
            throws KeyStoreException, IOException, NoSuchAlgorithmException,
            CertificateException, UnrecoverableKeyException {

        String base64 = null;

        PrivateKey privateKey = null;

        KeyStore ks = java.security.KeyStore.getInstance(CERT_TYPE);
        ks.load(new BufferedInputStream(in), password.toCharArray());

        Enumeration<String> aliases = ks.aliases();

        while (aliases.hasMoreElements()) {
            String alias = aliases.nextElement();

            Key ksKey = ks.getKey(alias, password.toCharArray());
            String keyFormat = ksKey.getFormat();

            if ((ksKey instanceof RSAPrivateCrtKeyImpl) && keyFormat.equals(KEY_FORMAT)) {
                privateKey = (PrivateKey) ksKey;
            }
        }

        if (privateKey != null) {
            Base64 encoder = new Base64();
            base64 = new String(encoder.encode(privateKey.getEncoded()));
        }

        return base64;
    }

    public List<CycloramaAccount> getAccountList(){
        EntityManager em = Stripersist.getEntityManager();
        List<CycloramaAccount> list = em.createQuery("FROM CycloramaAccount", CycloramaAccount.class).getResultList();
        return list;
    }
}
