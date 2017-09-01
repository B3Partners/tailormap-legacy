/*
 * Copyright (C) 2012-2016 B3Partners B.V.
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
package nl.b3p.viewer.admin.stripes;

import java.io.StringReader;
import java.util.*;
import javax.annotation.security.RolesAllowed;
import javax.persistence.EntityManager;
import javax.servlet.http.HttpServletResponse;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.*;
import nl.b3p.viewer.config.app.*;
import nl.b3p.viewer.config.security.Group;
import nl.b3p.viewer.util.SelectedContentCache;
import nl.b3p.web.stripes.ErrorMessageResolution;
import org.json.*;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Jytte Schaeffer
 * @author Meine Toonen
 */
@UrlBinding("/action/applicationstartmap/{$event}")
@StrictBinding
@RolesAllowed({Group.ADMIN,Group.APPLICATION_ADMIN}) 
public class ApplicationStartMapActionBean extends ApplicationActionBean {

    private static final String JSP = "/WEB-INF/jsp/application/applicationStartMap.jsp";
    
    @Validate
    private String selectedContent;
    private JSONArray jsonContent;
    
    @Validate
    private String contentToBeSelected;
    
    @Validate
    private String checkedLayersString;
    private JSONArray jsonCheckedLayers;
    //private List<Long> checkedLayers = new ArrayList();
    
    private JSONArray allCheckedLayers = new JSONArray();
    
    @Validate
    private String nodeId;
    @Validate
    private String levelId;
    private Level rootlevel;
    
    @Validate
    private String removedRecordsString = new String();
    
    private Set<Long> levelsToBeRemoved = new HashSet<Long>();
    private Set<Long> layersToBeRemoved = new HashSet<Long>();

    @DefaultHandler
    @DontValidate
    public Resolution view() throws JSONException {
        if (application == null) {
            getContext().getMessages().add(new SimpleError("Er moet eerst een bestaande applicatie geactiveerd of een nieuwe applicatie gemaakt worden."));
            return new ForwardResolution("/WEB-INF/jsp/application/chooseApplication.jsp");
        } else {
            rootlevel = application.getRoot();
            getCheckedLayerList(allCheckedLayers, rootlevel, application);
        }

        return new ForwardResolution(JSP);
    }
    
    public Resolution save() throws JSONException {
        
        EntityManager em = Stripersist.getEntityManager();
        saveStartMap(em);
        getContext().getMessages().add(new SimpleMessage("Het startkaartbeeld is opgeslagen"));
        
        getCheckedLayerList(allCheckedLayers, rootlevel, application);
        
        return new ForwardResolution(JSP);
    }
    
    protected void saveStartMap(EntityManager em){
        rootlevel = application.getRoot();
        
        jsonContent = new JSONArray(selectedContent);
        jsonCheckedLayers = new JSONArray(checkedLayersString);
        
        JSONArray objToRemove = new JSONArray();
        if(removedRecordsString != null){
            objToRemove = new JSONArray(removedRecordsString);
        }
        for (Object obj : objToRemove) {
            JSONObject o = (JSONObject)obj;
            String type = o.getString("type");
            if(type.equals("layer")){
                layersToBeRemoved.add(o.getLong("id"));
            }else if( type.equals("level")){
                levelsToBeRemoved.add(o.getLong("id"));
            }
        }
        
        walkAppTreeForSave(rootlevel,em,false);
        SelectedContentCache.setApplicationCacheDirty(application, true,false,true,em);
        em.getTransaction().commit();
    }
    
