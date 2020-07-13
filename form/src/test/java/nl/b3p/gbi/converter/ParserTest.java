package nl.b3p.gbi.converter;


import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.util.List;

import static org.junit.Assert.assertEquals;
@Ignore
public class ParserTest {

    private Parser parser;

    private File element;
    public ParserTest(){

    }

    @Before
    public void init(){
        this.parser = new Parser();

        String filename = "paspoorten" + File.separator + "Element.txt";
        URL u = this.getClass().getResource(filename);
        element = new File(u.getFile());
    }

    @Test
    public void testParseSinglefile() throws IOException {
        assert(element.exists());
        List<Paspoort> ps = this.parser.parse(element);
        assertEquals(1, ps.size());
    }

    @Test
    public void testParseDirectoryOfPaspoorten() throws IOException {
        String d = "paspoorten" + File.separator ;
        URL u = this.getClass().getResource(d);
        File dir = new File(u.getFile());
        assert(dir.exists());
        List<Paspoort> ps = this.parser.parse(dir);
        assertEquals(118, ps.size());
    /*    Set<String> types = new HashSet<>();
        ps.forEach(p ->{
            p.getTabs().forEach(t->{
                t.getControls().forEach(c->{
                    types.add(c.getType());
                });
            });
        });*/
    }

    @Test
    public void testParseElementPaspoort() throws IOException {
        List<Paspoort> ps = this.parser.parse(element);
        assertEquals(1, ps.size());
        Paspoort p = ps.get(0);

        assertEquals("Element", p.getNaam());
        assertEquals("Element", p.getBeschrijving());
        assertEquals(1, p.getTabs().size());
    }

    @Test
    public void testParseElementTab() throws IOException {
        List<Paspoort> ps = this.parser.parse(element);
        assertEquals(1, ps.size());
        Paspoort p = ps.get(0);

        PaspoortTab t = p.getTabs().get(0);
        assertEquals("Nieuwe tab", t.getNaam());
        assertEquals("Element", t.getCaption());
        assertEquals(0, t.getIndex());
        assertEquals(2, t.getControls().size());
    }
    @Test
    public void testParseElementControl() throws IOException {
        List<Paspoort> ps = this.parser.parse(element);
        assertEquals(1, ps.size());
        Paspoort p = ps.get(0);

        PaspoortTab t = p.getTabs().get(0);

        PaspoortControl c = t.getControls().get(0);
        assertEquals("Elementtype", c.getNaam());
        assertEquals("ELEMENT_TYPE", c.getKolom());
        assertEquals(0, c.getIndex());
        assertEquals("GeoVisia.Framework.DQChoiceList", c.getType());
        assertEquals(3, c.getTop());
        assertEquals(22, c.getHeight());
        assertEquals(440, c.getWidth());
        assertEquals(false, c.getLocked());
        assertEquals("ELEMTP", c.getDomein());
    }
}