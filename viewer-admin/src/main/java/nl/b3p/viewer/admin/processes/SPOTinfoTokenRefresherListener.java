package nl.b3p.viewer.admin.processes;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class SPOTinfoTokenRefresherListener implements ServletContextListener {
    private static final Log LOG = LogFactory.getLog(SPOTinfoTokenRefresherListener.class);
    private static final int DEFAULT_REFRESH_INTERVAL_MINUTES = 60;
    private static ServletContext context;
    private ScheduledExecutorService processThread;

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        LOG.info("starting SPOTinfoTokenRefresher thread.");
        init(sce);
        Runnable updateToken = () -> {
            SPOTinfoTokenRefresher tokenRefresher = new SPOTinfoTokenRefresher();
            tokenRefresher.refreshTokens();
        };
        processThread = Executors.newSingleThreadScheduledExecutor();
        int refreshInterval = DEFAULT_REFRESH_INTERVAL_MINUTES;
        try {
            refreshInterval = Integer.parseInt(context.getInitParameter("spotinfo.token.refresh.interval"));
        } catch (NumberFormatException | NullPointerException e) {

        }
        LOG.info("Using " + refreshInterval + "-minute refresh interval for SPOTinfo access token.");
        processThread.scheduleAtFixedRate(updateToken, 1, refreshInterval, TimeUnit.MINUTES);
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        LOG.info("Stopping SPOTinfoTokenRefresher thread.");
        if (processThread != null) {
            processThread.shutdown();
        }
    }

    private void init(ServletContextEvent sce) {
        context = sce.getServletContext();
    }
}
