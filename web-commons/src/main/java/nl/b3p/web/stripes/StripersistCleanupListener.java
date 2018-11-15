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
package nl.b3p.web.stripes;

import java.lang.reflect.Method;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import org.geotools.factory.GeoTools;
import org.stripesstuff.stripersist.Stripersist;

/**
 * Explicitly calls Stripersist.cleanup() when the context is destroyed, so that
 * it isn't only called later on when the Stripersist finalizer is invoked, which
 * may lead to the following exception:
 * 
 * INFO: Illegal access: this web application instance has been stopped already.  Could not load org.hibernate.event.EventListeners$2.  The eventual following stack trace is caused by an error thrown for debugging purposes as well as to attempt to terminate the thread which caused the illegal access, and has no functional impact.
 *  java.lang.IllegalStateException
 *	at org.apache.catalina.loader.WebappClassLoader.loadClass(WebappClassLoader.java:1564)
 *	at org.apache.catalina.loader.WebappClassLoader.loadClass(WebappClassLoader.java:1523)
 *	at org.hibernate.event.EventListeners.destroyListeners(EventListeners.java:215)
 *	at org.hibernate.impl.SessionFactoryImpl.close(SessionFactoryImpl.java:972)
 *	at org.hibernate.ejb.EntityManagerFactoryImpl.close(EntityManagerFactoryImpl.java:127)
 *	at org.stripesstuff.stripersist.Stripersist.cleanup(Stripersist.java:501)
 *	at org.stripesstuff.stripersist.Stripersist.finalize(Stripersist.java:511)
 *	at java.lang.ref.Finalizer.invokeFinalizeMethod(Native Method)
 *	at java.lang.ref.Finalizer.runFinalizer(Finalizer.java:83)
 *	at java.lang.ref.Finalizer.access$100(Finalizer.java:14)
 *	at java.lang.ref.Finalizer$FinalizerThread.run(Finalizer.java:160)
 * 
 * @author matthijsln
 */
public class StripersistCleanupListener implements ServletContextListener {

    @Override
    public void contextInitialized(ServletContextEvent sce) {
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        try {
            Stripersist.class.getDeclaredMethod("retrieveItems").invoke(null);
        } catch(Exception ex) {
        }
    }
}
