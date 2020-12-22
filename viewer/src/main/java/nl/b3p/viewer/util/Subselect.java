package nl.b3p.viewer.util;

import nl.b3p.viewer.userlayer.TMFilterToSQL;
import org.opengis.filter.*;

public class Subselect implements Filter {
    @Override
    public boolean evaluate(Object o) {
        return false;
    }

    @Override
    public Object accept(FilterVisitor visitor, Object extraData) {

        return ((TMFilterToSQL)visitor).visit(this, extraData);
    }
}
