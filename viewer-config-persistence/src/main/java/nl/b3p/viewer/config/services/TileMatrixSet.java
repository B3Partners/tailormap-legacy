/*
 * Copyright (C) 2017 B3Partners B.V.
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
package nl.b3p.viewer.config.services;

import java.util.ArrayList;
import java.util.List;
import javax.persistence.AttributeOverride;
import javax.persistence.AttributeOverrides;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 *
 * @author Meine Toonen meinetoonen@b3partners.nl
 */
@Entity
public class TileMatrixSet {
    @Id
    private Long id;

    private String identifier;
    
    private String crs;
    
    @OneToMany(cascade=CascadeType.ALL,fetch = FetchType.LAZY, mappedBy="matrixSet")
    private List<TileMatrix> matrices = new ArrayList<>();
    
    @ManyToOne(cascade=CascadeType.ALL, fetch=FetchType.LAZY)
    private TileService tileService;
    
    
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "crs.name", column = @Column(name="max_crs")),
        @AttributeOverride(name = "minx", column = @Column(name="max_minx")),
        @AttributeOverride(name = "maxx", column = @Column(name="max_maxx")),
        @AttributeOverride(name = "miny", column = @Column(name="max_miny")),
        @AttributeOverride(name = "maxy", column = @Column(name="max_maxy"))
    })
    private BoundingBox bbox;
    
    public static TileMatrixSet fromJSONObject(JSONObject obj){
        TileMatrixSet tms = new TileMatrixSet();
        BoundingBox bbox = BoundingBox.fromJSONObject(obj.getJSONObject("bbox"));
        tms.setBbox(bbox);
        tms.setCrs(obj.getString("crs"));
        tms.setIdentifier(obj.getString("identifier"));
        JSONArray tmses = obj.getJSONArray("matrices");
        for (int i = 0; i < tmses.length(); i++) {
            JSONObject tmObj = tmses.getJSONObject(i);
            TileMatrix tm = TileMatrix.fromJSONObject(tmObj);
            tm.setMatrixSet(tms);
            tms.getMatrices().add(tm);
            
        }
        return tms;
    }
    
    public JSONObject toJSONObject(){
        JSONObject obj = new JSONObject();
        obj.put("id",id);
        obj.put("identifier",identifier);
        obj.put("crs",crs);
        
        JSONArray matricesJSON = new JSONArray();
        for (TileMatrix matrix : matrices) {
            matricesJSON.put(matrix.toJSONObject());
        }
        obj.put("matrices", matricesJSON);

        
        if(bbox != null){
            obj.put("bbox",bbox.toJSONObject());
        }
        return obj;
    }

    // <editor-fold defaultstate="collapsed" desc="Getters and setters" >
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    public String getCrs() {
        return crs;
    }

    public void setCrs(String crs) {
        this.crs = crs;
    }

    public List<TileMatrix> getMatrices() {
        return matrices;
    }

    public void setMatrices(List<TileMatrix> matrices) {
        this.matrices = matrices;
    }

    public TileService getTileService() {
        return tileService;
    }

    public void setTileService(TileService tileService) {
        this.tileService = tileService;
    }
    
    public BoundingBox getBbox() {
        return bbox;
    }

    public void setBbox(BoundingBox bbox) {
        this.bbox = bbox;
    }
    // </editor-fold>
}
