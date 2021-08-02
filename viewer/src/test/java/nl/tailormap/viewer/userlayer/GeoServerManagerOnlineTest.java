package nl.tailormap.viewer.userlayer;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class GeoServerManagerOnlineTest {
    private GeoServerManager serverManager;
    private String layerName;

    @BeforeEach
    public void setUp() {
        final String baseUrl = "http://localhost:8080/geoserver/";
        final String userName = "admin";
        final String passWord = "geoserver";
        final String workSpace = "geoserver";
        final String storeName = "dingetjes";
        final String tableName = "gemeenten2020";

        layerName = (new PostgreSQL(null)).createViewName(tableName);
        serverManager = new GeoServerManager(
                baseUrl, userName, passWord, workSpace, storeName
        );
    }

    @AfterEach
    public void cleanup() {
        serverManager.deleteLayer(layerName);
    }

    @Test
    @Disabled("fails with non existing geoserver")
    public void createLayerTest() {
        assertTrue(serverManager.createLayer(layerName, "test", "gemeenten2020"));
    }

    @Test
    @Disabled("fails with non existing geoserver")
    public void deleteLayerTest() {
        assertTrue(serverManager.createLayer("gemtest", "gemtest", "gemeenten2020"));
        assertTrue(serverManager.deleteLayer("gemtest"));
    }

}
