package nl.b3p.viewer.userlayer;

import nl.b3p.viewer.util.Subselect;
import org.geotools.data.jdbc.FilterToSQL;
import org.geotools.filter.FilterCapabilities;
import org.opengis.feature.type.AttributeDescriptor;
import org.opengis.filter.ExcludeFilter;
import org.opengis.filter.Not;
import org.opengis.filter.PropertyIsNull;
import org.opengis.filter.expression.Expression;
import org.opengis.filter.expression.PropertyName;

import java.io.IOException;

public class TMFilterToSQL extends FilterToSQL {
    @Override
    protected FilterCapabilities createFilterCapabilities() {
        FilterCapabilities caps = super.createFilterCapabilities();
        caps.addType(Subselect.class);
        return caps;
    }

    public Object visit(Subselect filter, Object extraData) {
        try {
            this.out.write("0 = 1");
            return extraData;
        } catch (IOException var4) {
            throw new RuntimeException("io problem writing filter", var4);
        }
    }

 /*   public Object visit(Subselect filter, Object extraData){
        try {
            this.out.write("pietje");
        } catch (IOException e) {
            e.printStackTrace();
        }
        return extraData;
    }*/
}
