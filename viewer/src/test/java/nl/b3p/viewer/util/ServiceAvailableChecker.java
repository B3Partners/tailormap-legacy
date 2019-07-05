package nl.b3p.viewer.util;

import org.apache.http.HttpStatus;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URI;


public class ServiceAvailableChecker {
    private URI uri;

    //<editor-fold defaultstate="collapsed" desc="getters and setters">
    public URI getURI() {
        return uri;
    }

    public void setURI(URI uri) {
        this.uri = uri;
    }
    //</editor-fold>

    public boolean isHttpStatusOK() {
        try {
            HttpURLConnection connection = createConnection();
            connection.connect();
            return connection.getResponseCode() == HttpStatus.SC_OK;
        } catch (IOException e) {
            return false;
        }
    }

    private HttpURLConnection createConnection() throws IOException {
        HttpURLConnection connection = (HttpURLConnection) uri.toURL().openConnection();
        connection.setRequestMethod("GET");
        return connection;
    }
}
