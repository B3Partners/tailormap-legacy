/*
 * Copyright (C) 2011-2016 B3Partners B.V.
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
package nl.tailormap.viewer.config.services;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import javax.persistence.Column;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;

/**
 * Entity for saving WMS service metadata. Enables the administration module to
 * easily work with WMS service entities and the viewer to quickly marshall the
 * metadata without having to do a GetCapabilities request each time the viewer 
 * starts.
 * <p>
 * This requires an option to update the metadata should the service change, so
 * this class implements Updatable.
 * <p>
 * @author Matthijs Laan
 */
@Entity
@DiscriminatorValue(WMSService.PROTOCOL)
public class WMSService extends GeoService {
    private static final Log log = LogFactory.getLog(WMSService.class);
    
    /**
     * JPA DiscriminatorValue for this class.
     */
    public static final String PROTOCOL = "wms";

    /**
     * Parameter to specify the value for #getOverrideUrl().
     */
    public static final String PARAM_OVERRIDE_URL = "overrideUrl";

    /**
     * Parameter to specify the value for {@code skipDiscoverWFS}.
     *
     * @see #skipDiscoverWFS
     */
    public static final String PARAM_SKIP_DISCOVER_WFS = "skipDiscoverWFS";

   
    /* Detail key under which "true" is saved in details if in the WMS capabilities 
     * the <UserDefinedSymbolization> element has a positive SupportSLD attribute.
     */ 
    public static final String DETAIL_SUPPORT_SLD = "SupportSLD";
    
    /* Detail key under which "true" is saved in details if in the WMS capabilities 
     * the <UserDefinedSymbolization> element has a positive UserStyle attribute.
     */ 
    public static final String DETAIL_USER_STYLE = "UserStyle";
    

    /**
     * Additional persistent property for this subclass, so type must be nullable.
     */
    private Boolean overrideUrl;

    /**
     * Additional persistent property for this subclass to remember wether to
     * search for and join WFS attribute sources, so type must be nullable.
     */
    @Column(name="skip_discoverwfs")
    private Boolean skipDiscoverWFS;
    
    @Enumerated(EnumType.STRING)
    private WMSExceptionType exception_type = WMSExceptionType.Inimage;

    /**
     * Whether to use the original URL the Capabilities was loaded with or the
     * URL the WMS reports it is at in the Capabilities. Sometimes the URL reported
     * by the WMS is outdated, but it can also be used to migrate the service
     * to another URL or load Capabilities from a static XML Capabilities document
     * on a simple HTTP server. According to the standard the URL in the Capabilities
     * should be used, so set this to false by default except if the user requests
     * an override.
     *
     * @return true when set
     */
    public Boolean getOverrideUrl() {
        return overrideUrl;
    }

    public void setOverrideUrl(Boolean overrideUrl) {
        this.overrideUrl = overrideUrl;
    }
    
    public WMSExceptionType getException_type() {
        return exception_type;
    }

    public void setException_type(WMSExceptionType exception_type) {
        this.exception_type = exception_type;
    }

    public Boolean getSkipDiscoverWFS() {
        return skipDiscoverWFS;
    }

    public void setSkipDiscoverWFS(Boolean skipDiscoverWFS) {
        this.skipDiscoverWFS = skipDiscoverWFS;
    }

    @Override
    public String toString() {
        return String.format("WMS service \"%s\" at %s", getName(), getUrl());
    }

    //</editor-fold>

}
