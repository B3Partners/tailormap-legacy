/*
 * Copyright (C) 2012-2013 B3Partners B.V.
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
package nl.tailormap.viewer.admin.monitoring;

import nl.tailormap.mail.Mailer;
import nl.tailormap.viewer.config.security.Group;
import nl.tailormap.viewer.config.security.User;
import nl.tailormap.viewer.config.services.GeoService;
import nl.tailormap.viewer.helpers.services.GeoserviceFactoryHelper;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.quartz.InterruptableJob;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.quartz.UnableToInterruptJobException;
import org.stripesstuff.stripersist.Stripersist;

import javax.persistence.EntityManager;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 *
 * @author Matthijs Laan
 */
public class MonitorJob implements Job, InterruptableJob {
    private static final Log log = LogFactory.getLog(MonitorJob.class);
    
    private boolean interrupted = false;
    
    public void interrupt() throws UnableToInterruptJobException {
        log.info("Setting interrupt flag");
        interrupted = true;
    }    
        
    private boolean isInterrupted() {
        return interrupted;
    }
    
    public void execute(JobExecutionContext jec) throws JobExecutionException {

        try {
            Stripersist.requestInit();
            EntityManager em = Stripersist.getEntityManager();

            StringBuilder monitoringFailures = new StringBuilder();

            int online = 0, offline = 0;
            
            // TODO: where monitoringEnabled = true...
            for(GeoService gs: (List<GeoService>)em.createQuery("from GeoService").getResultList()) {

                String debugMsg = String.format("%s service %s (#%d) with URL: %s",
                            gs.getProtocol(),
                            gs.getName(),
                            gs.getId(),
                            gs.getUrl()
                            );
                try {
                    
                    if(isInterrupted()) {
                        log.info("Interrupted, ending monitoring job");
                        return;
                    }

                    GeoserviceFactoryHelper.checkServiceOnline(em, gs);
                    online++;
                    gs.setMonitoringStatusok(true);
                    log.debug("ONLINE: " + debugMsg);
                } catch(Exception e) {
                    gs.setMonitoringStatusok(false);
                    offline++;
                    log.debug("OFFLINE: " + debugMsg);
                    if(log.isTraceEnabled()) {
                        log.trace("Exception", e);
                    }
                    String message = e.toString();
                    Throwable cause = e.getCause();
                    while(cause != null) {
                        message += "; " + cause.toString();
                        cause = cause.getCause();
                    }
                    monitoringFailures.append(String.format("%s service %s (#%d)\nURL: %s\nFout: %s\n\n",
                            gs.getProtocol(),
                            gs.getName(),
                            gs.getId(),
                            gs.getUrl(),
                            message));
                }
            }
            
            em.getTransaction().commit();

            log.info(String.format("Total services %d, online: %d, offline: %d, runtime: %d s",
                    online+offline,
                    online,
                    offline,
                    jec.getJobRunTime() / 1000));
            
            if(offline > 0) {
                
                Set emails = new HashSet();
                for(User admin: (List<User>)em.createQuery("select u from User u "
                        + "join u.groups g "
                        + "where g.name = '" + Group.SERVICE_ADMIN + "' ").getResultList()) {
                    emails.add(admin.getDetails().get(User.DETAIL_EMAIL));
                }
                emails.remove(null);
                
                if(!emails.isEmpty()) {
                    StringBuilder mail = new StringBuilder();

                    SimpleDateFormat f = new SimpleDateFormat("dd-MM-yyy HH:mm:ss");
                    mail.append(String.format("Bij een controle op %s zijn in het gegevensregister %d services gevonden waarbij fouten zijn geconstateerd.\n"
                            + "\nDe volgende controle zal worden uitgevoerd op %s.\nHieronder staat de lijst met probleemservices:\n\n",
                            f.format(jec.getFireTime()),
                            offline,
                            f.format(jec.getNextFireTime())));
                    mail.append(monitoringFailures);
                    
                    mail(jec, emails, offline + " services zijn offline bij controle", mail.toString());
                }
                
            }
        } catch(Exception e) {
            log.error("Error", e);
        } finally {
            Stripersist.requestComplete();
        }
        
    }
    
    private void mail(JobExecutionContext jec, Set emails, String subject, String mail) {
        try {
            log.info("Sending mail to service admins: " + Arrays.toString(emails.toArray()));

            for(String email: (Set<String>)emails) {
                if(isInterrupted()) {
                    log.info("Interrupted, ending monitoring job");
                    return;
                }               

                try {
                    Mailer.sendMail(
                            (String)jec.getJobDetail().getJobDataMap().get("from.name"),
                            (String)jec.getJobDetail().getJobDataMap().get("from.email"),
                            email, subject, mail);
                } catch(Exception e) {
                    log.error("Error sending mail to service admin " + email, e);
                }
            }
        } catch(Exception e) {
            log.error("Error sending mail to service admins", e);
        }        
    }
    
}
