package nl.b3p.viewer.userlayer;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import static org.junit.Assert.assertTrue;

public class GeoServerManagerOnlineTest {
    private GeoServerManager serverManager;
    private String layerName;

    @Before
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

    @After
    public void cleanup() {
        serverManager.deleteLayer(layerName);
    }

    @Test
    public void createLayerTest() {
        assertTrue(serverManager.createLayer(layerName, "test", "gemeenten2020"));
    }

    @Test
    public void deleteLayerTest() {
        assertTrue(serverManager.createLayer("gemtest", "gemtest", "gemeenten2020"));
        assertTrue(serverManager.deleteLayer("gemtest"));
    }

}
