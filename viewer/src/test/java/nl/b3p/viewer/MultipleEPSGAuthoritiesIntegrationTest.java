/*
 * Copyright (C) 2019 B3Partners B.V.
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
package nl.b3p.viewer;


import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.junit.Test;

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

import static junit.framework.TestCase.assertTrue;
import static junit.framework.TestCase.fail;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;

/**
 * Check content of viewer war for duplicate GeoTools EPSG authorities, there can be only one. Use
 * {@code mvn -pl viewer clean verify -Dit.test=MultipleEPSGAuthoritiesIntegrationTest -Dtest.skip.integrationtests=true}
 * to run just this test.
 */
public class MultipleEPSGAuthoritiesIntegrationTest {
    private static final Log LOG = LogFactory.getLog(MultipleGeoToolsVersionsInWarIntegrationTest.class);

    @Test
    public void testViewerWarBuildDirectoryContents() {
        final String viewerWarBuildPath = "target/viewer-" + System.getProperty("flamingo.version") + "/WEB-INF/lib";

        LOG.debug("Checking directory: " + viewerWarBuildPath + " for gt-epsg artifacts.");

        try (Stream<Path> walk = Files.walk(Paths.get(viewerWarBuildPath))) {

            List<String> result = walk.map(x -> x.toString())
                    .filter(f -> f.contains("gt-epsg"))
                    .collect(Collectors.toList());

            assertFalse("No gt-epsg artifact in the war file build directory", result.isEmpty());
            assertEquals("There are more than 1 gt-epsg artifacts in the viewer war file build directory", 1, result.size());
            assertTrue("The gt-epsg artifact is not gt-epsg-wkt", result.get(0).contains("gt-epsg-wkt"));

        } catch (IOException e) {
            LOG.error(e);
            fail(e.getLocalizedMessage());
        }
    }


    @Test
    public void testViewerWarContents() {
        final String viewerWar = "target/viewer-" + System.getProperty("flamingo.version") + ".war";

        LOG.debug("Checking viewer war: " + viewerWar + " for gt-epsg artifacts.");

        try {
            ZipFile zipFile = new ZipFile(viewerWar);
            Enumeration<? extends ZipEntry> e = zipFile.entries();
            List<ZipEntry> result = new ArrayList<>();

            while (e.hasMoreElements()) {
                ZipEntry entry = e.nextElement();
                if (!entry.isDirectory()) {
                    if (entry.getName().contains("gt-epsg")) {
                        result.add(entry);
                    }
                }
            }

            assertFalse("No gt-epsg artifact in viewer the war file", result.isEmpty());
            assertEquals("There are more than 1 gt-epsg artifacts in the viewer war file", 1, result.size());
            assertTrue("The gt-epsg artifact is not gt-epsg-wkt", result.get(0).getName().contains("gt-epsg-wkt"));

        } catch (IOException e) {
            LOG.error(e);
            fail(e.getLocalizedMessage());
        }
    }
}
