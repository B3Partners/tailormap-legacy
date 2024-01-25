/*
 * Copyright (C) 2017 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package nl.b3p.viewer.util;

import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.services.FeatureSource;
import nl.b3p.viewer.config.services.Layer;
import org.geotools.filter.text.cql2.CQLException;
import org.junit.Before;
import org.junit.Test;
import org.opengis.filter.And;
import org.opengis.filter.Filter;

import static org.junit.Assert.assertEquals;

/**
 *
 * @author Meine Toonen
 */
public class FlamingoCQLTest extends TestUtil{
    
    private FlamingoCQL cql;
    
    public FlamingoCQLTest() {
        cql = new FlamingoCQL();
        
        // maak applayer met een featuresource die we kunnen gebruiken om applayer cql te maken.
    }
    
    @Before
    public void setupAppLayer(){
        ApplicationLayer al = new ApplicationLayer();
        Layer l = new Layer();
        FeatureSource fs;
    }

    @Test
    public void testToFilterSingleGeom() throws CQLException {
        String input = "INTERSECTS(the_geom, POLYGON(( 1 1, 2 1, 2 2, 1 2, 1 1)))";
        Filter output = cql.toFilter(input, entityManager);
        
        assertEquals("[ the_geom intersects POLYGON ((1 1, 2 1, 2 2, 1 2, 1 1)) ]", output.toString());
    }

    @Test
    public void testToFilterSingleAttribute() throws CQLException {
        String input = "pietje = 2";
        Filter output = cql.toFilter(input, entityManager);
        
        assertEquals("[ pietje = 2 ]", output.toString());
    }

    @Test
    public void testtoFilterRelatedLayer() throws CQLException {
        // 2: begroeid_terreinvakonderdeel_bestaand
        // 5: begroeid_terreindeel
        // relationkeys:
        // left: 43: ident
        // right: 11: FID
        // uitkomst moet dus zijn:
        // select * from begroeid_terreindeel where ident in (select fid from begroeid_terreinvakonderdeel_bestaand where fysiek_voork = 'aap')
        String input = "RELATED_FEATURE(5,2,fysiek_voork = 'aap')";
        Filter output = cql.toFilter(input, entityManager, false);
        assertEquals(Subselect.class, output.getClass());
        assertEquals("begroeid_terreinvakonderdeel_bestaand", ((Subselect)output).getRelatedTable());
        assertEquals("ident", ((Subselect)output).getMainColumn());
        assertEquals("fid", ((Subselect)output).getRelatedColumn());
    }

    @Test
    public void reversedRelatedFilter() throws CQLException {
        // 2: begroeid_terreinvakonderdeel_bestaand
        // 5: begroeid_terreindeel
        // relationkeys:
        // left: 43: ident
        // right: 11: FID
        // uitkomst moet dus zijn:
        // select * from begroeid_terreinvakonderdeel_bestaand where fid in (select ident from begroeid_terreindeel where fysiek_voork = 'aap')
        String input = "RELATED_FEATURE(2,5,fysiek_voork = 'aap')";
        Filter output = cql.toFilter(input, entityManager, false);
        assertEquals(Subselect.class, output.getClass());
        assertEquals("begroeid_terreindeel", ((Subselect)output).getRelatedTable());
        assertEquals("fid", ((Subselect)output).getMainColumn());
        assertEquals("ident", ((Subselect)output).getRelatedColumn());
    }

    @Test
    public void reversedRelatedInFilter() throws CQLException {
        // 2: begroeid_terreinvakonderdeel_bestaand
        // 5: begroeid_terreindeel
        // relationkeys:
        // left: 43: ident
        // right: 11: FID
        // uitkomst moet dus zijn:
        // select * from begroeid_terreinvakonderdeel_bestaand where fid in (select ident from begroeid_terreindeel where fysiek_voork = 'aap')
      //  String input = "RELATED_FEATURE(2,5,(fysiek_voork IN ('aap')))";
        String input = "RELATED_FEATURE(2,5,(verhardingssoort IN ('ASF','ASR','BDF')))";
        Filter output = cql.toFilter(input, entityManager, false);
        assertEquals(Subselect.class, output.getClass());
        assertEquals("begroeid_terreindeel", ((Subselect)output).getRelatedTable());
        assertEquals("fid", ((Subselect)output).getMainColumn());
        assertEquals("ident", ((Subselect)output).getRelatedColumn());
    }

