package nl.tailormap.gbi.converter;


import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

public class ParserTest {

    private Parser parser;

    private File element;

    public ParserTest() {

    }

    @BeforeEach
    public void init() {
        this.parser = new Parser();

        String filename = "paspoorten" + File.separator + "Wegvakonderdeelplanning.txt";
        URL u = this.getClass().getResource(filename);

        assumeTrue(null != u, "Het test bestand moet er zijn.");
        element = new File(u.getFile());
    }

    @Test
    public void testParseSinglefile() throws IOException {
        assert (element.exists());
        List<Paspoort> ps = this.parser.parse(element);
        assertEquals(1, ps.size());
    }

    @Test
    public void testParseDirectoryOfPaspoorten() throws IOException {
        String d = "paspoorten" + File.separator;
        URL u = this.getClass().getResource(d);
        File dir = new File(u.getFile());
        assert (dir.exists());
        List<Paspoort> ps = this.parser.parse(dir);
        assertEquals(22, ps.size());
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

        assertEquals("Wegvakonderdeelplanning", p.getNaam());
        assertEquals("Planningsresultaten wegvakonderdeel", p.getBeschrijving());
        assertEquals(1, p.getTabs().size());
    }

    @Test
    public void testParseElementTab() throws IOException {
        List<Paspoort> ps = this.parser.parse(element);
        assertEquals(1, ps.size());
        Paspoort p = ps.get(0);

        PaspoortTab t = p.getTabs().get(0);
        assertEquals("WEGVAKONDERDEEL_PLANNING", t.getNaam());
        assertEquals("Planning", t.getCaption());
        assertEquals(0, t.getIndex());
        assertEquals(8, t.getControls().size());
    }

    @Test
    public void testParseElementControl() throws IOException {
        List<Paspoort> ps = this.parser.parse(element);
        assertEquals(1, ps.size());
        Paspoort p = ps.get(0);

        PaspoortTab t = p.getTabs().get(0);

        PaspoortControl c = t.getControls().get(0);
        assertEquals("Maatregel", c.getNaam());
        assertEquals("MAATREGEL_WVKO", c.getKolom());
        assertEquals(0, c.getIndex());
        assertEquals("GeoVisia.Framework.DQTextBox", c.getType());
        assertEquals(24, c.getTop());
        assertEquals(24, c.getHeight());
        assertEquals(400, c.getWidth());
        assertEquals(false, c.getLocked());
        assertEquals("", c.getDomein());
    }
}