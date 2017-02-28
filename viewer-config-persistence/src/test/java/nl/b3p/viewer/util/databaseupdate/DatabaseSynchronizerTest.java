/*
 * Copyright (C) 2015 B3Partners B.V.
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
package nl.b3p.viewer.util.databaseupdate;

import java.lang.reflect.InvocationTargetException;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import nl.b3p.viewer.config.metadata.Metadata;
import nl.b3p.viewer.config.services.AttributeDescriptor;
import nl.b3p.viewer.config.services.SolrConf;
import static org.junit.Assert.*;
import org.junit.Test;

/**
 *
 * @author Meine Toonen meinetoonen@b3partners.nl
 */
public class DatabaseSynchronizerTest extends DatabaseSynchronizerTestInterface{

    @Test
    public void testSQLScriptUpdate(){

        DatabaseSynchronizer ds = new DatabaseSynchronizer();
        LinkedHashMap<String, UpdateElement> updates = DatabaseSynchronizer.updates;
        assertFalse(updates.isEmpty());
        Metadata metadata = entityManager.createQuery("From Metadata where configKey = :v", Metadata.class).setParameter("v", Metadata.DATABASE_VERSION_KEY).getSingleResult();
        String oldVersion = metadata.getConfigValue();

        updates.put("" + TEST_VERSION_NUMBER, new UpdateElement(Collections.singletonList("emptySql.sql"), String.class));
        ds.doInit(entityManager);

        Metadata newMetadata = entityManager.createQuery("From Metadata where configKey = :v", Metadata.class).setParameter("v", Metadata.DATABASE_VERSION_KEY).getSingleResult();
        assertNotEquals(oldVersion, newMetadata.getConfigValue());
        assertEquals(TEST_VERSION_NUMBER, Integer.parseInt(newMetadata.getConfigValue()));
    }
    
    @Test
    public void testCodeUpdateWrongMethodname() throws NoSuchMethodException, IllegalAccessException, IllegalArgumentException, InvocationTargetException{
        Metadata metadata = entityManager.createQuery("From Metadata where configKey = :v", Metadata.class).setParameter("v", Metadata.DATABASE_VERSION_KEY).getSingleResult();
        String oldVersion = metadata.getConfigValue();

        DatabaseSynchronizer ds = new DatabaseSynchronizer();
        LinkedHashMap<String, UpdateElement> updates = DatabaseSynchronizer.updates;
        updates.put("" + TEST_VERSION_NUMBER, new UpdateElement(Collections.singletonList("nonExistentMethod"), DatabaseSynchronizerEM.class));
        ds.doInit(entityManager);
        Metadata newMetadata = entityManager.createQuery("From Metadata where configKey = :v", Metadata.class).setParameter("v", Metadata.DATABASE_VERSION_KEY).getSingleResult();
        assertEquals(oldVersion, newMetadata.getConfigValue());
    }

    @Test
    public void testConvertSolrConfigReferenceToValues(){
        DatabaseSynchronizer ds = new DatabaseSynchronizer();
        LinkedHashMap<String, UpdateElement> updates = DatabaseSynchronizer.updates;

        updates.put("" + TEST_VERSION_NUMBER, new UpdateElement(Collections.singletonList("hqsqldb-solrconf_reference_to_value.sql"), String.class));
        ds.doInit(entityManager);

        SolrConf conf = entityManager.find(SolrConf.class, 1L);
        List<String> indexAttrs = conf.getIndexAttributes();
        assertEquals("ident", indexAttrs.get(0));
        assertEquals("status", indexAttrs.get(1));

        List<String> resultAttrs = conf.getResultAttributes();
        assertEquals("ident", resultAttrs.get(0));
        assertEquals("status", resultAttrs.get(1));
    }
}
