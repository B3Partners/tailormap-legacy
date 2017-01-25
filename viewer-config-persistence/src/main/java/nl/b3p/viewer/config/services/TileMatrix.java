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

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;

/**
 *
 * @author Meine Toonen meinetoonen@b3partners.nl
 */
@Entity
public class TileMatrix {
    
    @Id
    private Long id;
    private String identifier;
    private String title;
    private String description;
    private String scaleDenominator;
    private String topLeftPoint;
    private int tileWitdh;
    private int tileHeight;
    private int matrixWidth;
    private int matrixHeight;
    
    @ManyToOne(cascade=CascadeType.ALL, fetch=FetchType.LAZY)
    private TileMatrixSet matrixSet;
    

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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getScaleDenominator() {
        return scaleDenominator;
    }

    public void setScaleDenominator(String scaleDenominator) {
        this.scaleDenominator = scaleDenominator;
    }

    public String getTopLeftPoint() {
        return topLeftPoint;
    }

    public void setTopLeftPoint(String topLeftPoint) {
        this.topLeftPoint = topLeftPoint;
    }

    public int getTileWitdh() {
        return tileWitdh;
    }

    public void setTileWitdh(int tileWitdh) {
        this.tileWitdh = tileWitdh;
    }

    public int getTileHeight() {
        return tileHeight;
    }

    public void setTileHeight(int tileHeight) {
        this.tileHeight = tileHeight;
    }

    public int getMatrixWidth() {
        return matrixWidth;
    }

    public void setMatrixWidth(int matrixWidth) {
        this.matrixWidth = matrixWidth;
    }

    public int getMatrixHeight() {
        return matrixHeight;
    }

    public void setMatrixHeight(int matrixHeight) {
        this.matrixHeight = matrixHeight;
    }

    public TileMatrixSet getMatrixSet() {
        return matrixSet;
    }

    public void setMatrixSet(TileMatrixSet matrixSet) {
        this.matrixSet = matrixSet;
    }
    
    
}
