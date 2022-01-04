/*
 * Copyright (C) 2015-2021 B3Partners B.V.
 */
package nl.tailormap.viewer.util;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.TestInfo;

/**
 * Extend this class to get logging of your test methods.
 *
 * @author Mark Prins
 */
public class LoggingTestUtil {

    private static final Log LOG = LogFactory.getLog(LoggingTestUtil.class);

    /**
     * Log de naam van de test als deze begint.
     */
    @BeforeEach
    public void startTest(TestInfo testInfo) {
        LOG.info("==== Start test methode: " + testInfo.getDisplayName());
    }

    /**
     * Log de naam van de test als deze eindigt.
     */
    @AfterEach
    public void endTest(TestInfo testInfo) {
        LOG.info("==== Einde test methode: " + testInfo.getDisplayName());
    }
}
