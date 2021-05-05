package nl.viewer.audit.impl;

import nl.viewer.audit.LoggingServiceFactory;
import org.junit.Test;

import static org.junit.Assert.assertEquals;

public class NOPLoggingServiceTest {
    @Test
    public void testInstance() {
        assertEquals("We should have gotten the NOP logging implementation", NOPLoggingService.class, LoggingServiceFactory.getInstance().getClass());
    }
}
