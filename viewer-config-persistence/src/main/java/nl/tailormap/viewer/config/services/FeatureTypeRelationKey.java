/*
 * Copyright (C) 2013 B3Partners B.V.
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

import org.json.JSONObject;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

/**
 *
 * @author Roy Braam
 */
@Entity
public class FeatureTypeRelationKey {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "relation")
    private FeatureTypeRelation relation;
        
    @ManyToOne
    @JoinColumn(name = "left_side")
    private AttributeDescriptor leftSide;
    
    @ManyToOne
    @JoinColumn(name = "right_side")
    private AttributeDescriptor rightSide;

    public FeatureTypeRelationKey(){}
    
    public FeatureTypeRelationKey(FeatureTypeRelation relation,AttributeDescriptor leftSide,AttributeDescriptor rightSide){
        this.relation=relation;
        this.leftSide = leftSide;
        this.rightSide = rightSide;
    }

    public JSONObject toJSONObject(){
        JSONObject json = new JSONObject();
        if(leftSide != null) {
            json.put("leftSideName", leftSide.getName());
            json.put("leftSideType", leftSide.getType());
        }
        if(rightSide != null) {
            json.put("rightSideName", rightSide.getName());
            json.put("rightSideType", rightSide.getType());
        }
        return json;
    }

    //<editor-fold defaultstate="collapsed" desc="Getters/Setters">
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public FeatureTypeRelation getRelation() {
        return relation;
    }
    
    public void setRelation(FeatureTypeRelation relation) {
        this.relation = relation;
    }
    
    public AttributeDescriptor getLeftSide() {
        return leftSide;
    }
    
    public void setLeftSide(AttributeDescriptor leftSide) {
        this.leftSide = leftSide;
    }
    
    public AttributeDescriptor getRightSide() {
        return rightSide;
    }
    
    public void setRightSide(AttributeDescriptor rightSide) {
        this.rightSide = rightSide;
    }
    //</editor-fold>
}
