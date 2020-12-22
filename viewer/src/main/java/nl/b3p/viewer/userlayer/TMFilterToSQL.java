package nl.b3p.viewer.userlayer;

import nl.b3p.viewer.util.Subselect;
import org.geotools.data.jdbc.FilterToSQL;
import org.geotools.data.jdbc.FilterToSQLException;
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
            this.out.write(filter.getMainColumn() + " IN (");
            this.out.write("SELECT " + filter.getRelatedColumn() + " FROM " + filter.getRelatedTable() + " ");
            this.encode(filter.getRelatedFilter());
            this.out.write(") ");


            return extraData;
        } catch (IOException | FilterToSQLException var4) {
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
