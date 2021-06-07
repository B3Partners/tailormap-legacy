package nl.tailormap.viewer.admin.processes;

import nl.tailormap.viewer.config.app.ConfiguredComponent;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONObject;
import org.json.JSONTokener;
import org.stripesstuff.stripersist.Stripersist;

import javax.persistence.EntityManager;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.List;

public class SPOTinfoTokenRefresher {
    private static final Log LOG = LogFactory.getLog(SPOTinfoTokenRefresher.class);

    /**
     * Loop over all configured components to find those that have complete SPOTinfo configuration and use that to
     * obtain a new access token for SPOTinfo.
     */
    public void refreshTokens() {
        Stripersist.requestInit();
        try {
            EntityManager entityManager = Stripersist.getEntityManager();
            LOG.debug("Looking for access tokens to refresh");
            for (ConfiguredComponent c : (List<ConfiguredComponent>) entityManager.createQuery(
                    "from ConfiguredComponent c where c.className = 'viewer.components.MapboxGL'").getResultList()) {
//                if (c.getClassName().equals("viewer.components.MapboxGL")) {
                JSONObject config = c.toJSON(false).getJSONObject("config");
                String adminOnlyapiAccount = config.optString("adminOnlyapiAccount");
                String adminOnlyapiUser = config.optString("adminOnlyapiUser");
                String adminOnlyapiPass = config.optString("adminOnlyapiPass");
                String adminOnlyapiDatasets = config.optString("adminOnlyapiDatasets");

                if (!adminOnlyapiPass.isEmpty() &&
                        !adminOnlyapiUser.isEmpty() &&
                        !adminOnlyapiDatasets.isEmpty() &&
                        !adminOnlyapiAccount.isEmpty()) {
                    LOG.info("Refreshing SPOTinfo access token for " + c.getName());
                    LOG.debug("old token " + config.optString("apiKey"));
                    final String request = String.format(
                            "{\"username\":\"%s\",\"password\":\"%s\",\"account\":\"%s\",\"datasets\":[\"%s\"]}",
                            adminOnlyapiUser, adminOnlyapiPass, adminOnlyapiAccount, adminOnlyapiDatasets
                    );
                    byte[] out = request.getBytes(StandardCharsets.UTF_8);

                    URL url = new URL("https://beheer.omgevingsserver.nl/api/token/");
                    HttpURLConnection http = (HttpURLConnection) url.openConnection();
                    http.setRequestMethod("POST");
                    http.setFixedLengthStreamingMode(out.length);
                    http.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
                    http.setRequestProperty("Accept", "application/json");
                    http.setDoOutput(true);
                    http.connect();
                    try (OutputStream os = http.getOutputStream()) {
                        os.write(out);
                    }
                    if (http.getResponseCode() == 200) {
                        try (BufferedReader br = new BufferedReader(
                                new InputStreamReader(http.getInputStream(), StandardCharsets.UTF_8))) {
                            StringBuilder response = new StringBuilder();
                            String responseLine;
                            while ((responseLine = br.readLine()) != null) {
                                response.append(responseLine.trim());
                            }
                            JSONTokener resp = new JSONTokener(response.toString());
                            JSONObject newKeys = new JSONObject(resp);
                            config.put("apiKey", newKeys.getString("access"));
                            LOG.debug("new token " + config.optString("apiKey"));
                            c.setConfig(config.toString());
                            entityManager.persist(c);
                        }
                    } else {
                        LOG.error(
                                "Unexpected HTTP status code " + http.getResponseCode() +
                                        "after requesting access token.");
                    }
                } else {
                    LOG.debug(
                            "Skipping component " + c.getName() + " one or more required SPOTinfo parameters is " +
                                    "missing.");
                }
//                }
            }
            entityManager.getTransaction().commit();
        } catch (IOException e) {
            LOG.error("A Problem occurred while trying to refresh the SPOTinfo access token.", e);
        } finally {
            Stripersist.requestComplete();
        }
    }
}
