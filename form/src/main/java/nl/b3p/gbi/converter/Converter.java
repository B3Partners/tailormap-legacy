package nl.b3p.gbi.converter;

import java.util.ArrayList;
import java.util.List;

public class Converter {

    private List<Attribuut> attrs;

    public Converter(List<Attribuut> attrs) {
        this.attrs = attrs;

    }

    public List<Formulier> convert(List<Paspoort> ps) {
        List<Formulier> forms = new ArrayList<>();
        ps.forEach(paspoort -> {
            forms.add(convert(paspoort));
        });
        return forms;
    }

    public Formulier convert(Paspoort p) {
        Formulier form = new Formulier();
        form.setName(p.getNaam());
        String tableName = p.getTabelnaam().toLowerCase();
        if (tableName.contains("gb_")) {
            tableName = tableName.substring(3);
        }
        form.setFeatureType(tableName);
        form.setTabs(p.getTabs().size());
        form.setTreeNodeColumn(p.getTabs().get(0).getControls().get(0).getKolom().toLowerCase());
        form.setFields(convertFields(p));
        form.setTabConfig(convertTabConfig(p));
        return form;
    }

    public FormulierTabConfig convertTabConfig(Paspoort p) {
        FormulierTabConfig tabConfig = new FormulierTabConfig();

        p.getTabs().forEach(paspoortTab -> {
            tabConfig.getTabs().put("" + (paspoortTab.getIndex() + 1), paspoortTab.getCaption());
        });
        return tabConfig;
    }

    private int numFields = 0;
    private final int MAX_FIELDS_PER_COLUMN = 10;
    private int currentColumn = 1;

    public List<FormulierField> convertFields(Paspoort p) {
        List<FormulierField> fields = new ArrayList<>();

        p.getTabs().forEach(tab -> {
            numFields = 0;
            currentColumn = 1;
            tab.getControls().forEach(paspoortControl -> {
                fields.add(convertField(paspoortControl, tab.getIndex() + 1, p));
                numFields++;
                if (numFields >= MAX_FIELDS_PER_COLUMN) {
                    numFields = 0;
                    currentColumn++;
                }
            });
        });
        return fields;
    }


    public FormulierField convertField(PaspoortControl control, int tabNumber, Paspoort paspoort) {
        FormulierField field = new FormulierField();
        field.setKey(control.getKolom().toLowerCase());
        field.setColumn(currentColumn);
        field.setTab(tabNumber);
        field.setLabel(control.getNaam());
        field.setType(getType(control.getType()).toString());
        processFieldForDomain(control, field, paspoort);
        return field;
    }

    private void processFieldForDomain(PaspoortControl control, FormulierField field, Paspoort paspoort) {
        if (control.getDomein() != null && !control.getDomein().isEmpty() && attrs != null) {
            int a = 0;
            for (Attribuut attr : attrs) {
                if (attr.getTabel_naam().equals(paspoort.getTabelnaam()) && attr.getKolom_naam().equals(control.getDomein())) {
                    field.setLinkedList(attr.getId());
                    field.setType("domain");
                }
            }
        }
    }

    public FormulierFieldType getType(String dqType) {
        switch (dqType) {
            case "GeoVisia.Framework.DQTextBox":
                return FormulierFieldType.TEXT;
            case "GeoVisia.Framework.DQChoiceList":
                return FormulierFieldType.SELECT;
            case "GeoVisia.Framework.DQHyperlink":
            case "GeoVisia.Framework.DQImage":
            case "GeoVisia.Framework.DQLabel":
            case "GeoVisia.Framework.DQImageChoiceList":
            case "GeoVisia.Framework.Addons.Maatregeltoets.MaatregeltoetsControl":
            case "GeoVisia.Framework.DQCheckBox":
            case "GeoVisia.Framework.DQMemo":
            case "GeoVisia.Framework.DQDate":
            default:
                System.err.println("Field type not recognized: " + dqType);
                return FormulierFieldType.TEXT;
            //throw new IllegalArgumentException("Field type not recognized: " + dqType);
        }
    }
}
