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
package nl.b3p.viewer.util;

import nl.b3p.viewer.config.app.BookmarkTest;
import nl.b3p.viewer.config.app.StartLayerTest;
import nl.b3p.viewer.config.app.StartLevelTest;
import nl.b3p.viewer.util.databaseupdate.DatabaseSynchronizerEMTest;
import nl.b3p.viewer.util.databaseupdate.DatabaseSynchronizerTest;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.runner.RunWith;
import org.junit.runners.Suite;

/**
 *
 * @author Meine Toonen meinetoonen@b3partners.nl
 */
@RunWith(Suite.class)
@Suite.SuiteClasses({
    StartLayerTest.class,
    StartLevelTest.class,
    DatabaseSynchronizerTest.class,
    DatabaseSynchronizerEMTest.class,
    BookmarkTest.class
})
public class ViewerConfigPersistenceSuite {

    @BeforeClass
    public static void setUpClass() throws Exception {
    }

    @AfterClass
    public static void tearDownClass() throws Exception {
    }

    @Before
    public void setUp() throws Exception {
    }

    @After
    public void tearDown() throws Exception {
    }

}
