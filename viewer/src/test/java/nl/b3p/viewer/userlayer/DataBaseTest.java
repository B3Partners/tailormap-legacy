package nl.b3p.viewer.userlayer;

import org.junit.Test;

import static org.junit.Assert.*;

public class DataBaseTest {

    private final DataBase dataBase = new PostgreSQL(null);

    @Test
    public void testCreateViewNameNotNull() {
        assertNotNull(dataBase.createViewName());
    }

    @Test
    public void testCreateViewNameUnique() {
        assertNotEquals(dataBase.createViewName(), dataBase.createViewName());
    }

    @Test
    public void testCreateViewNamePrefix() {
        assertTrue(dataBase.createViewName().startsWith(DataBase.PREFIX));
    }
}
