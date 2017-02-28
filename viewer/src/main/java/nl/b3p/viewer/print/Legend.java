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
package nl.b3p.viewer.print;

import java.util.ArrayList;
import java.util.List;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author Roy Braam
 */

@XmlRootElement(name="legend")
@XmlType(propOrder = {"name","legendParts"})
public class Legend {
    private String name;
    private List<LegendPart> legendParts = new ArrayList();

    public Legend(){}
    public Legend(JSONObject json) throws JSONException {
        if (json.has("name")){
            this.setName(json.getString("name"));
        }
        if (json.has("parts")){
            JSONArray jsonParts = json.getJSONArray("parts");
            for (int i=0; i < jsonParts.length(); i++){
                JSONObject jsonPart = jsonParts.getJSONObject(i);
                LegendPart legendPart = new LegendPart(jsonPart);
                this.legendParts.add(legendPart);
            }
        }
    }

    @XmlElement(name="name")
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
    @XmlElementWrapper(name="legendParts")
    @XmlElement(name="legendPart")
    public List<LegendPart> getLegendParts() {
        return legendParts;
    }

    public void setLegendParts(List<LegendPart> legendParts) {
        this.legendParts = legendParts;
    }    
}
