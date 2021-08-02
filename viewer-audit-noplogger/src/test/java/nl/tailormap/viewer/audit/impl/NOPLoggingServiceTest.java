package nl.tailormap.viewer.audit.impl;

import nl.tailormap.viewer.audit.LoggingServiceFactory;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

public class NOPLoggingServiceTest {
    @Test
    public void testInstance() {
        Assertions.assertEquals(NOPLoggingService.class, LoggingServiceFactory.getInstance().getClass(), "We should have gotten the NOP logging implementation");
    }
}
