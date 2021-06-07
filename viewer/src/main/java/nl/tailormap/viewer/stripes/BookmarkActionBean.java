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
package nl.tailormap.viewer.stripes;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.json.JsonReadFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.JsonNodeType;
import com.fasterxml.jackson.databind.node.ObjectNode;
import net.sourceforge.stripes.action.ActionBean;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.After;
import net.sourceforge.stripes.action.Resolution;
import net.sourceforge.stripes.action.StreamingResolution;
import net.sourceforge.stripes.action.StrictBinding;
import net.sourceforge.stripes.action.UrlBinding;
import net.sourceforge.stripes.controller.LifecycleStage;
import net.sourceforge.stripes.validation.Validate;
import net.sourceforge.stripes.validation.ValidateNestedProperties;
import nl.tailormap.viewer.config.app.Application;
import nl.tailormap.viewer.config.app.Bookmark;
import nl.tailormap.viewer.helpers.app.ApplicationHelper;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONException;
import org.json.JSONObject;
import org.owasp.encoder.Encode;
import org.stripesstuff.stripersist.Stripersist;

import javax.persistence.EntityManager;
import java.io.StringReader;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 *
 * @author Matthijs Laan
 */
@UrlBinding("/action/bookmark")
@StrictBinding
public class BookmarkActionBean extends LocalizableApplicationActionBean implements ActionBean {
    private static final Log log = LogFactory.getLog(BookmarkActionBean.class);
    
    private ActionBeanContext context;

    @Validate
    private Application application;
    
    @Validate
    @ValidateNestedProperties({
           @Validate(field="params", required = true, on = "create"),
           @Validate(field="code", required = true, on = "load")
    })
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

    public Application getApplication() {
        return application;
    }

    public void setApplication(Application application) {
        this.application = application;
    }
    //</editor-fold>

    public Resolution create() throws JSONException {
        JSONObject json = new JSONObject();

        json.put("success", Boolean.FALSE);
        String error = null;
        EntityManager em = Stripersist.getEntityManager();
        Resolution r = ApplicationActionBean.checkRestriction(context, application, em);
        if( r != null){
            error = getBundle().getString("viewer.bookmarkactionbean.1");
        }else if(bookmark == null || bookmark.getParams() == null) {
            error = getBundle().getString("viewer.bookmarkactionbean.2");
        } else {
            try {
                String createdBy = ApplicationHelper.createCreatedBy(context);
                UUID uuid =UUID.randomUUID();
                String code = uuid.toString();
                code = code.replaceAll("-", "");
                bookmark.setCreatedBy(createdBy);
                bookmark.setCreatedAt(new Date());
                bookmark.setApplication(application);
                bookmark.setCode(code);
                String cleanedParams = processParams(bookmark.getParams());
                if(cleanedParams == null){
                    error = "Cannot clean bookmark input, aborting.";
                }else {
                    bookmark.setParams(cleanedParams);
                    em.persist(bookmark);
                    em.getTransaction().commit();

                    log.debug("Bookmark created with code " + bookmark.getCode() + " and params " + bookmark.getParams());

                    json.put("bookmark", bookmark.getCode());
                    json.put("success", Boolean.TRUE);
                }
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

    private String processParams(String params){
        ObjectMapper mapper = JsonMapper.builder()
                .enable(JsonReadFeature.ALLOW_BACKSLASH_ESCAPING_ANY_CHARACTER)
                .build();
        try {
            JsonNode actualObj = mapper.readTree(params);
            JsonNode cleaned = clean(actualObj);
            return cleaned.isEmpty() ? null : cleaned.toString();
        } catch (JsonProcessingException e) {
            log.error("Cannot clean parameters: ", e);
            return null;
        }
    }

    private JsonNode clean(  JsonNode node) {
        if(node.isValueNode()) { // Base case - we have a Number, Boolean or String
            if(JsonNodeType.STRING == node.getNodeType()) {
                // Escape all String values
                return JsonNodeFactory.instance.textNode(Encode.forHtml(node.asText()));
            } else {
                return node;
            }
        } else if(node.isObject()) { // Recursive case - iterate over JSON object entries
            ObjectNode clean = JsonNodeFactory.instance.objectNode();
            for (Iterator<Map.Entry<String, JsonNode>> it = node.fields(); it.hasNext(); ) {
                Map.Entry<String, JsonNode> entry = it.next();
                // Encode the key right away and encode the value recursively
                clean.set(Encode.forHtml(entry.getKey()), clean(entry.getValue()));
            }
            return clean;
        }else { //node.isArray()
            ArrayNode clean = JsonNodeFactory.instance.arrayNode();
            for (JsonNode jsonNode : node) {
                clean.add(clean(jsonNode));
            }
            return clean;
        }
    }

    @After(on = "load",  stages = LifecycleStage.BindingAndValidation)
    private void loadEntities(){
        EntityManager em = Stripersist.getEntityManager();
        List<Bookmark> bms = em.createQuery("FROM Bookmark WHERE application = :app and code = :code", Bookmark.class).setParameter("app", application).setParameter("code", bookmark.getCode()).getResultList();

        if(bms.isEmpty()){
            // For older bookmarks.
            bms = em.createQuery("FROM Bookmark WHERE code = :code", Bookmark.class).setParameter("code", bookmark.getCode()).getResultList();
        }
        if (!bms.isEmpty()) {
            bookmark = bms.get(0);
        }
    }
    
    public Resolution load() throws JSONException {
        EntityManager em = Stripersist.getEntityManager();
        JSONObject json = new JSONObject();
        Resolution r = ApplicationActionBean.checkRestriction(context, application, em);
        if (r != null) {
            return r;
        }
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
