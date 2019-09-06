package nl.b3p.viewer.stripes;

import net.sourceforge.stripes.action.Resolution;
import nl.b3p.viewer.util.DockerGeoserverTestUtil;
import nl.b3p.viewer.util.TestActionBeanContext;
import org.hamcrest.CoreMatchers;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.runners.Enclosed;
import org.junit.runner.RunWith;

import static nl.b3p.viewer.stripes.FeatureInfoActionBean.FID;


@RunWith(Enclosed.class)
public class EditBulkFeatureActionBeanTest {
    public static class Scaffolding {

        private EditBulkFeatureActionBean instance;

        private static final String FEATURES = "[" +
                "{\"" + FID + "\": 1,\"attr1\": \"val1\"}," +
                "{\"" + FID + "\": 2,\"attr1\": \"val2\"}," +
                "{\"" + FID + "\": 3,\"attr1\": \"val3\"}" +
                "]";

        @Before
        public void init() {
            instance = new EditBulkFeatureActionBean();
        }

        @Test
        public void testCorrectNumberOfFeaturesGetParsed() {
            instance.setFeatures(FEATURES);
            Assert.assertEquals(3, instance.getFeaturesArray().length);
        }

        @Test
        public void testFirstFeatureIsCorrect() {
            instance.setFeatures(FEATURES);
            JSONObject feature = instance.getFeaturesArray()[0];
            Assert.assertEquals(1, feature.get(FID));
            Assert.assertEquals("val1", feature.get("attr1"));
        }
    }

    public static class WithDockerizedGeoserver extends DockerGeoserverTestUtil {

        private EditBulkFeatureActionBean instance;

        public static final String[] FIDS_OK = {"meaningless_unittest_table.1", "meaningless_unittest_table.2", "meaningless_unittest_table.3"};
        public static final String FEATURES_OK = "[" +
                "{\"" + FID + "\": \"meaningless_unittest_table.1\", \"codeword\": \"ALPHA!\"}," +
                "{\"" + FID + "\": \"meaningless_unittest_table.2\", \"codeword\": \"BRAVO!\"}," +
                "{\"" + FID + "\": \"meaningless_unittest_table.3\", \"codeword\": \"CHARLIE!\"}" +
                "]";
        private static final String FEATURES_MISSING_FID = "[" +
                "{\"something\": \"but no fid\"}" +
                "]";

        @Before
        @Override
        public void setUp() throws Exception {
            super.setUp();
            buildInstance();
            mockLifecycleStageEventHandling();
        }

        private void buildInstance() {
            instance = new EditBulkFeatureActionBean();
            instance.setContext(new TestActionBeanContext());
            instance.setEntityManager(entityManager);
            instance.setApplication(app);
            instance.setAppLayer(testAppLayer);
        }

        private void mockLifecycleStageEventHandling() {
            instance.initAudit();
        }

        @Test
        public void testSuccessResponse() {
            instance.setFeatures(FEATURES_OK);
            JSONObject response = instance.editbulkResponse();
            Assert.assertTrue(response.getBoolean("success"));
            Assert.assertFalse(response.has("error"));

            JSONArray fids = response.getJSONArray(FID);
            Assert.assertEquals(3, fids.length());
            Assert.assertThat(fids, CoreMatchers.hasItems(FIDS_OK));

            // TODO: verify if features are actually changed in the FeatureSource.
        }

        @Test
        public void testMissingFeatureIdResponse() {
            instance.setFeatures(FEATURES_MISSING_FID);
            JSONObject response = instance.editbulkResponse();
            Assert.assertFalse(response.getBoolean("success"));
            Assert.assertThat(response.getString("error"), CoreMatchers.containsString("MissingFeatureIdException"));
        }

        @Test
        public void testStreamingResolution() {
            instance.setFeatures(FEATURES_OK);
            Resolution resolution = instance.editbulk();
            Assert.assertNotNull(resolution);
        }
    }
}
