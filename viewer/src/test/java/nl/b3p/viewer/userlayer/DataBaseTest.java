package nl.b3p.viewer.userlayer;

import org.junit.Test;

import static org.junit.Assert.*;

public class DataBaseTest {

    private final DataBase dataBase = new PostgreSQL(null);

    @Test
    public void testCreateViewNameNotNull() {
        assertNotNull(dataBase.createViewName("test"));
    }

    @Test
    public void testCreateViewNameUnique() {
        assertNotEquals(dataBase.createViewName("test"), dataBase.createViewName("test"));
    }

    @Test
    public void testCreateViewNamePrefix() {
        assertTrue(dataBase.createViewName("test").startsWith(DataBase.PREFIX));
    }
}
