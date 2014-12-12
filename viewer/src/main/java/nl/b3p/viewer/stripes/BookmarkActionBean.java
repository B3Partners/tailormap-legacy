/*
 * Copyright (C) 2012-2013 B3Partners B.V.
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
package nl.b3p.viewer.stripes;

import java.io.StringReader;
import java.util.Date;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.Validate;
import net.sourceforge.stripes.validation.ValidateNestedProperties;
import nl.b3p.viewer.config.app.Bookmark;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONException;
import org.json.JSONObject;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Matthijs Laan
 */
@UrlBinding("/action/bookmark")
@StrictBinding
public class BookmarkActionBean implements ActionBean {
    private static final Log log = LogFactory.getLog(BookmarkActionBean.class);

    private ActionBeanContext context;

    @Validate
    @ValidateNestedProperties(
           @Validate(field="params")
    )
    private Bookmark bookmark;

    //<editor-fold defaultstate="collapsed" desc="getters and setters">
    public ActionBeanContext getContext() {
        return context;
    }

    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public Bookmark getBookmark() {
        return bookmark;
    }

    public void setBookmark(Bookmark bookmark) {
        this.bookmark = bookmark;
    }
    //</editor-fold>

    public Resolution create() throws JSONException {
        JSONObject json = new JSONObject();

        json.put("success", Boolean.FALSE);
        String error = null;

        if(bookmark == null || bookmark.getParams() == null) {
            error = "Invalid parameters";
        } else {
            try {
                String createdBy = "IP: " + context.getRequest().getRemoteAddr();
                if(context.getRequest().getHeader("x-forwarded-for") != null) {
                    createdBy = "IP: " + context.getRequest().getHeader("x-forwarded-for") + "(proxy " + createdBy + ")";
                }
                if(context.getRequest().getRemoteUser() != null) {
                    createdBy += ", user: " + context.getRequest().getRemoteUser();
                }
                bookmark.setCreatedBy(createdBy);
                bookmark.setCreatedAt(new Date());

                Stripersist.getEntityManager().persist(bookmark);
                Stripersist.getEntityManager().getTransaction().commit();

                log.debug("Bookmark created with code " + bookmark.getCode() + " and params " + bookmark.getParams());

                json.put("bookmark", bookmark.getCode());
                json.put("success", Boolean.TRUE);
            } catch(Exception e) {
                log.error("Error creating bookmark", e);
                error = e.toString();
                if(e.getCause() != null) {
                    error += "; cause: " + e.getCause().toString();
                }
            }
        }

        if(error != null) {
            json.put("error", error);
        }

        return new StreamingResolution("application/json", new StringReader(json.toString()));
    }

    public Resolution load() throws JSONException {
        JSONObject json = new JSONObject();

        if(bookmark == null || bookmark.getCode() == null) {
            json.put("success", Boolean.FALSE);
            json.put("error", "Can't find bookmark");
        } else {
            json.put("success", Boolean.TRUE);
            json.put("params", bookmark.getParams());
        }

        return new StreamingResolution("application/json", new StringReader(json.toString()));
    }
}
