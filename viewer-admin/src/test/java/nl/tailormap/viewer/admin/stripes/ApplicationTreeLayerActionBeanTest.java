/*
 * Copyright (C) 2016 B3Partners B.V.
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
package nl.tailormap.viewer.admin.stripes;

import nl.tailormap.viewer.config.app.ApplicationLayer;
import nl.tailormap.viewer.config.app.ConfiguredAttribute;
import nl.tailormap.viewer.util.TestUtil;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * @author meine
 */
public class ApplicationTreeLayerActionBeanTest extends TestUtil {

    private ApplicationTreeLayerActionBean instance = null;
    private JSONArray attributeOrder = new JSONArray();
    private JSONArray attributesConfig = new JSONArray();

    @BeforeEach
    public void setup() {
        initData(true);
        instance = new ApplicationTreeLayerActionBean();
        instance.setApplication(app);

        JSONObject order2 = new JSONObject();
        order2.put("attribute_id", 2);
        order2.put("checked", false);
        order2.put("order", 0);
        order2.put("longname", "begroeid_terreinvakonderdeel_bestaand.fid");
        JSONObject order3 = new JSONObject();
        order3.put("attribute_id", 3);
        order3.put("checked", true);
        order3.put("order", 1);
        order3.put("longname", "begroeid_terreinvakonderdeel_bestaand.id");
        JSONObject order4 = new JSONObject();
        order4.put("attribute_id", 4);
        order4.put("checked", true);
        order4.put("order", 2);
        order4.put("longname", "begroeid_terreinvakonderdeel_bestaand.dat_bgn");
        JSONObject order5 = new JSONObject();
        order5.put("attribute_id", 5);
        order5.put("checked", true);
        order5.put("order", 3);
        order5.put("longname", "begroeid_terreinvakonderdeel_bestaand.dat_end");
        JSONObject order6 = new JSONObject();
        order6.put("attribute_id", 6);
        order6.put("checked", true);
        order6.put("order", 4);
        order6.put("longname", "begroeid_terreinvakonderdeel_bestaand.fysiek_voork");
        JSONObject order9 = new JSONObject();
        order9.put("attribute_id", 9);
        order9.put("checked", true);
        order9.put("order", 5);
        order9.put("longname", "begroeid_terreinvakonderdeel_bestaand.status");
        JSONObject order8 = new JSONObject();
        order8.put("attribute_id", 8);
        order8.put("checked", true);
        order8.put("order", 6);
        order8.put("longname", "begroeid_terreinvakonderdeel_bestaand.rel_hoogte");
        JSONObject order1 = new JSONObject();
        order1.put("attribute_id", 1);
        order1.put("checked", true);
        order1.put("order", 7);
        order1.put("longname", "begroeid_terreinvakonderdeel_bestaand.msGeometry");
        JSONObject order7 = new JSONObject();
        order7.put("attribute_id", 7);
        order7.put("checked", true);
        order7.put("order", 8);
        order7.put("longname", "begroeid_terreinvakonderdeel_bestaand.ident");

        attributeOrder = new JSONArray();
        attributeOrder.put(order2);
        attributeOrder.put(order3);
        attributeOrder.put(order4);
        attributeOrder.put(order5);
        attributeOrder.put(order6);
        attributeOrder.put(order9);
        attributeOrder.put(order8);
        attributeOrder.put(order1);
        attributeOrder.put(order7);

        JSONObject config = new JSONObject();
        config.put("allowValueListOnly", true);
        config.put("defaultValue", "puk");
        config.put("disableUserEdit", true);
        config.put("disallowNullValue", true);
        config.put("editAlias", "pietje");
        config.put("editHeight", "10");
        config.put("editable", true);
        config.put("editvalues", "aap,nootmies");
        config.put("featureType", 2);
        config.put("filterable", true);
        config.put("id", 9);
        config.put("longname", "begroeid_terreinvakonderdeel_bestaand.status");
        config.put("name", "id");
        config.put("selectable", true);
        config.put("valueList", "static");
        config.put("automaticValue", false);
        config.put("automaticValueType", "string");
        attributesConfig = new JSONArray();
        attributesConfig.put(config);
    }

