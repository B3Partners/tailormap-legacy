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
package nl.b3p.web.stripes;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import nl.b3p.viewer.audit.LoggingServiceFactory;

/**
 * Scan the classpath for audit logging providers on startup of the webapp.
 *
 * @author Mark Prins
 */
public class AuditLogginingInitializer implements ServletContextListener {

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        LoggingServiceFactory.getInstances();
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
    }
}
