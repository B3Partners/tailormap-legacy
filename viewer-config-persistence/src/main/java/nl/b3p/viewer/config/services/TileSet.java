/*
 * Copyright (C) 2011-2013 B3Partners B.V.
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

import java.util.*;
import javax.persistence.*;

/**
 *
 * @author Matthijs Laan
 */
@Entity
public class TileSet {

    @Id
    private String name;

    private int width;
    private int height;

    @ElementCollection
    @OrderColumn(name="list_index")
    @Column(name="resolution")
    private List<Double> resolutions = new ArrayList<Double>();

    public int getHeight() {
        return height;
    }

    public void setHeight(int height) {
        this.height = height;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<Double> getResolutions() {
        return resolutions;
    }

    public void setResolutions(List<Double> resolutions) {
        this.resolutions = resolutions;
    }
    
    public void setResolutions(String res){
        this.resolutions = new ArrayList<Double>();
        String[] resTokens = res.split(",");
        for (int i = 0; i < resTokens.length; i++){
            this.resolutions.add(Double.parseDouble(resTokens[i].trim()));
        }
    }

    public int getWidth() {
        return width;
    }

    public void setWidth(int width) {
        this.width = width;
    }
}
