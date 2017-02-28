/*
 * Copyright (C) 2012 B3Partners B.V.
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
package nl.b3p.viewer.image;

import java.net.URL;
import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author Roy Braam
 */
public class CombineStaticImageUrl extends CombineImageUrl{
    
    private Bbox bbox;
    private Integer x;
    private Integer y;
    private Integer width;
    private Integer height;

    public CombineStaticImageUrl(){}
    public CombineStaticImageUrl(URL url, Float alpha){
        super(url, alpha);
    }
    private CombineStaticImageUrl(CombineStaticImageUrl csiu) {        
        super(csiu);
        this.bbox= new Bbox(csiu.bbox);
        this.x=csiu.getX();
        this.y=csiu.getY();
        this.width=csiu.getWidth();
        this.height=csiu.getHeight();
    }
    
    @Override
    public List<CombineImageUrl> calculateNewUrl(ImageBbox imbbox) {
        CombineStaticImageUrl csiu = new CombineStaticImageUrl(this);
        double unitsX =imbbox.getUnitsPixelX();
        double unitsY =imbbox.getUnitsPixelY();
        
        csiu.width= (int)Math.round(csiu.getBbox().getWidth()/unitsX);       
        csiu.height= (int)Math.round(csiu.getBbox().getHeight()/unitsY);       
        
        csiu.x= (int)Math.round((csiu.getBbox().getMinx()-imbbox.getBbox().getMinx())/unitsX);
        csiu.y= (int)Math.round((imbbox.getBbox().getMaxy()-csiu.getBbox().getMaxy())/unitsY);
        
        List<CombineImageUrl> list= new ArrayList<CombineImageUrl>();
        list.add(csiu);
        return list;
    }
    
    //<editor-fold defaultstate="collapsed" desc="Getters/setters">
    public Bbox getBbox() {
        return bbox;
    }
    
    public void setBbox(Bbox bbox) {
        this.bbox = bbox;
    }  

    public Integer getX() {
        return x;
    }

    public void setX(Integer x) {
        this.x = x;
    }

    public Integer getY() {
        return y;
    }

    public void setY(Integer y) {
        this.y = y;
    }

    public Integer getWidth() {
        return width;
    }

    public void setWidth(Integer width) {
        this.width = width;
    }

    public Integer getHeight() {
        return height;
    }

    public void setHeight(Integer height) {
        this.height = height;
    }
    
    //</editor-fold>
    
    
}
