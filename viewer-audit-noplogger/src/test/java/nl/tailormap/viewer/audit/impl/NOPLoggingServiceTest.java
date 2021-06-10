package nl.tailormap.viewer.audit.impl;

import nl.tailormap.viewer.audit.LoggingServiceFactory;
import org.junit.Assert;
import org.junit.Test;

public class NOPLoggingServiceTest {
    @Test
    public void testInstance() {
        Assert.assertEquals("We should have gotten the NOP logging implementation", NOPLoggingService.class, LoggingServiceFactory.getInstance().getClass());
    }
}
