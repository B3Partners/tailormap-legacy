package nl.b3p.viewer.util.docker;

import nl.b3p.viewer.util.ServiceAvailableChecker;

import java.net.URI;
import java.net.URISyntaxException;

public class DockerGeoserverHelper {
    private String hostname = "localhost";
    private int port = 8600;
    private String basefilepath = "/geoserver";

    //<editor-fold defaultstate="collapsed" desc="getters and setters">
    public String getHostname() {
        return hostname;
    }

    public void setHostname(String hostname) {
        this.hostname = hostname;
    }

    public String getBasefilepath() {
        return basefilepath;
    }

    public void setBasefilepath(String basefilepath) {
        this.basefilepath = basefilepath;
    }

    public int getPort() {
        return port;
    }

    public void setPort(int port) {
        this.port = port;
    }
    //</editor-fold>

    public boolean isRunning() {
        try {
            ServiceAvailableChecker checker = new ServiceAvailableChecker();
            checker.setURI(getURI());
            return checker.isHttpStatusOK();
        } catch (URISyntaxException ignored) {
            return false;
        }
    }

    public URI getURI() throws URISyntaxException {
        return new URI("http://" + hostname + ":" + port + basefilepath);
    }

    public URI getOwsUri() throws URISyntaxException {
        return getURI().resolve(basefilepath + "/ows");
    }
}
