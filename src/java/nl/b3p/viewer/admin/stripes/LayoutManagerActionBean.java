/*
 * Copyright (C) 2011 B3Partners B.V.
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
package nl.b3p.viewer.admin.stripes;

import java.util.ArrayList;
import java.util.List;
import net.sourceforge.stripes.action.*;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Matthijs Laan
 */
@UrlBinding("/action/layoutmanager/{$event}")
@StrictBinding
public class LayoutManagerActionBean implements ActionBean {

    private ActionBeanContext context;
    private JSONArray components;

    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public ActionBeanContext getContext() {
        return context;
    }

    public JSONArray getComponents() {
        return components;
    }

    public void setComponents(JSONArray components) {
        this.components = components;
    }

    @DefaultHandler
    public Resolution view() throws JSONException {
        Stripersist.getEntityManager().getTransaction().commit();

        components = getComponentList();

        return new ForwardResolution("/WEB-INF/jsp/layoutmanager.jsp");
    }

    private JSONArray getComponentList() throws JSONException {
        JSONArray components = new JSONArray();

        JSONObject flamingo = new JSONObject();
        flamingo.put("id", "flamingo");
        flamingo.put("name", "Flamingo Map");
        flamingo.put("shortName", "Fm");
        flamingo.put("restrictions", new JSONArray().put("content"));
        flamingo.put("addOnce", true);
        flamingo.put("linkedComponents", new JSONArray().put("openlayers"));

        JSONObject openlayers = new JSONObject();
        openlayers.put("id", "openlayers");
        openlayers.put("name", "OpenLayers Map");
        openlayers.put("shortName", "Om");
        openlayers.put("restrictions", new JSONArray().put("content"));
        openlayers.put("addOnce", true);
        openlayers.put("linkedComponents", new JSONArray().put("flamingo"));

        JSONObject tabs = new JSONObject();
        tabs.put("id", "tabs");
        tabs.put("name", "Tabs");
        tabs.put("shortName", "Tb");
        List<String> tabsRes = new ArrayList<String>();
        tabsRes.add("leftmargin_top");
        tabsRes.add("rightmargin_top");
        tabs.put("restrictions", tabsRes);
        tabs.put("addOnce", false);
        tabs.put("linkedComponents", new JSONArray());

        JSONObject zoom = new JSONObject();
        zoom.put("id", "zoom");
        zoom.put("name", "Zoom");
        zoom.put("shortName", "Zm");
        zoom.put("restrictions", new JSONArray().put("top_menu"));
        zoom.put("addOnce", true);
        zoom.put("linkedComponents", new JSONArray());

        JSONObject pan = new JSONObject();
        pan.put("id", "pan");
        pan.put("name", "Pan");
        pan.put("shortName", "Pa");
        pan.put("restrictions", new JSONArray().put("top_menu"));
        pan.put("addOnce", false);
        pan.put("linkedComponents", new JSONArray());

        JSONObject streetview = new JSONObject();
        streetview.put("id", "streetview");
        streetview.put("name", "Streetview");
        streetview.put("shortName", "Sv");
        streetview.put("restrictions", new JSONArray().put("top_menu"));
        streetview.put("addOnce", true);
        streetview.put("linkedComponents", new JSONArray());

        JSONObject identify = new JSONObject();
        identify.put("id", "identify");
        identify.put("name", "Identify");
        identify.put("shortName", "Id");
        identify.put("restrictions", new JSONArray().put("top_menu"));
        identify.put("addOnce", true);
        identify.put("linkedComponents", new JSONArray());

        components.put(flamingo);
        components.put(openlayers);
        components.put(tabs);
        components.put(zoom);
        components.put(streetview);
        components.put(identify);
        components.put(pan);

        return components;
    }
    
}
