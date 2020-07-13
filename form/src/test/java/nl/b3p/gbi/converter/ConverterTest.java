package nl.b3p.gbi.converter;

import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.Assert.*;
@Ignore
public class ConverterTest {

    private Converter instance;
    private Paspoort paspoort;


    @Before
    public void init() throws IOException {
        instance = new Converter();

        String filename = "paspoorten" + File.separator + "Element.txt";
        URL u = this.getClass().getResource(filename);
        File element = new File(u.getFile());

        Parser p = new Parser();
        paspoort = p.parse(element).get(0);
        assertNotNull (paspoort);
    }

    @Test
    public void testConvertSingleFileFormulier(){
        Formulier form = instance.convert(paspoort);
        assertNotNull(form);

        assertEquals("Element", form.getName());
        assertEquals("gb_kw_element", form.getFeatureType());
        assertEquals("element_type", form.getTreeNodeColumn());
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
            assertNotEquals(0, f.getColumn());
            prev.set(f.getColumn());
        });
        assertEquals(3, prev.get());
        int a = 0;
    }

    @Test
    public void testConvertSingleFileField(){
        Formulier form = instance.convert(paspoort);
        assertNotNull(form);

        List<FormulierField> fields = form.getFields();
        assertEquals(2, fields.size());

        FormulierField field = fields.get(0);
        assertEquals("element_type", field.getKey());
        assertEquals("Elementtype", field.getLabel());
        assertEquals("select", field.getType());
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
        assertEquals("Element", tabs.get("1"));
    }

    @Test
    public void testConvertDirectory() throws IOException {
        String filename = "paspoorten" + File.separator ;
        URL u = this.getClass().getResource(filename);
        File dir = new File(u.getFile());

        Parser p = new Parser();
        List<Paspoort> ps = p.parse(dir);
        assertEquals(118 ,ps.size());
        List<Formulier> forms = instance.convert(ps);
        assertNotNull(forms);
        assertEquals(118 ,forms.size());
    }
}