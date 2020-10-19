package nl.b3p.viewer.userlayer;

public class GeoServerManager {
    final String baseUrl;
    final String userName;
    final String passWord;

    /*
    mogelijk
            <dependency>
                <groupId>com.github.dov-vlaanderen</groupId>
                <artifactId>geoserver-manager</artifactId>
                <version>1.8.4</version>
            </dependency>
    gebruiken, via https://github.com/DOV-Vlaanderen/geoserver-manager en
    https://docs.geoserver.geo-solutions.it/edu/en/rest/gs_manager.html
     */

    public GeoServerManager(String baseUrl, String userName, String passWord) {
        this.baseUrl = baseUrl;
        this.userName = userName;
        this.passWord = passWord;
    }

    public boolean createLayer(String layerName, String StyleName, String resourceName, String dataStore) {
        return false;
    }

    public boolean deleteLayer(String layerName) {
        return false;
    }

    public boolean addStyleToLayer(String layerName, String style) {
        return false;
    }
}