    @Test
    public void linkedRelatedFilter() throws CQLException {
        String input = "RELATED_FEATURE(5,2, (RELATED_FEATURE(2,5,fysiek_voork = 'aap')))";
        Filter output = cql.toFilter(input, entityManager, false);
        assertEquals(Subselect.class, output.getClass());
        assertEquals(Subselect.class, ((Subselect)output).getRelatedFilter().getClass());
    }


    @Test
    public void testtoFilterRelatedLayerExtraParens() throws CQLException {
        assertEquals(Subselect.class,  cql.toFilter("(RELATED_FEATURE(5,2,fysiek_voork = 'aap'))", entityManager, false).getClass());
    }

    @Test
    public void testtoFilterRelatedLayerDoubleExtraParens() throws CQLException {
        assertEquals(Subselect.class,  cql.toFilter("((RELATED_FEATURE(5,2,fysiek_voork = 'aap')))", entityManager, false).getClass());
    }

    @Test
    public void removeExtraParensAdjoining(){
        assertEquals("", cql.removeAdjoiningParens("()"));
        assertEquals(")", cql.removeAdjoiningParens("())"));
        assertEquals("(", cql.removeAdjoiningParens("(()"));
        assertEquals("", cql.removeAdjoiningParens("(())"));
    }

    @Test
    public void removeExtraParensEnclosing(){
        assertEquals("", cql.removeEnclosingParens("()"));
        assertEquals(")", cql.removeEnclosingParens("())"));
        assertEquals("(", cql.removeEnclosingParens("(()"));
        assertEquals("", cql.removeEnclosingParens("(())"));
    }

    @Test
    public void testtoFilterRelatedLayerTwoFilters() throws CQLException {
        Filter output = cql.toFilter("RELATED_FEATURE(5,2,(fysiek_voork = 'aap' AND fysiek_voork in ('aap', 'kat')))", entityManager, false);
        assertEquals(Subselect.class, output.getClass());
    }

    @Test
    public void testtoFilterRelatedLayerExtraParensAroundSubquery() throws CQLException {
        Filter output = cql.toFilter("RELATED_FEATURE(5,2,(fysiek_voork = 'aap'))", entityManager, false);
        assertEquals(Subselect.class, output.getClass());
    }

    @Test
    public void testtoFilterRelatedLayerTwoRelatedLayer() throws CQLException {
        Filter output = cql.toFilter("RELATED_FEATURE(5,2,(fysiek_voork = 'aap')) AND RELATED_FEATURE(5,2,(fysiek_voork = 'aap'))", entityManager, false);
        assertEquals(true,And.class.isAssignableFrom( output.getClass()));
    }

    @Test
    public void testtoFilterRelatedLayerExtraFilterAtEnd() throws CQLException {
        Filter output = cql.toFilter("RELATED_FEATURE(5,2,fysiek_voork = 'aap') AND jaar = 2020", entityManager, false);
        assertEquals(true, And.class.isAssignableFrom(output.getClass()));
    }

    @Test
    public void testtoFilterRelatedLayerExtraFilterAtStart() throws CQLException {
        Filter output = cql.toFilter("jaar = 2020 AND RELATED_FEATURE(5,2,fysiek_voork = 'aap')", entityManager, false);
        assertEquals(true, And.class.isAssignableFrom(output.getClass()));
    }

    @Test
    public void testtoFilterRelatedLayerExtraFilterAtEndWithParens() throws CQLException {
        Filter output = cql.toFilter("((RELATED_FEATURE(5,2,fysiek_voork = 'aap') AND (std_verhardingssoort ILIKE '%formaat%')))", entityManager, false);
        assertEquals(true, And.class.isAssignableFrom(output.getClass()));
    }

