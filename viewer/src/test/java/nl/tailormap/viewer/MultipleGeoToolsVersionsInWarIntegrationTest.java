package nl.tailormap.viewer;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.fail;

/**
 * Check content of viewer war for duplicate versions of GeoTools by checking if there are mre than
 * one {@code gt-main} artifacts. Use:
 * {@code mvn -pl viewer clean verify -Dit.test=MultipleGeoToolsVersionsInWarIntegrationTest -Dtest.skip.integrationtests=true}
 * to run just this test.
 */
public class MultipleGeoToolsVersionsInWarIntegrationTest {

    private static final Log LOG = LogFactory.getLog(MultipleGeoToolsVersionsInWarIntegrationTest.class);

    @Test
    public void testViewerWarBuildDirectoryContents() {
        final String viewerWarBuildPath = "target/viewer-" + System.getProperty("tailormap.version") + "/WEB-INF/lib";

        LOG.debug("Checking directory: " + viewerWarBuildPath + " for gt-main artifacts.");

        try (Stream<Path> walk = Files.walk(Paths.get(viewerWarBuildPath))) {

            List<String> result = walk.map(x -> x.toString())
                    .filter(f -> f.contains("gt-main"))
                    .collect(Collectors.toList());

            assertFalse(result.isEmpty(), "No gt-main artifact in the war file build directory");
            assertEquals(1, result.size(), "There are more than 1 gt-main artifacts in the viewer war file build directory");

        } catch (IOException e) {
            LOG.error(e);
            fail(e.getLocalizedMessage());
        }
    }


    @Test
    public void testViewerWarContents() {
        final String viewerWar = "target/viewer-" + System.getProperty("tailormap.version") + ".war";

        LOG.debug("Checking viewer war: " + viewerWar + " for gt-main artifacts.");

        try {
            ZipFile zipFile = new ZipFile(viewerWar);
            Enumeration<? extends ZipEntry> e = zipFile.entries();
            List<ZipEntry> result = new ArrayList<>();

            while (e.hasMoreElements()) {
                ZipEntry entry = e.nextElement();
                if (!entry.isDirectory()) {
                    if (entry.getName().contains("gt-main")) {
                        result.add(entry);
                    }
                }
            }

            assertFalse(result.isEmpty(), "No gt-main artifact in viewer the war file");
            assertEquals(1, result.size(), "There are more than 1 gt-main artifacts in the viewer war file");

        } catch (IOException e) {
            LOG.error(e);
            fail(e.getLocalizedMessage());
        }
    }
}
