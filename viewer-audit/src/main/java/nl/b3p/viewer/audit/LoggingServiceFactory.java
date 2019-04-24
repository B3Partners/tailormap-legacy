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
package nl.b3p.viewer.audit;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.ServiceLoader;

/**
 * Factory interface for {@link LoggingService} instances.
 *
 * @author mprins
 */
public interface LoggingServiceFactory {
    Log LOG = LogFactory.getLog(LoggingServiceFactory.class);

    /**
     * returns a list of known implementations of {@link LoggingService}.
     *
     * @return List of available logging service providers.
     */
    static List<LoggingService> getInstances() {
        ServiceLoader<LoggingService> services = ServiceLoader.load(LoggingService.class);
        List<LoggingService> loggingServices = new ArrayList<>();
        services.iterator().forEachRemaining(loggingServices::add);
        return loggingServices;
    }

    /**
     * Get the current {@link LoggingService}.
     *
     * @return current logging service provider
     */
    static LoggingService getInstance() {
        List<LoggingService> loggingServices = LoggingServiceFactory.getInstances();
        LoggingService service = null;
        if (loggingServices.size() == 1) {
            service = loggingServices.get(0);
        } else {
            while (loggingServices.iterator().hasNext()) {
                service = loggingServices.iterator().next();
                LOG.debug("found audit log provider: " + service);
                if (service instanceof nl.b3p.viewer.audit.impl.DefaultLoggingService) {
                    continue;
                } else {
                    break;
                }
            }
        }
        LOG.debug("using audit log provider: " + service);
        return service;
    }
}
