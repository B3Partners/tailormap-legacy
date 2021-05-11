package nl.gbi.converter;

public enum FormulierFieldType {
    SELECT("select"),
    TEXT("textfield");

    private String type;

    FormulierFieldType(String type) {
        this.type = type;
    }

    public String toString() {
        return type;
    }

}
