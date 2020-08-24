package nl.b3p.gbi.converter;

import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.Version;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.io.File;
import java.io.IOException;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.List;

public class Formulier {

    private int tabs;
    private String name;
    private String featureType;
    private String treeNodeColumn;
    private boolean newPossible;
    private FormulierTabConfig tabConfig;
    private List<FormulierRelation> relation;
    private List<FormulierField> fields;

    private ObjectMapper mapper = new ObjectMapper();
    public Formulier(){

        mapper.enable(SerializationFeature.INDENT_OUTPUT);

        SimpleModule module =
                new SimpleModule("TabConfigSerializer", new Version(2, 1, 3, null, null, null));
        module.addSerializer(FormulierTabConfig.class, new TabConfigSerializer());

        mapper.registerModule(module);
    }
    public JsonNode toJSON() throws IOException {
        return mapper.valueToTree(this);
    }

    public File toFile(String filename) throws IOException {
        JsonNode n = toJSON();
        File f = new File(filename);
        mapper.writeValue(f, n);
        return f;
    }

    public String toString(){
        try {
            return toJSON().toPrettyString();
        } catch (IOException e) {
            System.err.println("cannot print form: " + e.getLocalizedMessage());
            return "error: " + e.getLocalizedMessage();
        }
    }

    public int getTabs() {
        return tabs;
    }

    public void setTabs(int tabs) {
        this.tabs = tabs;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getFeatureType() {
        return featureType;
    }

    public void setFeatureType(String featureType) {
        this.featureType = featureType;
    }

    public String getTreeNodeColumn() {
        return treeNodeColumn;
    }

    public void setTreeNodeColumn(String treeNodeColumn) {
        this.treeNodeColumn = treeNodeColumn;
    }

    public boolean isNewPossible() {
        return newPossible;
    }

    public void setNewPossible(boolean newPossible) {
        this.newPossible = newPossible;
    }

    public FormulierTabConfig getTabConfig() {
        return tabConfig;
    }

    public void setTabConfig(FormulierTabConfig tabConfig) {
        this.tabConfig = tabConfig;
    }

    public List<FormulierRelation> getRelation() {
        return relation;
    }

    public void setRelation(List<FormulierRelation> relation) {
        this.relation = relation;
    }

    public List<FormulierField> getFields() {
        return fields;
    }

    public void setFields(List<FormulierField> fields) {
        this.fields = fields;
    }
}
