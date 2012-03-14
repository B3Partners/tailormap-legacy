/*
 * Copyright (C) 2012 B3Partners B.V.
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
package nl.b3p.viewer.image;

/**
 *
 * @author Roy Braam
 */
public class Bbox {
    //start stepping through the array from the beginning

    private Double minx;
    private Double maxx;
    private Double miny;
    private Double maxy;

    public Bbox(double[] b) {
        setBbox(b);
    }

    public Bbox(Bbox b){
        setBbox(b.toDoubleArray());
    }

    public Bbox(String bbox) throws Exception {
        String[] b = bbox.split(",");
        if (b.length==4){
            minx = Double.parseDouble(b[0]);
            miny = Double.parseDouble(b[1]);
            maxx = Double.parseDouble(b[2]);
            maxy = Double.parseDouble(b[3]);
        }else{
            throw new Exception("Constructor needs 4 coords.");
        }
    }

    public void setBbox(double[] b){
        if (b == null || b.length != 4) {
            return;
        }
        minx = b[0];
        miny = b[1];
        maxx = b[2];
        maxy = b[3];
    }

    public double getMinx() {
        return minx;
    }

    public void setMinx(double minx) {
        this.minx = minx;
    }

    public double getMaxx() {
        return maxx;
    }

    public void setMaxx(double maxx) {
        this.maxx = maxx;
    }

    public double getMiny() {
        return miny;
    }

    public void setMiny(double miny) {
        this.miny = miny;
    }

    public double getMaxy() {
        return maxy;
    }

    public void setMaxy(double maxy) {
        this.maxy = maxy;
    }

    double[] toDoubleArray() {
        if (minx==null||miny==null||maxx==null||maxy==null){
            return null;
        }
        double[] r = new double[4];
        r[0] = minx;
        r[1] = miny;
        r[2] = maxx;
        r[3] = maxy;
        return r;
    }
    @Override
    public String toString(){
        String returnValue="";
        returnValue+=getMinx();
        returnValue+=",";
        returnValue+=getMiny();
        returnValue+=",";
        returnValue+=getMaxx();
        returnValue+=",";
        returnValue+=getMaxy();
        return returnValue;
    }
}