    @Test
    public void testToFilterMultipleAttributes() throws CQLException {
        String input = "pietje = 2 and aap = 'noot'";
        Filter output = cql.toFilter(input, entityManager);
        
        assertEquals("[[ pietje = 2 ] AND [ aap = noot ]]", output.toString());
    }
    
    
    @Test
    public void testToFilterSingleApplayerWithoutFilter() throws CQLException {
        initData(true);
        String input = "APPLAYER(the_geom, " + testAppLayer.getId() + ",)";
        Filter output = cql.toFilter(input, entityManager);
        String result = output.toString();
        String expected = "[ the_geom intersects MULTIPOLYGON (((156328.18824 390534.04988, 163766.04235 389099.60659, 162278.47153 386390.10259, 156912.59106 386868.25035, 156328.18824 390534.04988)), ((150218.52235 432398.54306, 142036.88282 432504.79812, 142355.648 437923.80612, 150218.52235 432398.54306)), ((156487.57082 452161.984, 191870.50541 454712.10541, 191870.50541 441111.45788, 156912.59106 442917.79388, 156487.57082 452161.984)), ((137467.91529 453543.29976, 145437.04471 451418.19859, 144693.25929 443874.08941, 137680.42541 443130.304, 137467.91529 453543.29976))) ]";
        assertEquals(expected, result);
    }
    
    
    @Test
    public void testToFilterSingleApplayerWithFilter() throws CQLException {
        initData(true);
        String input = "APPLAYER(the_geom, " + testAppLayer.getId() + ", gid = 1)";
        Filter output = cql.toFilter(input, entityManager);
        
        assertEquals("[ the_geom intersects POLYGON ((156487.57082 452161.984, 156912.59106 442917.79388, 191870.50541 441111.45788, 191870.50541 454712.10541, 191870.50541 454712.10541, 156487.57082 452161.984)) ]", output.toString());
    }
    
          
    @Test
    public void testToFilterNestedApplayer() throws CQLException {
        initData(true);
        String input = "APPLAYER(geom, " + testAppLayer.getId() + ",  APPLAYER(geom, " + testAppLayer.getId() + ", gid = 1))";
        Filter output = cql.toFilter(input, entityManager);
        
        assertEquals("[ geom intersects POLYGON ((156487.57082 452161.984, 156912.59106 442917.79388, 191870.50541 441111.45788, 191870.50541 454712.10541, 191870.50541 454712.10541, 156487.57082 452161.984)) ]", output.toString());
    }
    
    @Test
    public void testToFilterAttributeAndApplayer() throws CQLException {
        initData(true);
        String input = "pietje = 2 AND APPLAYER(the_geom, " + testAppLayer.getId() + ",  gid = 1)";
        Filter output = cql.toFilter(input, entityManager);
        String result = output.toString();
        assertEquals("[[ pietje = 2 ] AND [ the_geom intersects POLYGON ((156487.57082 452161.984, 156912.59106 442917.79388, 191870.50541 441111.45788, 191870.50541 454712.10541, 191870.50541 454712.10541, 156487.57082 452161.984)) ]]", result);
    }
    
    @Test
    public void testToFilterApplayerAndAttribute() throws CQLException {
        initData(true);
        String input = "APPLAYER(the_geom, " + testAppLayer.getId() + ",  gid = 1) AND pietje = 2 ";
        Filter output = cql.toFilter(input, entityManager);
        String result = output.toString();
        assertEquals("[[ the_geom intersects POLYGON ((156487.57082 452161.984, 156912.59106 442917.79388, 191870.50541 441111.45788, 191870.50541 454712.10541, 191870.50541 454712.10541, 156487.57082 452161.984)) ] AND [ pietje = 2 ]]", result);
    }
    
    @Test
    public void testToFilterApplayerAndGeom() throws CQLException {
        initData(true);
        String input = "INTERSECTS(the_geom, POLYGON(( 1 1, 2 1, 2 2, 1 2, 1 1))) AND APPLAYER(the_geom, " + testAppLayer.getId() + ",  gid = 1)";
        Filter output = cql.toFilter(input, entityManager);
        
        assertEquals("[[ the_geom intersects POLYGON ((1 1, 2 1, 2 2, 1 2, 1 1)) ] AND [ the_geom intersects POLYGON ((156487.57082 452161.984, 156912.59106 442917.79388, 191870.50541 441111.45788, 191870.50541 454712.10541, 191870.50541 454712.10541, 156487.57082 452161.984)) ]]", output.toString());
    }
    
}