package nl.b3p.viewer.util;

import nl.b3p.viewer.util.docker.DockerGeoserverHelper;
import org.junit.After;
import org.junit.Assume;
import org.junit.Before;

public abstract class DockerGeoserverTestUtil extends TestUtil {

    private boolean isDockerRunning = false;
    private DockerGeoserverHelper helper = new DockerGeoserverHelper();

    //<editor-fold defaultstate="collapsed" desc="getters and setters">
    public DockerGeoserverHelper getHelper() {
        return helper;
    }

    public boolean isDockerRunning() {
        return isDockerRunning;
    }
    //</editor-fold>

    @Before
    @Override
    public void setUp() throws Exception {
        DockerGeoserverHelper helper = new DockerGeoserverHelper();
        url = helper.getOwsUri().toString();
        layerName = "flamingo:meaningless_unittest_table";
        geometryAttribute = "geom";

        isDockerRunning = (new DockerGeoserverHelper()).isRunning();
        Assume.assumeTrue("skip test if dockerized geoserver is not running", isDockerRunning);

        super.setUp();
        initData(true);
    }

    @After
    @Override
    public void closeTransaction() {
        if (isDockerRunning) {
            super.closeTransaction();
        }
    }
}
