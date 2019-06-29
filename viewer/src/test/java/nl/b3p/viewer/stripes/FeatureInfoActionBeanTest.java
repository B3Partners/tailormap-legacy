package nl.b3p.viewer.stripes;

import nl.b3p.viewer.util.DockerGeoserverTestUtil;
import nl.b3p.viewer.util.TestActionBeanContext;
import org.hamcrest.CoreMatchers;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.Assert;
import org.junit.Assume;
import org.junit.Before;
import org.junit.Test;

import javax.persistence.EntityManager;

import static nl.b3p.viewer.stripes.FeatureInfoActionBean.FID;

public class FeatureInfoActionBeanTest {
    public static class WithDockerizedGeoserver extends DockerGeoserverTestUtil {

        private FeatureInfoActionBean instance;

        @Before
        @Override
        public void setUp() throws Exception {
            super.setUp();
            buildInstance();
        }

        private void buildInstance() {
            instance = getTestableInstance();
            instance.setContext(new TestActionBeanContext());
            instance.setApplication(app);
            mockLifecycleStageEventHandling();
        }

        private FeatureInfoActionBean getTestableInstance() {
            return new FeatureInfoActionBean() {
                @Override
                protected EntityManager getEntityManager() {
                    return entityManager;
                }
            };
        }

        private void mockLifecycleStageEventHandling() {
            instance.initAudit();
        }

        @Test
        public void testGetSingleFeatureFromSingleLayerInEditMode() {
            instance.setX("100");
            instance.setY("100");
            instance.setDistance("20.16");
            instance.setEdit(false);
            instance.setArrays(true);
            instance.setQueryJSON("[{\"appLayer\": \"" + testAppLayer.getId() + "\"}]");

            // will look something like this
            // [{"request":{"appLayer":"6"},"features":[{"__fid":"meaningless_unittest_table.1"}],"featureType":7}]
            JSONArray responses = instance.infoResponses();
            JSONObject response = responses.getJSONObject(0);
            JSONObject request = response.getJSONObject("request");
            JSONArray features = response.getJSONArray("features");
            JSONObject feature = features.getJSONObject(0);

            Assert.assertEquals(1, responses.length());
            Assert.assertEquals(testAppLayer.getId().toString(), request.getString("appLayer"));
            Assert.assertEquals(1, features.length());
            Assert.assertEquals("meaningless_unittest_table.1", feature.getString(FID));
        }
    }
}
