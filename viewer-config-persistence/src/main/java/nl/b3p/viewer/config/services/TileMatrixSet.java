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
import javax.persistence.CascadeType;
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
    // </editor-fold>
}
