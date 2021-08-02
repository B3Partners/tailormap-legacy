package nl.tailormap.viewer.util;

import nl.tailormap.viewer.util.docker.DockerGeoserverHelper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.TestInfo;

public abstract class DockerGeoserverTestUtil extends TestUtil {

    private boolean isDockerRunning = false;
    private final DockerGeoserverHelper helper = new DockerGeoserverHelper();

    //<editor-fold defaultstate="collapsed" desc="getters and setters">
    public DockerGeoserverHelper getHelper() {
        return helper;
    }

    public boolean isDockerRunning() {
        return isDockerRunning;
    }
    //</editor-fold>

    @BeforeEach
    @Override
    public void setUp(TestInfo testInfo) throws Exception {
        DockerGeoserverHelper helper = new DockerGeoserverHelper();
        url = helper.getOwsUri().toString();
        layerName = "flamingo:meaningless_unittest_table";
        geometryAttribute = "geom";

        isDockerRunning = (new DockerGeoserverHelper()).isRunning();
        Assumptions.assumeTrue(isDockerRunning, "skip test if dockerized geoserver is not running");

        super.setUp(testInfo);
        initData(true);
    }

    @AfterEach
    @Override
    public void closeTransaction() {
        if (isDockerRunning) {
            super.closeTransaction();
        }
    }
}
