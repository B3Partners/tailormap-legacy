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

import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.services.Layer;
import org.json.JSONException;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Jytte Schaeffer
 */
public class LayerActionBean implements ActionBean{
    private static final String JSP = "/WEB-INF/jsp/layer.jsp";
    
    private ActionBeanContext context;
    
    @Validate
    private Layer layer;
    
    @Validate
    private String parentId;
    
    @Validate
    private String titleAlias;
    @Validate
    private String legenda;
    @Validate
    private String metadata;
    @Validate
    private String downloadlink;

    //<editor-fold defaultstate="collapsed" desc="getters & setters">
    public ActionBeanContext getContext() {
        return context;
    }
    
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public Layer getLayer() {
        return layer;
    }

    public void setLayer(Layer layer) {
        this.layer = layer;
    }

    public String getTitleAlias() {
        return titleAlias;
    }

    public void setTitleAlias(String titleAlias) {
        this.titleAlias = titleAlias;
    }

    public String getDownloadlink() {
        return downloadlink;
    }

    public void setDownloadlink(String downloadlink) {
        this.downloadlink = downloadlink;
    }

    public String getLegenda() {
        return legenda;
    }

    public void setLegenda(String legenda) {
        this.legenda = legenda;
    }

    public String getMetadata() {
        return metadata;
    }

    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }
    
    public String getParentId() {
        return parentId;
    }
    
    public void setParentId(String parentId) {
        this.parentId = parentId;
    }
    //</editor-fold>
    
    @DefaultHandler
    public Resolution editLayer() throws JSONException {
        downloadlink = layer.getExtraInfo().get(layer.EXTRA_KEY_DOWNLOAD_URL);
        metadata = layer.getExtraInfo().get(layer.EXTRA_KEY_METADATA_URL);
        
        //Stripersist.getEntityManager().getTransaction().commit();
        
        return new ForwardResolution(JSP);
    }
    
    public Resolution saveLayer() throws JSONException {
        layer = Stripersist.getEntityManager().find(Layer.class, layer.getId());
        
        if(titleAlias != null){
            layer.setTitleAlias(titleAlias);
        }
        layer.setLegendImageUrl(legenda);
        layer.getExtraInfo().put(layer.EXTRA_KEY_DOWNLOAD_URL, downloadlink);
        layer.getExtraInfo().put(layer.EXTRA_KEY_METADATA_URL, metadata);
        
        Stripersist.getEntityManager().persist(layer);
        Stripersist.getEntityManager().getTransaction().commit();
        
        getContext().getMessages().add(new SimpleMessage("De kaartlaag is opgeslagen"));
        
        return new ForwardResolution(JSP);
    }
}
