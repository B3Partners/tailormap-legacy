package nl.b3p.web.geotools;

/*
 * Copyright (C) 2016 B3Partners B.V.
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
import java.io.IOException;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.util.logging.Logging;


/**
 * Sets GeoTools logging to use Log4J, cleans up thread locals after each request,
 * shuts down GeoTools when webapp is undeployed, according to
 * https://www.mail-archive.com/geotools-devel@lists.sourceforge.net/msg21933.html
 *
 * @author Matthijs Laan
 */
public class GeoToolsFilter implements Filter  {
    private static final Log log = LogFactory.getLog(GeoToolsFilter.class);

    @Override
    public void init(FilterConfig fc) throws ServletException {
        try {
            Logging.ALL.setLoggerFactory("org.geotools.util.logging.Log4JLoggerFactory");
        } catch (Exception e) {
        }
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        try {
            chain.doFilter(request, response);
        } finally {
            org.geotools.referencing.CRS.cleanupThreadLocals(); // also calls DefaultMathTransformFactory.cleanupThreadLocals()
            org.geotools.referencing.wkt.Formattable.cleanupThreadLocals();
        }
    }

    @Override
    public void destroy() {
        // See GEOT-2742
        log.info("Calling WeakCollectionCleaner.exit()...");
        org.geotools.util.WeakCollectionCleaner.DEFAULT.exit();

        // See https://www.mail-archive.com/geotools-devel@lists.sourceforge.net/msg21933.html
        log.info("Resetting GeoTools...");
        org.geotools.data.DataAccessFinder.reset();
        org.geotools.data.DataStoreFinder.reset();
        org.geotools.factory.CommonFactoryFinder.reset();
        org.geotools.referencing.ReferencingFactoryFinder.reset();
        org.geotools.referencing.factory.DeferredAuthorityFactory.exit();
    }
}
