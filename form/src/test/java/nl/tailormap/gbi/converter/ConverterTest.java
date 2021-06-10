package nl.tailormap.gbi.converter;

import org.junit.Before;
import org.junit.Test;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assume.assumeNotNull;

public class ConverterTest {

    private Converter instance;
    private Paspoort paspoort;


    @Before
    public void init() throws IOException {
        instance = new Converter(null);

        String filename = "paspoorten" + File.separator + "Wegvakonderdeelplanning.txt";
        URL u = this.getClass().getResource(filename);
        assumeNotNull("Het test bestand moet er zijn.", u);
        File element = new File(u.getFile());

        Parser p = new Parser();
        paspoort = p.parse(element).get(0);
        assertNotNull (paspoort);
    }

    @Test
    public void testConvertSingleFileFormulier(){
        Formulier form = instance.convert(paspoort);
        assertNotNull(form);

        assertEquals("Wegvakonderdeelplanning", form.getName());
        assertEquals("wegvakonderdeel_planning", form.getFeatureType());
        assertEquals("maatregel_wvko", form.getTreeNodeColumn());
        //assertEquals(2, form.getFields().size());
        assertEquals(null, form.getRelation());
        assertEquals(1, form.getTabs());
        assertEquals(false, form.isNewPossible());
    }

    @Test
    public void testConvertSingleFileFormulierMultiColumns() throws IOException {

        String filename = "paspoorten" + File.separator + "Wegvakonderdeel.txt";
        URL u = this.getClass().getResource(filename);
        File element = new File(u.getFile());

        Parser p = new Parser();
        paspoort = p.parse(element).get(0);

        assertNotNull (paspoort);
        Formulier form = instance.convert(paspoort);
        assertNotNull(form);

        //assertEquals(2, form.getFields().size());
        assertEquals(null, form.getRelation());
        assertEquals(3, form.getTabs());
        assertEquals(false, form.isNewPossible());
        form.getFields().sort(Comparator.comparingInt(FormulierField::getColumn));
        AtomicInteger prev = new AtomicInteger();

        form.getFields().forEach(f->{
            assertTrue(f.getColumn() >= prev.get());
            assertFalse(f.getMandatory());
            assertNotEquals(0, f.getColumn());
            prev.set(f.getColumn());
        });
        assertEquals(2, prev.get());
        int a = 0;
    }

    @Test
    public void testConvertSingleFileField(){
        Formulier form = instance.convert(paspoort);
        assertNotNull(form);

        List<FormulierField> fields = form.getFields();
        assertEquals(8, fields.size());

        FormulierField field = fields.get(0);
        assertEquals("maatregel_wvko", field.getKey());
        assertEquals("Maatregel", field.getLabel());
        assertEquals("textfield", field.getType());
        assertEquals(1, field.getColumn());
        assertEquals(1, field.getTab());

    }

    @Test
    public void testConvertSingleFileTabConfig(){
        Formulier form = instance.convert(paspoort);
        assertNotNull(form);

        FormulierTabConfig conf = form.getTabConfig();
        assertNotNull(conf);
        Map<String, String> tabs = conf.getTabs();
        assertNotNull(tabs);
        assertEquals("Planning", tabs.get("1"));
    }

    @Test
    public void testConvertDirectory() throws IOException {
        String filename = "paspoorten" + File.separator ;
        URL u = this.getClass().getResource(filename);
        File dir = new File(u.getFile());

        Parser p = new Parser();
        List<Paspoort> ps = p.parse(dir);
        assertEquals(22 ,ps.size());
        List<Formulier> forms = instance.convert(ps);
        assertNotNull(forms);
        assertEquals(22 ,forms.size());
    }
}