    public Resolution canContentBeSelected() {
        try {
            jsonContent = new JSONArray(selectedContent);
            
            if(jsonContent.length() == 0) {
                JSONObject obj = new JSONObject();
                obj.put("result", true);
                return new StreamingResolution("application/json", new StringReader(obj.toString()));
            }
            
            JSONObject o = new JSONObject(contentToBeSelected);        

            Boolean result = true;
            String message = null;

            String id = o.getString("id");
            if(o.get("type").equals("layer")) {
                
                message = "Kaartlagen kunnen niet los worden geselecteerd, alleen als onderdeel van een kaart of kaartlaaggroep";
                result = false;
                /*
                ApplicationLayer appLayer = Stripersist.getEntityManager().find(ApplicationLayer.class, new Long(id));
                if(appLayer == null) {
                    message = "Kaartlaag met id " + id + " is onbekend!";
                    result = false;
                } else {
                    /* An appLayer can not be selected if:
                     * - selectedContent contains the appLayer
                     * - the appLayer is a layer of any level or its children in selectedContent 
                     * /

                    for(int i = 0; i < jsonContent.length(); i++) {
                        JSONObject content = jsonContent.getJSONObject(i);

                        if(content.getString("type").equals("layer")) {
                            if(id.equals(content.getString("id"))) {
                                result = false;
                                message = "Kaartlaag is al geselecteerd";
                                break;
                            }
                        } else {
                            Level l = Stripersist.getEntityManager().find(Level.class, new Long(content.getString("id")));
                            if(l != null) {
                                if(l.containsLayerInSubtree(appLayer)) {
                                    result = false;
                                    message = "Kaartlaag is al geselecteerd als onderdeel van een niveau";
                                    break;
                                }
                            }
                        }
                    }
                }*/
            } else {
                Level level = Stripersist.getEntityManager().find(Level.class, new Long(id));
                if(level == null) {
                    result = false;
                    message = "Niveau met id " + id + " is onbekend!";
                } else {
                    if(!level.hasLayerInSubtree()) {
                        message = "Niveau is geen kaart";
                        result = false;
                        
                    } else {
                        /* A level can not be selected if:
                        * any level in selectedContent is the level is a sublevel of the level
                        * any level in selectedContent is a parent (recursive) of the level
                        */
                        for(int i = 0; i < jsonContent.length(); i++) {
                            JSONObject content = jsonContent.getJSONObject(i);

                            if(content.getString("type").equals("level")) {
                                if(id.equals(content.getString("id"))) {
                                    result = false;
                                    message = "Niveau is al geselecteerd";
                                    break;
                                }

                                Level l = Stripersist.getEntityManager().find(Level.class, new Long(content.getString("id")));
                                if(l != null) {
                                    if(l.isInSubtreeOf(level)) {
                                        result = false;
                                        message = "Niveau kan niet worden geselecteerd omdat een subniveau al geselecteerd is";
                                        break;
                                    }
                                }
                            } else {
                                ApplicationLayer appLayer = Stripersist.getEntityManager().find(ApplicationLayer.class, new Long(content.getString("id")));
                                if(level.containsLayerInSubtree(appLayer)) {
                                    result = false;
                                    message = "Niveau kan niet worden geselecteerd omdat een kaartlaag uit dit (of onderliggend) niveau al is geselecteerd";
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            JSONObject obj = new JSONObject();
            obj.put("result", result);
            obj.put("message", message);
            return new StreamingResolution("application/json", new StringReader(obj.toString()));

        } catch(Exception e) {
            return new ErrorMessageResolution("Exception " + e.getClass() + ": " + e.getMessage());
        }
    }
    
    protected void walkAppTreeForSave(Level l, EntityManager em, boolean unremove) throws JSONException{
        
        if(shouldBeRemoved(l)){
            removeStartLevel(l, em);
        }else{
            boolean wasNew = false;
            StartLevel sl = l.getStartLevels().get(application);
            if(sl == null){
                wasNew = true;
                sl = new StartLevel();
                sl.setApplication(application);
                sl.setLevel(l);
                l.getStartLevels().put(application, sl);
            }
            
            sl.setSelectedIndex(getSelectedContentIndex(l));
            boolean unremoveChilds = (sl.isRemoved() && sl.getSelectedIndex() != null) || unremove;
            if(unremoveChilds){
                sl.setRemoved(false);
            }
            for(ApplicationLayer al: l.getLayers()) {
                StartLayer startLayer = al.getStartLayers().get(application);
                if(shouldBeRemoved(al)){
                    if (startLayer == null) {
                        startLayer = new StartLayer();
                        startLayer.setApplication(application);
                        startLayer.setApplicationLayer(al);
                        startLayer.setRemoved(true);
                        al.getStartLayers().put(application, startLayer);
                    }else{
                        startLayer.setRemoved(true);
                    }
                }else{
                    if(!wasNew && !unremoveChilds){
                        // if the startLevel was new, there is no startLayer. So if it wasn't new, and there isn't a startLayer, it means the startLayer was removed
                        // in a previous session, so don't create a new one.
                        continue;
                    }
                    if(startLayer == null){
                        startLayer = new StartLayer();
                        startLayer.setApplication(application);
                        startLayer.setApplicationLayer(al);
                        al.getStartLayers().put(application, startLayer);
                    }

                    startLayer.setSelectedIndex(getSelectedContentIndex(al));
                    startLayer.setChecked(getCheckedForLayerId(al.getId()));
                    if(unremoveChilds){
                        startLayer.setRemoved(false);
                    }
                }
                
            }

            for(Level child: l.getChildren()) {
                walkAppTreeForSave(child,em, unremoveChilds);
            }
        }
    }
    
    private boolean shouldBeRemoved(Object l){
        if(l instanceof Level){
            Level level = (Level)l;
            return levelsToBeRemoved.contains(level.getId());
        }
        
        if(l instanceof ApplicationLayer){
            ApplicationLayer al = (ApplicationLayer)l;
            return layersToBeRemoved.contains(al.getId());
        }
        return false;
    }
    
    private boolean getCheckedForLayerId(Long levelid) throws JSONException {
        for(int i = 0; i < jsonCheckedLayers.length(); i++){
            if(levelid.equals(new Long(jsonCheckedLayers.getInt(i)))) {
                return true;
            }
        }
        return false;
    }
    
    private Integer getSelectedContentIndex(Level l) throws JSONException{
        Integer index = null;
        
        for(int i = 0; i < jsonContent.length(); i++){
            JSONObject js = jsonContent.getJSONObject(i);
            String id = js.get("id").toString();
            String type = js.get("type").toString();
            if(id.equals(l.getId().toString()) && type.equals("level")){
                index = i;
            }
        }
        
        return index;
    }
    
    private Integer getSelectedContentIndex(ApplicationLayer al) throws JSONException{
        Integer index = null;
        
        for(int i = 0; i < jsonContent.length(); i++){
            JSONObject js = jsonContent.getJSONObject(i);
            String id = js.get("id").toString();
            String type = js.get("type").toString();
            if(id.equals(al.getId().toString()) && type.equals("layer")){
                index = i;
            }
        }
        
        return index;
    }

    public Resolution loadApplicationTree() throws JSONException {

        EntityManager em = Stripersist.getEntityManager();

        final JSONArray children = new JSONArray();

        if (!nodeId.equals("n")) {

            String type = nodeId.substring(0, 1);
            int id = Integer.parseInt(nodeId.substring(1));
            if (type.equals("n")) {
                Level l = em.find(Level.class, new Long(id));
                List<Level> levels = l.getChildren();
                Collections.sort(levels);
                for (Level sub : levels) {
                    JSONObject j = new JSONObject();
                    j.put("id", "n" + sub.getId());
                    j.put("name", sub.getName());
                    j.put("type", "level");
                    j.put("isLeaf", sub.getChildren().isEmpty() && sub.getLayers().isEmpty());
                    if (sub.getParent() != null) {
                        j.put("parentid", sub.getParent().getId());
                    }
                    children.put(j);
                }

                for (ApplicationLayer layer : l.getLayers()) {
                    JSONObject j = new JSONObject();
                    j.put("id", "s" + layer.getId());
                    j.put("name", layer.getDisplayName(em));
                    j.put("type", "layer");
                    j.put("isLeaf", true);
                    j.put("parentid", nodeId);
                    children.put(j);
                }
            }
        }

        return new StreamingResolution("application/json") {

            @Override
            public void stream(HttpServletResponse response) throws Exception {
                response.getWriter().print(children.toString());
            }
        };
    }

    public Resolution loadSelectedLayers() throws JSONException {
        EntityManager em = Stripersist.getEntityManager();

        final JSONArray children = loadSelectedLayers(em);
        
        return new StreamingResolution("application/json") {

            @Override
            public void stream(HttpServletResponse response) throws Exception {
                response.getWriter().print(children.toString());
            }
        };
    }
    
    protected JSONArray loadSelectedLayers(EntityManager em){
        
        final JSONArray children = new JSONArray();
        rootlevel = application.getRoot();

        if(levelId != null && levelId.substring(1).equals(rootlevel.getId().toString())){
            List selectedObjects = new ArrayList();
            walkAppTreeForStartMap(selectedObjects, rootlevel, application);

            Collections.sort(selectedObjects, new Comparator() {

                @Override
                public int compare(Object lhs, Object rhs) {
                    Integer lhsIndex, rhsIndex;
                    if(lhs instanceof StartLevel) {
                        lhsIndex = ((StartLevel)lhs).getSelectedIndex();
                    } else {
                        lhsIndex = ((StartLayer)lhs).getSelectedIndex();
                    }
                    if(rhs instanceof StartLevel) {
                        rhsIndex = ((StartLevel)rhs).getSelectedIndex();
                    } else {
                        rhsIndex = ((StartLayer)rhs).getSelectedIndex();
                    }
                    return lhsIndex.compareTo(rhsIndex);
                }
            });

            if(selectedObjects != null){
                for (Iterator it = selectedObjects.iterator(); it.hasNext();) {
                    Object map = it.next();
                    if(map instanceof StartLayer){
                        StartLayer startLayer = (StartLayer) map;
                        ApplicationLayer layer = startLayer.getApplicationLayer();
                        JSONObject j = new JSONObject();
                        j.put("id", "s" + layer.getId());
                        j.put("name", layer.getDisplayName(em));
                        j.put("type", "layer");
                        j.put("isLeaf", true);
                        j.put("parentid", "");
                        j.put("checked", startLayer.isChecked());
                        children.put(j);
                    }else if(map instanceof StartLevel){
                        StartLevel startLevel = (StartLevel) map;
                        Level level = startLevel.getLevel();
                        JSONArray checked = new JSONArray();
                        getCheckedLayerList(checked, level,application);

                        JSONObject j = new JSONObject();
                        j.put("id", "n" + level.getId());
                        j.put("name", startLevel.getLevel().getName());
                        j.put("type", "level");
                        j.put("isLeaf", level.getChildren().isEmpty() && level.getLayers().isEmpty());
                        j.put("parentid", "");
                        j.put("checkedlayers", checked);
                        children.put(j);
                    }
                }
            }
        }else{
            String type = levelId.substring(0, 1);
            int id = Integer.parseInt(levelId.substring(1));
            if (type.equals("n")) {
                Level l = em.find(Level.class, new Long(id));
                for (Level sub : l.getChildren()) {
                    StartLevel sl = sub.getStartLevels().get(application);
                    if(sl != null || !l.getStartLevels().containsKey(application)){
                        if(sl != null && sl.isRemoved()){
                            continue;
                        }
                        JSONObject j = new JSONObject();
                        j.put("id", "n" + sub.getId());
                        j.put("name", sub.getName());
                        j.put("type", "level");
                        j.put("isLeaf", sub.getChildren().isEmpty() && sub.getLayers().isEmpty());
                        if (sub.getParent() != null) {
                            j.put("parentid", sub.getParent().getId());
                        }
                        children.put(j);
                    }
                }

                for (ApplicationLayer layer : l.getLayers()) {
                    StartLayer startLayer = layer.getStartLayers().get(application);
                    if(startLayer != null){ 
                        
                        if(startLayer != null && startLayer.isRemoved()){
                            continue;
                        }
                        
                        //if the startLevel doesn't exist, it's a new startLayer (so show it)
                        // if the startLayer doesn't exist, but the startLevel does, it's a removed startLayer, so don't show it.  
                        JSONObject j = new JSONObject();
                        j.put("id", "s" + layer.getId());
                        j.put("name", layer.getDisplayName(em));
                        j.put("type", "layer");
                        j.put("isLeaf", true);
                        j.put("parentid", levelId);
                        j.put("checked", startLayer != null ? startLayer.isChecked() : false);
                        children.put(j);
                    }
                }
            }
        }
        return children;
    }
    
    protected static void walkAppTreeForStartMap(List selectedContent, Level l, Application app){
        StartLevel sl = l.getStartLevels().get(app);
        boolean selected = false;
        if(sl != null && sl.getSelectedIndex() != null && !sl.isRemoved()) {
            selected = true;
            selectedContent.add(sl);
        }
        
        for(ApplicationLayer al: l.getLayers()) {
            StartLayer startLayer = al.getStartLayers().get(app);
            if(startLayer != null && startLayer.getSelectedIndex() != null && !startLayer.isRemoved()) {
                selectedContent.add(al);
            }
        }
        
        if (!selected) {
            for (Level child : l.getChildren()) {
                walkAppTreeForStartMap(selectedContent, child, app);
            }
        }
    }
    
    private static void getCheckedLayerList(JSONArray layers, Level l, Application app) throws JSONException{
        for(ApplicationLayer al: l.getLayers()) {
            StartLayer startLayer = al.getStartLayers().get(app);
            if(startLayer != null && startLayer.isChecked()) {
                layers.put(al.getId());
            }
        }
        for(Level child: l.getChildren()) {
            getCheckedLayerList(layers, child, app);
        }
    }
    
    protected void removeStartLevel(Level l, EntityManager em){
        StartLevel sl = l.getStartLevels().get(application);
        if (sl != null) {
            List<ApplicationLayer> als = l.getLayers();
            for (ApplicationLayer al : als) {
                StartLayer startLayer = al.getStartLayers().get(application);
                if(startLayer != null){
                    startLayer.setRemoved(true);
                }
            }
            sl.setRemoved(true);

            List<Level> children = l.getChildren();
            for (Level child : children) {
                removeStartLevel(child, em);
            }
        }
    }

    //<editor-fold defaultstate="collapsed" desc="getters & setters">

    public String getCheckedLayersString() {
        return checkedLayersString;
    }

    public void setCheckedLayersString(String checkedLayersString) {
        this.checkedLayersString = checkedLayersString;
    }

    public String getSelectedContent() {
        return selectedContent;
    }

    public void setSelectedContent(String selectedContent) {
        this.selectedContent = selectedContent;
    }

    public Level getRootlevel() {
        return rootlevel;
    }

    public void setRootlevel(Level rootlevel) {
        this.rootlevel = rootlevel;
    }

    public String getLevelId() {
        return levelId;
    }

    public void setLevelId(String levelId) {
        this.levelId = levelId;
    }

    public JSONArray getAllCheckedLayers() {
        return allCheckedLayers;
    }

    public void setAllCheckedLayers(JSONArray allCheckedLayers) {
        this.allCheckedLayers = allCheckedLayers;
    }

    public String getNodeId() {
        return nodeId;
    }

    public void setNodeId(String nodeId) {
        this.nodeId = nodeId;
    }

    public String getContentToBeSelected() {
        return contentToBeSelected;
    }

    public void setContentToBeSelected(String contentToBeSelected) {
        this.contentToBeSelected = contentToBeSelected;
    }
    
    public String getRemovedRecordsString() {
        return removedRecordsString;
    }

    public void setRemovedRecordsString(String removedRecordsString) {
        this.removedRecordsString = removedRecordsString;
    }
    //</editor-fold>

}
