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
package nl.b3p.viewer.audit.strategy;

import net.sourceforge.stripes.action.ActionBean;
import nl.b3p.viewer.audit.Auditable;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 *
 * @author Meine Toonen
 */
public class LoggingStrategyFactory {

    private static final Log LOG = LogFactory.getLog(LoggingStrategyFactory.class);

    public static LoggingStrategy getStrategy(ActionBean ab) {
        if (ab == null) {
            LOG.debug("Auditing with null actionbean not possible");
            return null;
        }
        if (ab instanceof Auditable) {
            if (ab.getClass().getSimpleName().equals("EditFeatureActionBean")) {
                return new EditLogging();
            } else {
                return new DefaultLogging();
            }
        } else {
            LOG.debug("No strategy for class found: " + ab.getClass().getCanonicalName());
            return null;
        }
    }
}