    @AfterEach
    public void tearDown() {
    }

    @Test
    public void testProcessAttributesTestOrder() {
        assertNotNull(app);
        ApplicationLayer appLayer = entityManager.find(ApplicationLayer.class, 2L);
        List<ConfiguredAttribute> attributes = appLayer.getAttributes();
        assertEquals(9, attributes.size());


        List<ConfiguredAttribute> newOrder = instance.processAttributes(entityManager, attributeOrder, attributesConfig, attributes);

        long[] attrOrder = {2, 3, 4, 5, 6, 9, 8, 1, 7};

        for (int i = 0; i < newOrder.size(); i++) {
            ConfiguredAttribute attr = newOrder.get(i);
            long id = attrOrder[i];
            assertEquals(id, (long) attr.getId(), "Order incorrect");
        }
    }

    @Test
    public void testProcessAttributesTestVisible() {
        assertNotNull(app);
        ApplicationLayer appLayer = entityManager.find(ApplicationLayer.class, 2L);
        List<ConfiguredAttribute> attributes = appLayer.getAttributes();
        assertEquals(9, attributes.size());

        List<ConfiguredAttribute> newOrder = instance.processAttributes(entityManager, attributeOrder, attributesConfig, attributes);

        boolean[] attrVisible = {false, true, true, true, true, true, true, true, true};

        for (int i = 0; i < newOrder.size(); i++) {
            ConfiguredAttribute attr = newOrder.get(i);
            boolean visible = attrVisible[i];
            assertEquals(visible, attr.isVisible(), "Visibility incorrect");
        }
    }

    @Test
    public void testProcessAttributesPopulate() {
        assertNotNull(app);
        ApplicationLayer appLayer = entityManager.find(ApplicationLayer.class, 2L);
        List<ConfiguredAttribute> attributes = appLayer.getAttributes();
        assertEquals(9, attributes.size());

        List<ConfiguredAttribute> newAttrs = instance.processAttributes(entityManager, attributeOrder, attributesConfig, attributes);
        assertEquals(9, newAttrs.size(), "Number of returned attributes incorrect");
        ConfiguredAttribute toCheck = null;
        for (ConfiguredAttribute next : newAttrs) {
            if (next.getId() == 9) {
                toCheck = next;
                break;
            }
        }
        assertNotNull(toCheck, "Attribute not present in processed list");
        assertTrue(toCheck.isEditable());
        assertTrue(toCheck.getDisAllowNullValue());
        assertEquals("pietje", toCheck.getEditAlias());
        assertEquals("10", toCheck.getEditHeight());

    }

    @Test
    public void testProcessAttributesPopulateComplete() {
        assertNotNull(app);
        ApplicationLayer appLayer = entityManager.find(ApplicationLayer.class, 2L);
        List<ConfiguredAttribute> attributes = appLayer.getAttributes();
        assertEquals(9, attributes.size());

        List<ConfiguredAttribute> newAttrs = instance.processAttributes(entityManager, attributeOrder, attributesConfig, attributes);
        assertEquals(9, newAttrs.size(), "Number of returned attributes incorrect");
        ConfiguredAttribute toCheck = null;
        for (ConfiguredAttribute next : newAttrs) {
            if (next.getId() == 9) {
                toCheck = next;
                break;
            }
        }
        assertNotNull(toCheck, "Attribute not present in processed list");


        assertTrue(toCheck.getAllowValueListOnly());
        assertEquals("puk", toCheck.getDefaultValue());
        assertTrue(toCheck.isDisableUserEdit());
        assertTrue(toCheck.getDisAllowNullValue());
        assertEquals("pietje", toCheck.getEditAlias());
        assertEquals("10", toCheck.getEditHeight());
        assertTrue(toCheck.isEditable());

        assertEquals("aap,nootmies", toCheck.getEditValues());
        assertTrue(toCheck.isSelectable());
        assertEquals("static", toCheck.getValueList());
    }
}
