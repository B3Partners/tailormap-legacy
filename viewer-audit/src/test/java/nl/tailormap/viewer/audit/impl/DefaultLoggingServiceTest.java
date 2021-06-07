package nl.tailormap.viewer.audit.impl;

import nl.tailormap.viewer.audit.LoggingServiceFactory;
import org.junit.Assert;
import org.junit.Test;

import java.io.File;
import java.io.RandomAccessFile;
import java.nio.file.Paths;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;


public class DefaultLoggingServiceTest {

    @Test
    public void testDefaultInstance() {
        Assert.assertEquals("We should have gotten the default logging implementation", DefaultLoggingService.class, LoggingServiceFactory.getInstance().getClass());
    }

    @Test
    public void testLogMessage() throws Exception {
        LoggingServiceFactory.getInstance().logMessage("some user", "Something we want in the audit trail");

        File auditLog = Paths.get(getClass().getClassLoader().getResource("audit.log").toURI()).toFile();
        assertNotNull("The logfile must exist", auditLog);
        assertTrue("Audit rule not as expected.", tail(auditLog).endsWith("some user - Something we want in the audit trail"));
    }

    private String tail(File file) {
        try (RandomAccessFile fileHandler = new RandomAccessFile(file, "r")) {
            long fileLength = fileHandler.length() - 1;
            StringBuilder sb = new StringBuilder();
            for (long filePointer = fileLength; filePointer != -1; filePointer--) {
                fileHandler.seek(filePointer);
                int readByte = fileHandler.readByte();
                if (readByte == 0xA) {
                    if (filePointer == fileLength) {
                        continue;
                    }
                    break;
                } else if (readByte == 0xD) {
                    if (filePointer == fileLength - 1) {
                        continue;
                    }
                    break;
                }
                sb.append((char) readByte);
            }

            return sb.reverse().toString();
        } catch (java.io.IOException e) {
            e.printStackTrace();
            return null;
        }
    }
}
