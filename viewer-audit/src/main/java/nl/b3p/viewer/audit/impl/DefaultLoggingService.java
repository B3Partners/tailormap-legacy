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
package nl.b3p.viewer.audit.impl;

import nl.b3p.viewer.audit.LoggingService;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 * Default implementation of {@link LoggingService}.
 * Uses the configured logging framework to write audit logging.
 * eg. for log4j:
 * <pre>
 *     <appender name="auditlog" class="org.apache.log4j.RollingFileAppender">
 *         <param name="Threshold" value="info"/>
 *         <param name="file" value="target/auditlog.log"/>
 *         <param name="MaxFileSize" value="10MB"/>
 *         <param name="MaxBackupIndex" value="10"/>
 *         <layout class="org.apache.log4j.PatternLayout">
 *             <param name="ConversionPattern" value="%d{dd MMM yyyy HH:mm:ss} - %m%n"/>
 *         </layout>
 *     </appender>
 *
 *     <logger name="nl.b3p.viewer.audit.impl.DefaultLoggingService" additivity="false">
 *         <level value="info"/>
 *         <appender-ref ref="auditlog"/>
 *     </logger>
 * </pre>
 * 
 * @author mprins
 * @see LoggingService
 */
public final class DefaultLoggingService implements LoggingService {

    private static final Log LOG = LogFactory.getLog(DefaultLoggingService.class);

    /**
     * Log the given message and username.
     *
     * @param user    username to log
     * @param message message to log
     */
    @Override
    public void logMessage(String user, String message) {
        LOG.info(user + " - " + message);
    }
}
