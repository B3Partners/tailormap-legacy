/*
 * Copyright (C) 2018 B3Partners B.V.
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

package nl.b3p.viewer.stripes;

import java.io.FileInputStream;

import java.util.Properties;
import nl.b3p.viewer.config.services.WFSFeatureSource;
import nl.b3p.viewer.util.TestUtil;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.DataStore;
import org.geotools.data.Query;
import org.geotools.feature.FeatureIterator;
import org.junit.Test;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.type.PropertyDescriptor;

/**
 * Unit test for simple testing of reading a single feature from a WFS using GeoTools.
 *
 * Run from command line:
 * <pre>{@code
 * cat > ~/mycredentials.properties
 * user=myusername
 * password=mypassword
 * [Control-D]
 * }</pre>
 *
 * {@code mvn -Durl=... -Dcredentials=/home/$USER/mycredentials.properties -Dtypename=... -DtrimStackTrace=false -Dtest=GeoToolsWfsTest test}
 *
 * Example:
 *
 * {@code mvn -Durl=https://flamingo4.b3p.nl:443/geoserver/Test_omgeving/wfs -Dtypename=Test_omgeving:cbs_gemeente_2014 -DtrimStackTrace=false -Dtest=GeoToolsWfsTest test}
 *
 * @author matthijsln
 */
public class GeoToolsWfsTest extends TestUtil {

    private static final Log log = LogFactory.getLog(GeoToolsWfsTest.class);
    @Test
    public void testWfs() throws Exception {
        String url = System.getProperty("url");

        if(url == null) {
            log.info("Test not configured, passing");
            return;
        }

        String credentials = System.getProperty("credentials");
        String username = null, password = null, logPassword = null;
        if(credentials != null) {
            Properties p = new Properties();
            p.load(new FileInputStream(credentials));
            username = p.getProperty("user");
            password = p.getProperty("password");
            if(password != null) {
                logPassword = new String(new char[password.length()]).replace("\0", "*");
            }
        }
        String typeName = System.getProperty("typename");

        if(url == null || typeName == null) {
            throw new RuntimeException("url or typename properties must be specified!");
        }

        log.info(String.format("Running WFS test for: %s, user %s, password=%s, typename %s", url, username, logPassword, typeName));

        WFSFeatureSource ffs = new WFSFeatureSource();
        ffs.setUrl(url);
        ffs.setUsername(username);
        ffs.setPassword(password);
        DataStore ds = ffs.createDataStore(null);
        FeatureIterator<SimpleFeature> it = null;
        try {
            org.geotools.data.FeatureSource fs = ds.getFeatureSource(typeName);

            for(PropertyDescriptor pd: fs.getSchema().getDescriptors()) {
                log.info("Property " + pd.getName() + ": " + pd.getType().getBinding().toString());
            }

            final Query q = new Query(fs.getName().toString());
            q.setMaxFeatures(1);

            it = fs.getFeatures(q).features();
            int featureIndex = 0;
            while(it.hasNext()) {
                SimpleFeature feature = it.next();

                log.info(String.format("Feature #%d: %s", featureIndex, feature));
                featureIndex++;
            }
        } finally {
            if(it != null) {
                it.close();
            }
            ds.dispose();
        }
    }
}
