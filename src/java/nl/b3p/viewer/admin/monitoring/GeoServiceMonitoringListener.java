/*
 * Copyright (C) 2012 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package nl.b3p.viewer.admin.monitoring;

import java.io.UnsupportedEncodingException;
import java.util.Date;
import javax.mail.Address;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 *
 * @author Matthijs Laan
 */
public class GeoServiceMonitoringListener implements ServletContextListener {
    private static final Log log = LogFactory.getLog(GeoServiceMonitoringListener.class);

    private ServletContext context;
    
    @Override
    public void contextInitialized(ServletContextEvent sce) {        
        log.info("starting monitoring");
        this.context = sce.getServletContext();

        try {
            getMailSession();
        } catch(Exception e) {
            log.error("Error getting mail session, monitoring disabled! Please configure the JNDI JavaMail Session resource correctly.", e);
        }
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        log.info("stopped monitoring");
    }
    
    private Session getMailSession() throws NamingException {
        Context init = new InitialContext();
        Context env = (Context) init.lookup("java:comp/env");
        Session session = (Session)env.lookup("mail/session");
        return session;
    }
    
    private void sendMail(String email, String subject, String mailContent) throws UnsupportedEncodingException, MessagingException, NamingException {
        
        Address from = new InternetAddress(
                context.getInitParameter("monitoring.from.email"), 
                context.getInitParameter("monitoring.from.name"));

        MimeMessage msg = new MimeMessage(getMailSession());
        msg.setFrom(from);
        msg.addRecipient(Message.RecipientType.TO, new InternetAddress(email));
        msg.setSubject(subject);
        msg.setSentDate(new Date());
        msg.setContent(mailContent, "text/plain");

        Transport.send(msg);
    }    
}
