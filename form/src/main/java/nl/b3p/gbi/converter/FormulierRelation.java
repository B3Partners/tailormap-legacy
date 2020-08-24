package nl.b3p.gbi.converter;

import java.util.List;

public class FormulierRelation {

    private String relatedFeatureType;
    private List<FormulierRelationKeys> relation;

    public String getRelatedFeatureType() {
        return relatedFeatureType;
    }

    public void setRelatedFeatureType(String relatedFeatureType) {
        this.relatedFeatureType = relatedFeatureType;
    }

    public List<FormulierRelationKeys> getRelation() {
        return relation;
    }

    public void setRelation(List<FormulierRelationKeys> relation) {
        this.relation = relation;
    }
}
