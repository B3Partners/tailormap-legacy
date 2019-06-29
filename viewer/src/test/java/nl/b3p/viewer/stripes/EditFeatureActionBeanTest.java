package nl.b3p.viewer.stripes;

import net.sourceforge.stripes.action.Resolution;
import nl.b3p.viewer.util.DockerGeoserverTestUtil;
import nl.b3p.viewer.util.TestActionBeanContext;
import nl.b3p.viewer.util.TestUtil;
import nl.b3p.viewer.util.docker.DockerGeoserverHelper;
import org.json.JSONObject;
import org.junit.*;
import org.junit.experimental.runners.Enclosed;
import org.junit.runner.RunWith;

import javax.persistence.EntityManager;

import static nl.b3p.viewer.stripes.FeatureInfoActionBean.FID;


@RunWith(Enclosed.class)
public class EditFeatureActionBeanTest {

    @RunWith(Enclosed.class)
    public static class WithDockerizedGeoserver {

        public static class EditMode extends DockerGeoserverTestUtil {

            private EditFeatureActionBean instance;

            public static final String FEATURE = "{\"" + FID + "\": \"meaningless_unittest_table.1\", \"codeword\": \"ALPHA!\"}";

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
                instance.setAppLayer(testAppLayer);
                mockLifecycleStageEventHandling();
            }

            private EditFeatureActionBean getTestableInstance() {
                return new EditFeatureActionBean() {
                    @Override
                    protected EntityManager getEntityManager() {
                        return entityManager;
                    }

                    @Override
                    protected boolean isAttributeUserEditingDisabled(String attrName) {
                        return false;
                    }
                };
            }

            private void mockLifecycleStageEventHandling() {
                instance.initAudit();
            }

            @Test
            public void testSuccessResponse() {
                instance.setFeature(FEATURE);
                JSONObject response = instance.editResponse();
                Assert.assertTrue(response.getBoolean("success"));
                Assert.assertEquals("meaningless_unittest_table.1", response.getString(FID));
                Assert.assertFalse(response.has("error"));
            }

            @Test
            public void testStreamingResolution() {
                instance.setFeature(FEATURE);
                Resolution resolution = instance.edit();
                Assert.assertNotNull(resolution);
            }
        }
    }
}
