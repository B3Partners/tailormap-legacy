package nl.tailormap.viewer.userlayer;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class DataBaseTest {
    private static final String TABLE_NAME = "my-name";
    private final DataBase dataBase = new PostgreSQL(null);

    @Test
    public void testCreateViewNameIsNotNull() {
        assertNotNull(dataBase.createViewName(TABLE_NAME));
    }

    @Test
    public void testCreateViewNameHasNoDashes() {
        assertFalse(dataBase.createViewName(TABLE_NAME).contains("-"));
    }

    @Test
    public void testCreateViewNameIsUnique() {
        assertNotEquals(dataBase.createViewName(TABLE_NAME), dataBase.createViewName(TABLE_NAME));
    }

    @Test
    public void testCreateViewNameHasPrefix() {
        assertTrue(dataBase.createViewName(TABLE_NAME).startsWith(DataBase.PREFIX));
    }
}
