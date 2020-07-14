package nl.b3p.gbi.converter;

import java.util.ArrayList;
import java.util.List;

public class Converter {

    public List<Formulier> convert(List<Paspoort> ps){
        List<Formulier> forms = new ArrayList<>();
        ps.forEach(paspoort -> { forms.add(convert(paspoort));});
        return forms;
    }

    public Formulier convert(Paspoort p){
        Formulier form = new Formulier();
        form.setName(p.getNaam());
        String tableName = p.getTabelnaam().toLowerCase();
        if(tableName.contains("gb_")){
            tableName = tableName.substring(3);
        }
        form.setFeatureType(tableName);
        form.setTabs(p.getTabs().size());
        form.setTreeNodeColumn(p.getTabs().get(0).getControls().get(0).getKolom().toLowerCase());
        form.setFields(convertFields(p));
        form.setTabConfig(convertTabConfig(p));
        return form;
    }

    public FormulierTabConfig convertTabConfig(Paspoort p){
        FormulierTabConfig tabConfig = new FormulierTabConfig();

        p.getTabs().forEach(paspoortTab -> {
            tabConfig.getTabs().put("" + (paspoortTab.getIndex() + 1), paspoortTab.getCaption());
        });
        return tabConfig;
    }

    private int numFields = 0;
    private final int MAX_FIELDS_PER_COLUMN = 10;
    private int currentColumn = 1;
    public List<FormulierField> convertFields(Paspoort p){
        List<FormulierField> fields = new ArrayList<>();

        p.getTabs().forEach(tab ->{
            numFields = 0;
            currentColumn = 1;
            tab.getControls().forEach(paspoortControl -> {
                fields.add(convertField(paspoortControl,tab.getIndex() +1));
                numFields++;
                if(numFields >= MAX_FIELDS_PER_COLUMN){
                    numFields = 0;
                    currentColumn++;
                }
            });
        });
        return fields;
    }


    public FormulierField convertField(PaspoortControl control, int tabNumber){
        FormulierField field = new FormulierField();
        field.setKey(control.getKolom().toLowerCase());
        field.setColumn(currentColumn);
        field.setTab(tabNumber);
        field.setLabel(control.getNaam());
        field.setType(getType(control.getType()));
        return field;
    }

    public String getType(String dqType){
        switch (dqType){
            case "GeoVisia.Framework.DQTextBox":
                return "textfield";
            case "GeoVisia.Framework.DQChoiceList":
                return "select";
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
                return "textfield";
                //throw new IllegalArgumentException("Field type not recognized: " + dqType);
        }
    }
}
