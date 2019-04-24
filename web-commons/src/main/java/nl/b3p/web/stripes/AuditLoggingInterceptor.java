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

import net.sourceforge.stripes.action.ActionBean;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.Resolution;
import net.sourceforge.stripes.controller.ExecutionContext;
import net.sourceforge.stripes.controller.Interceptor;
import net.sourceforge.stripes.controller.Intercepts;
import net.sourceforge.stripes.controller.LifecycleStage;
import nl.b3p.viewer.audit.AuditMessageObject;
import nl.b3p.viewer.audit.Auditable;
import nl.b3p.viewer.audit.strategy.LoggingStrategy;
import nl.b3p.viewer.audit.strategy.LoggingStrategyFactory;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 *
 * @author Mark Prins
 */
@Intercepts(LifecycleStage.ResolutionExecution)
public class AuditLoggingInterceptor implements Interceptor {

    private static final Log LOG = LogFactory.getLog(AuditLoggingInterceptor.class);

    @Override
    public Resolution intercept(ExecutionContext context) throws Exception {
        Resolution resolution = context.proceed();

        ActionBean actionbean = context.getActionBean();
        ActionBeanContext actionbeancontext = context.getActionBeanContext();
        String event = actionbeancontext.getEventName();
        String user = actionbeancontext.getRequest().getRemoteUser();

        LOG.debug("actionbean: " + actionbean);
        LOG.debug("actionbeancontext: " + actionbeancontext);
        LOG.debug("event: " + event);
        LOG.debug("user: " + user);
        try {
            LoggingStrategy ls = LoggingStrategyFactory.getStrategy(actionbean);
            if (ls != null) {
                AuditMessageObject amo = ((Auditable) actionbean).getAuditMessageObject();
                amo.setEvent(actionbean.getClass().getSimpleName() + "#" + event);
                amo.setUsername(user);
                ls.log(((Auditable) actionbean), amo);
            }
        } catch (Exception e) {
            LOG.error("Failed to write audi log: " + e);
        }
        return resolution;
    }

}
