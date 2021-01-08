package nl.b3p.viewer.util;

import nl.b3p.viewer.userlayer.TMFilterToSQL;
import org.opengis.filter.*;

public class Subselect implements Filter {

    private String relatedColumn;
    private String mainColumn;
    private String relatedTable;
    private Filter relatedFilter;

    public Subselect(Filter relatedFilter, String relatedColumn, String mainColumn, String relatedTable) {
        this.relatedFilter = relatedFilter;
        this.relatedColumn = relatedColumn;
        this.mainColumn = mainColumn;
        this.relatedTable = relatedTable;
    }

    @Override
    public boolean evaluate(Object o) {
        return false;
    }

    @Override
    public Object accept(FilterVisitor visitor, Object extraData) {

        return ((TMFilterToSQL)visitor).visit(this, extraData);
    }

    public Filter getRelatedFilter() {
        return relatedFilter;
    }

    public void setRelatedFilter(Filter relatedFilter) {
        this.relatedFilter = relatedFilter;
    }

    public String getRelatedColumn() {
        return relatedColumn;
    }

    public void setRelatedColumn(String relatedColumn) {
        this.relatedColumn = relatedColumn;
    }

    public String getMainColumn() {
        return mainColumn;
    }

    public void setMainColumn(String mainColumn) {
        this.mainColumn = mainColumn;
    }

    public String getRelatedTable() {
        return relatedTable;
    }

    public void setRelatedTable(String relatedTable) {
        this.relatedTable = relatedTable;
    }
}
