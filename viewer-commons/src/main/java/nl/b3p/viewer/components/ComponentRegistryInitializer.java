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
package nl.b3p.viewer.components;

import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 * Context listener which will create the static ComponentRegistry instance on
 * startup and will load components from directories or from another context
 * (possibly on-demand).
 * 
 * @author matthijsln
 */
public class ComponentRegistryInitializer implements ServletContextListener {
    
    private static final Log log = LogFactory.getLog(ComponentRegistryInitializer.class);
    
    /**
     * The default path in the webapp to load components from if no other directories
     * are specified.
     */
    private static final String DEFAULT_COMPONENT_PATH = "/viewer-html/components";
    
    /**
     * Context parameter name for loading components from another context. If 
     * this is configured it takes priority over any configured PARAM_PATH.
     */
    private static final String PARAM_CROSS_CONTEXT = "componentregistry.crosscontext";
    
    /**
     * Context parameter name for the comma-separated list of directories to load
     * components from. Can be absolute paths or relative paths, relative paths
     * will be treated as webapp paths and converted to absolute paths using
     * ServletContext.getRealPath().
     */
    private static final String PARAM_PATH = "componentregistry.path";
    
    /**
     * Deprecated context param name, use PARAM_PATH.
     */
    private static final String PARAM_PATH_OLD = "component-path";
    
    private static ComponentRegistry registry;

    private static ServletContext servletContext;
    
    private static String crossContextName;
    private static boolean retryLoading = true;
    private static String componentPath;
    
    public void contextInitialized(ServletContextEvent sce) {
        servletContext = sce.getServletContext();
        
        ComponentRegistryInitializer.registry = new ComponentRegistry();
        
        /* checkout the configuration */
        
        /* this parameter takes precedence over the path param */
        crossContextName = servletContext.getInitParameter(PARAM_CROSS_CONTEXT);
        
        componentPath = servletContext.getInitParameter(PARAM_PATH);
        if(componentPath == null) {
            /* try the deprecated parameter name */
            componentPath = servletContext.getInitParameter(PARAM_PATH_OLD);
        }
        if(componentPath == null) {
            /* use the default - because the cross context param takes precedence
             * this is never null, but the default at least
             */
            componentPath = DEFAULT_COMPONENT_PATH;
        }
        ServletContext pathContext = servletContext;
        if(crossContextName != null){        
            log.info("Looking at cross context \"" + crossContextName + "\" for component paths...");
            ServletContext crossContext = servletContext.getContext(crossContextName);
            if (crossContext!=null){
                pathContext=crossContext;
            }
        }
        
        tryComponentLoading();
    }
    
    private static synchronized void tryComponentLoading() {
        if(!retryLoading) {
            return;
        }
        
        if(crossContextName != null) {
            tryLoadCrossContextComponents();
        } else {
            retryLoading = false;
            loadLocalComponents();
            
            // if failed, tryLocalComponetLoading has already logged ERROR messages
            // including the useful results from getRealPath() which we can't log here
            // without splitting and calling getRealPath() again so no logging here
        }
    }
    
    private static void loadLocalComponents() {
        for(String p: componentPath.split(",")) {
            try {
                registry.loadFromPath(servletContext, p);
            } catch(Exception e) {
                log.error("Error loading components from path \"" + p + "\"", e);
            }
        }    
    }
    
    private static void tryLoadCrossContextComponents() {
        assert(crossContextName != null);
        
        log.info("Looking at cross context \"" + crossContextName + "\" for components...");
        ServletContext crossContext = servletContext.getContext(crossContextName);
        if(crossContext == null) {
            log.error("Cannot get cross context for name \"" + crossContextName + "\", is it deployed? Can't load components from it!");
            retryLoading = true;
        } else {
            log.debug("Context found, checking context parameters for paths...");
            
            /* load path init params from cross context or use default */
            String crossContextComponentPath = crossContext.getInitParameter(PARAM_PATH);
            if(crossContextComponentPath == null) {
                crossContextComponentPath = crossContext.getInitParameter(PARAM_PATH_OLD);
            }
            if(crossContextComponentPath == null) {
                crossContextComponentPath = DEFAULT_COMPONENT_PATH;
            }
            log.info("Cross context component path: \"" + crossContextComponentPath + "\"");
            for(String p: crossContextComponentPath.split(",")) {
                try {
                    log.info(String.format("Loading component metadata from cross context \"%s\" path \"%s\"", crossContextName, p));
                            
                    registry.loadFromPath(crossContext, p);
                } catch(Exception e) {
                    log.error(String.format("Error loading components from cross context \"%s\", path \"%s\"", crossContextName, p), e);
                }
            }    
            
            /* only stop retrying if components are actually loaded - sometimes
             * Tomcat erroniously returns the ROOT context!
             */
            if(!registry.getSortedComponentClassNameList().isEmpty()) {
                retryLoading = false;
            }
        }
    }

    public void contextDestroyed(ServletContextEvent sce) {
    
    }
    
    public static ComponentRegistry getInstance() {
        tryComponentLoading();
        return registry;
    }
}
