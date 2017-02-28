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
package nl.b3p.viewer.admin.monitoring;

import nl.b3p.mail.Mailer;
import java.util.Date;
import java.util.Properties;
import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.quartz.*;
import org.quartz.impl.StdSchedulerFactory;

/**
 *
 * @author Matthijs Laan
 */
public class GeoServiceMonitoringListener implements ServletContextListener {
    private static final String PARAM_INTERVAL = "monitoring.schedule.minutes";
    private static final String PARAM_MAIL_FROM_EMAIL = "monitoring.mail.from.email";
    private static final String PARAM_MAIL_FROM_NAME = "monitoring.mail.from.name";
    
    private static final Log log = LogFactory.getLog(GeoServiceMonitoringListener.class);

    private ServletContext context;
    
    private Scheduler scheduler;
    
    @Override
    public void contextInitialized(ServletContextEvent sce) {        
        this.context = sce.getServletContext();
        
        String interval = context.getInitParameter(PARAM_INTERVAL);
        if(interval == null || "-1".equals(interval)) {
            return;
        }

        try {
            Mailer.getMailSession();
        } catch(Exception e) {
            log.error("Error getting mail session, monitoring disabled! Please configure the JNDI JavaMail Session resource correctly.", e);
            return;
        }
        
        try {
            setupQuartz();
        } catch(Exception e) {
            log.error("Error setting up Quartz, monitoring disabled!", e);
            return;
        }        
    }
    
    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        try {
            stopQuartz();
        } catch(Exception e) {
            log.error("Error stopping Quartz monitoring", e);
        }
    }    
    
    private void setupQuartz() throws SchedulerException {
        Properties props = new Properties();
        props.put("org.quartz.scheduler.instanceName", "MonitoringScheduler");
        props.put("org.quartz.threadPool.threadCount", "3");
        props.put("org.quartz.scheduler.interruptJobsOnShutdownWithWait", "true");
        // Job store for monitoring does not need to be persistent
        props.put("org.quartz.jobStore.class", "org.quartz.simpl.RAMJobStore");

        int minutes = 15;
        
        try {
            minutes = Integer.parseInt(context.getInitParameter(PARAM_INTERVAL));
        } catch(NumberFormatException nfe) {
        }

        scheduler = new StdSchedulerFactory(props).getScheduler();
        scheduler.startDelayed(60);
        
        JobDetail job = JobBuilder.newJob(MonitorJob.class)
            .withIdentity("monitorjob", "monitorgroup")
            .usingJobData("from.email", context.getInitParameter(PARAM_MAIL_FROM_EMAIL))
            .usingJobData("from.name", context.getInitParameter(PARAM_MAIL_FROM_NAME))
            .build();
        
        log.info("Scheduling monitoring job for every " + minutes + " minutes");
        
        Trigger trigger = TriggerBuilder.newTrigger()
            .withIdentity("monitorjobtrigger", "monitorgroup")
            .startNow()
            .withSchedule(SimpleScheduleBuilder.repeatMinutelyForever(minutes))
            .build();

        scheduler.scheduleJob(job, trigger);
    }
    
    private void stopQuartz() throws SchedulerException {
        if(scheduler != null) {
            scheduler.shutdown(true);
        }
    }
}
