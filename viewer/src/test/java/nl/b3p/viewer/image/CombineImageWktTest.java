package nl.b3p.viewer.image;

import java.awt.Color;
import org.json.JSONObject;
import org.junit.After;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import org.junit.Test;

/**
 *
 * @author mprins
 */
public class CombineImageWktTest {

    private CombineImageWkt c = null;
    private final String WKT = "POINT(167465.36 464237.2)";
    private final String LABEL = "my label";
    // cyan
    private final String COLORSTRING = "00FFFF";
    private final Color COLOR = Color.CYAN;
    private final Float STROKEWIDTH = 1.1f;

    @After
    public void tearDown() {
        c = null;
    }

    @Test
    public void testCombineImageWktString() {
        c = new CombineImageWkt(WKT);
        assertEquals("wkt is niet gelijk", WKT, c.getWktGeom());
    }

    @Test
    public void testCombineImageWktString2() {
        c = new CombineImageWkt(WKT + "#" + COLORSTRING);
        assertEquals(WKT, c.getWktGeom());
        assertEquals(COLOR, c.getColor());
    }

    @Test
    public void testCombineImageWktString3() {
        c = new CombineImageWkt(WKT + "#" + COLORSTRING + "|" + LABEL);
        assertEquals(WKT, c.getWktGeom());
        assertEquals(COLOR, c.getColor());
        assertEquals(LABEL, c.getLabel());
    }

    @Test
    public void testCombineImageWktStringString() {
        c = new CombineImageWkt(WKT, COLORSTRING);
        assertEquals(WKT, c.getWktGeom());
        assertEquals(COLOR, c.getColor());
    }

    @Test
    public void testCombineImageWktStringStringFloat() {
        c = new CombineImageWkt(WKT, COLORSTRING, STROKEWIDTH);
        assertEquals(WKT, c.getWktGeom());
        assertEquals(COLOR, c.getColor());
        assertTrue(Math.abs(STROKEWIDTH - c.getStrokeWidth()) < .01);
    }

    @Test
    public void testCombineImageWktStringFeatureStyle() {
        c = new CombineImageWkt(WKT);

        // issue #1297: the label is not set from the style
        c.setLabel(LABEL);
        assertEquals(LABEL, c.getLabel());

        FeatureStyle style = new FeatureStyle(
                new JSONObject("{label: '" + COLORSTRING + LABEL // to illustrate bug #1297
                        + "',labelOutlineColor: '#FFFFFF', strokeColor: '" + COLORSTRING
                        + "', strokeOpacity: 1, strokeDashstyle: 'solid', strokeWidth: 2, pointRadius: 2, transparent: true, fontSize: 32}")
        );
        c.setStyle(style);
        assertEquals(COLORSTRING + LABEL, c.getLabel());
    }

    @Test
    public void testSetters() {
        c = new CombineImageWkt(WKT);

        c.setWktGeom(WKT);
        c.setColor(COLORSTRING);
        c.setLabel(LABEL);
        c.setStrokeWidth(STROKEWIDTH);

        assertEquals(WKT, c.getWktGeom());
        assertEquals(LABEL, c.getLabel());
        assertEquals(COLOR, c.getColor());
        assertTrue(Math.abs(STROKEWIDTH - c.getStrokeWidth()) < .01);

        c.setColor(COLOR);
        assertEquals(COLOR, c.getColor());
    }

}
