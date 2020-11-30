package nl.b3p.viewer.userlayer;

import org.junit.Test;

import static org.junit.Assert.*;

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
