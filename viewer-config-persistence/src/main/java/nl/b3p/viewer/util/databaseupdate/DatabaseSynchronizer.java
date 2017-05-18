/*
 * Copyright (C) 2015-2016 B3Partners B.V.
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

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.lang.reflect.Method;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map.Entry;
import javax.persistence.EntityManager;
import javax.servlet.Servlet;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import nl.b3p.viewer.config.metadata.Metadata;
import nl.b3p.viewer.config.stripersist.DynamicStripersistInitializer;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.hibernate.Session;
import org.hibernate.Transaction;
import org.hibernate.jdbc.Work;
import org.stripesstuff.stripersist.Stripersist;

/**
 * Class for Synchronizing the database with the application entitymodel.
 * The class contains a static script holder ('updates'). With versions and the scripts that
 * are needed for upgrading to that version (from the previous defined version).
 * The version of the database model is stored in the database metadata table.
 * First the class checks if there is a 'metadata' table. If not, we assume the
 * database is empty or without Flamingo tables. All scripts that are defined for
 * version '0' are called:
 * - the (at build) auto generated schema-export script
 * - the init script with data that is needed to start.
 * The database is at the latest defined version (fully up to date) so the latest
 * defined version is set in the metadata tabel. &gt;&gt; Update done.
 *
 * If there is a metadata table and a record with the key Metadata.DATABASE_VERSION_KEY
 * then that is the current version of the database model.
 * All scripts that are defined after that version are loaded and called; updating the
 * database to the entity model.
 *
 * The scripts are stored in: 'src/main/resources/scripts'
 * When adding a new script in that folder just define the script name
 * (without database product name) in the 'updates' param with a new version number.
 * When loading the scripts, the loader is first looking for the script with the defined
 * name. For example 'newscript.sql'. If the script is not found the loader is searching
 * for the script with the name '&lt;database product name in lower
 * case&gt;-&lt;script name&gt;' for example: 'postgresql-newscript.sql'.
 * So when a script is the same for all database products (for example simple inserts) you only
 * need to make 1 script '&lt;script name&gt;'. If there are
 * specific database products statements make multiple scripts and name them
 * '&lt;database product name in lower case&gt;-&gt;script name&gt;' in the
 * scripts folder. Add the &lt;script name&gt; in the updates var of this class.
 *
 *
 * @author Roy Braam
 */
public class DatabaseSynchronizer implements Servlet {

    private static final Log log = LogFactory.getLog(DatabaseSynchronizer.class);
    static final LinkedHashMap<String, UpdateElement> updates = new LinkedHashMap<String, UpdateElement>();
    private static final String SCRIPT_PATH="/scripts";
    private String databaseProductName="postgresql";
    private static final String[] SUPPORTED_DATABASE_PRODUCTS = {"postgresql","oracle"};
    private ServletConfig sc;
    UpdateElement uel=    new UpdateElement(new ArrayList<String>(), String.class);
    //The updates definition
    // Use String.class for .sql files, use DatabaseSynchronizerEM.class and the methodName for coded upgrades.
    static {
        //don't edit the 'init' one.
        updates.put("init", new UpdateElement (new ArrayList<String>(), String.class));
        //init scripts:
        updates.put("0", new UpdateElement (new ArrayList<String>(), String.class));
        updates.get("0").add("schema-export.sql");
        updates.get("0").add("initialize_database.sql");

        updates.put("1", new UpdateElement (new ArrayList<String>(), String.class));
        updates.get("1").add("add_solr_config.sql");

        updates.put("2", new UpdateElement (new ArrayList<String>(), String.class));
        updates.get("2").add("update_solr_config.sql");

        updates.put("3", new UpdateElement (new ArrayList<String>(), String.class));
        updates.get("3").add("add_url_level.sql");

        updates.put("4", new UpdateElement (new ArrayList<String>(), String.class));
        updates.get("4").add("configure_exception_layer.sql");

        updates.put("5", new UpdateElement (new ArrayList<String>(), String.class));
        updates.get("5").add("add_cyclorama_account.sql");

        updates.put("6", new UpdateElement (Collections.singletonList("alter_layer_children_child_unique.sql"), String.class));

        updates.put("7", new UpdateElement (Collections.singletonList("add_application_to_bookmark.sql"), String.class));

        updates.put("8", new UpdateElement (Collections.singletonList("add_layer_prevent_geom_editors.sql"), String.class));

        updates.put("9", new UpdateElement (Collections.singletonList("selectedcontentcaches_dirty.sql"), String.class));


        updates.put("10", new UpdateElement(Collections.singletonList("add_allowValueListOnly.sql"), String.class));
        updates.put("11", new UpdateElement (Collections.singletonList("add_valueListFeatureSource.sql"), String.class));

        updates.put("12", new UpdateElement(Collections.singletonList("add_start_map.sql"), String.class));
        updates.put("13", new UpdateElement(Collections.singletonList("add_linked_components.sql"), String.class));
        updates.put("14", new UpdateElement(Collections.singletonList("add_disableEditing.sql"), String.class));

        updates.put("16", new UpdateElement(Collections.singletonList("add_application_rights.sql"), String.class));

        updates.put("17", new UpdateElement(Collections.singletonList("solrconf_reference_to_value.sql"), String.class));

        updates.put("18", new UpdateElement(Collections.singletonList("idx_layer_crs_list.sql"), String.class));
        
        updates.put("19", new UpdateElement(Collections.singletonList("add_label_configured_attribute.sql"), String.class));
        updates.put("20", new UpdateElement(Collections.singletonList("updateApplicationLayersAttributesOrder"), DatabaseSynchronizerEM.class));

        
        updates.put("21", new UpdateElement(Collections.singletonList("remove_selectedIndexChecked.sql"), String.class));

        updates.put("22", new UpdateElement(Collections.singletonList("add_user_ips.sql"), String.class));
        
        updates.put("23", new UpdateElement(Collections.singletonList("removeDuplicateStartLayersLevels.sql"), String.class));

        
        updates.put("24", new UpdateElement(Collections.singletonList("removeFaultyTopLayers.sql"), String.class));
        updates.put("25", new UpdateElement (Collections.singletonList("alter_layer_children_child_unique.sql"), String.class));

        updates.put("26", new UpdateElement(Collections.singletonList("add-wmts-support.sql"), String.class));
        
        updates.put("27", new UpdateElement(Collections.singletonList("fix_removed_startlayers_levels.sql"), String.class));
        
        updates.put("28", new UpdateElement(Collections.singletonList("add_geoservice_rights.sql"), String.class));

        // NB when adding an update also update the metadata version in the testdata.sql file around line 333
    }

    /**
     * Determine the update number. The updates list has an "init"
     * {@link UpdateElement} + a number of numbered patch
     * {@link UpdateElement}'s, this method returns the key of the last patch.
     *
     * @return the highest/update metadata number
     */
    public static String getUpdateNumber() {
        String update = "";
        for (Entry<String, UpdateElement> e : updates.entrySet()) {
            update = e.getKey();
        }
        return update;
    }

    /**
     * Function is called in init() of servlet.
     * Starts the updating process.
     *
     * @param em the entity manager to use
     */
    public void doInit(EntityManager em){

        try {
            checkScriptDir();
            log.info("Checking for need to update the database.");

            this.databaseProductName = DynamicStripersistInitializer.databaseProductName;
            if (em!=null){
                Session session = em.unwrap(Session.class);
                Transaction trans=session.beginTransaction();
                LinkedHashMap<String,UpdateElement> scripts = new LinkedHashMap<String, UpdateElement>();
                Metadata mdVersion = null;
                //check if any db exists
                try {
                    List<Metadata> metadata = em.createQuery("From Metadata where configKey = :v").setParameter("v", Metadata.DATABASE_VERSION_KEY).getResultList();
                    String version = "init";
                    if (!metadata.isEmpty()) {
                        mdVersion = metadata.get(0);
                        version = mdVersion.getConfigValue();
                        log.info("Current database version is: " + version);
                    }else{
                        log.warn("Database already initialized but not valid. Try to execute scripts again.");
                    }
                    scripts = getUpdates(version);
                } catch (Exception e) {
                    log.warn("No correct database, run init scripts");
                    log.debug("Cause: ",e);
                    scripts.put("0",updates.get("0"));
                }
                if (scripts.isEmpty()){
                    log.info("Database is up to date. No need for running update scripts");
                }else{
                    ScriptWorker w = new ScriptWorker(scripts, em);
                    //do the work, execute the scripts.
                    session.doWork(w);
                    if (w.isErrored()){
                        log.info("Database updates returned a error.");
                    }
                    //update the version of the database in the metadata.
                    String updatedVersion = w.getLatestSuccesVersion();
                    if (updatedVersion!=null){
                        if (mdVersion==null){
                            mdVersion = new Metadata();
                            mdVersion.setConfigKey(Metadata.DATABASE_VERSION_KEY);
                        }
                        if(updatedVersion.equals("0")){
                            //if version == 0 the database is created with the schema, version is latest one.
                            updatedVersion=(String) updates.keySet().toArray()[updates.size()-1];
                        }
                        mdVersion.setConfigValue(updatedVersion);
                        if(em.getTransaction().getRollbackOnly()){
                            em.getTransaction().rollback();
                        }
                        if(!em.getTransaction().isActive()){
                            em.getTransaction().begin();
                        }
                        em.persist(mdVersion);
                        em.getTransaction().commit();
                        log.info("Database updated to version: "+updatedVersion);

                    }else{
                        log.info("No updates done on database, maybe a error occured");
                    }
                    //check the version with the needed version.
                    String neededVersion=(String) updates.keySet().toArray()[updates.size()-1];
                    String version ="-1";
                    if (mdVersion!=null){
                        version =mdVersion.getConfigValue();
                    }
                    if (!neededVersion.equalsIgnoreCase(version)){
                        log.warn("Version of database is: "+version+" while the version must be: "+neededVersion+" Try to do the updates manualy");
                    }else{
                        log.info("Database is up to date");
                    }
                }
            }
            //Connection conn = ((Session)em.getDelegate()).getSession(EntityMode.MAP);
        } catch(Exception e){
            log.error("Unable to execute scripts for updating database",e);
        }finally {
            Stripersist.requestComplete();
        }
    }
    /**
     * Get the updates that need to be done to update the database with version :version:
     * to the latest version.
     * @param version
     * @return List of updates needed categorized by the version
     */
    private LinkedHashMap<String, UpdateElement> getUpdates(String version) {
        LinkedHashMap<String, UpdateElement> scripts = new LinkedHashMap<String, UpdateElement>();

        boolean versionFound = false;
        for (Entry<String, UpdateElement> entry : this.updates.entrySet()) {
            if (!versionFound) {
                String v = entry.getKey();
                if (v.equalsIgnoreCase(version)) {
                    versionFound = true;
                }
            }else if (versionFound) {
                scripts.put(entry.getKey(), entry.getValue());
            }
        }
        return scripts;
    }
    /**
     * Checks for scripts that are not yet defined as updates in this class.
     * Gives a warning when found one (properly forgotten to add it to this class)
     */
    private void checkScriptDir() {
        File scriptDir = new File(DatabaseSynchronizer.class.getResource(SCRIPT_PATH).getFile());
        if (scriptDir!=null){
            File[] scripts=scriptDir.listFiles();
            if (scripts!=null){
                for (File script : scripts){
                    String scriptName= null;
                    if (script.getName().startsWith(this.databaseProductName.toLowerCase()+"-")){
                        scriptName = script.getName().substring(this.databaseProductName.length()+1);
                    }else{
                        boolean forOtherProduct=false;
                        for (String supProd : SUPPORTED_DATABASE_PRODUCTS){
                            if (script.getName().startsWith(supProd+"-")){
                                forOtherProduct = true;
                            }
                        }
                        //if not for other product then this is a common script.
                        if (!forOtherProduct){
                            scriptName = script.getName();
                        }
                    }
                    if (scriptName!=null){
                        boolean found=false;
                        for (Entry<String, UpdateElement> entry : this.updates.entrySet()) {
                            for (String registeredScript : entry.getValue().getElements()){
                                if (scriptName.equals(registeredScript)){
                                    found=true;
                                    break;
                                }
                            }
                            if (found){
                                break;
                            }
                        }
                        if (!found){
                            log.warn("The sql script "+script.getAbsolutePath()+" is not registered in a update. "
                                    + "The script is not used to updated the database. Is this correct? "
                                    + "Otherwise add the script to the var DatabaseSynchronizer.updates.");
                        }
                    }
                }
            }
        }
    }

    public class ScriptWorker implements Work{
        LinkedHashMap<String, UpdateElement> updateScripts;
        private String successVersion=null;
        private boolean errored=false;
        private EntityManager em;


        public ScriptWorker(LinkedHashMap<String, UpdateElement> scripts, EntityManager em){
            this.updateScripts=scripts;
            this.em = em;
        }
        @Override
        public void execute(Connection cnctn) throws SQLException {

            ScriptRunner runner = new ScriptRunner(cnctn, true, true);
            for (Entry<String, UpdateElement> entry : this.updateScripts.entrySet()) {
                UpdateElement element = entry.getValue();
                if(element.getClazz() == String.class){
                    for (String script : element.getElements()){
                        InputStream is = null;
                        try {
                            String scriptName=SCRIPT_PATH+"/"+script;
                            is= DatabaseSynchronizer.class.getResourceAsStream(scriptName);
                            if (is==null){
                                scriptName= SCRIPT_PATH+"/"+ databaseProductName.toLowerCase()+"-"+script;
                                is= DatabaseSynchronizer.class.getResourceAsStream(scriptName);
                            }
                            if (is==null){
                                throw new Exception("Update script '"+script+"' nor '"+databaseProductName.toLowerCase()+"-"+script+"' can be found");
                            }
                            log.info("Running database upgrade script: " + scriptName);
                            runner.runScript(new InputStreamReader(is));
                            if (!this.errored){
                                this.successVersion = entry.getKey();
                            }
                        } catch (Exception ex) {
                            try{
                                if (is!=null){
                                    is.close();
                                }
                            }catch(IOException ioe){
                                log.error("Exception while closing InputStream",ioe);
                            }
                            log.error("Error while executing script: " + script, ex);
                            this.errored = true;
                            break;
                        }
                    }
                }else if(element.getClazz() == DatabaseSynchronizerEM.class){
                    try {
                        List<String> methods = element.getElements();
                        DatabaseSynchronizerEM dsem = new DatabaseSynchronizerEM();
                        for (String method : methods) {

                            Method m = dsem.getClass().getMethod(method, EntityManager.class);
                            Object o = m.invoke(dsem, em);
                        }
                    }catch (Exception e){
                        this.errored = true;
                        log.error("Cannot run updatemethod", e);
                    }
                    if (!this.errored){
                        this.successVersion = entry.getKey();
                    }
                }
                if (this.isErrored()){
                    break;
                }
            }
        }
        public boolean isErrored(){
            return this.errored;
        }
        public String getLatestSuccesVersion(){
            return successVersion;
        }
    }

    @Override
    public void init(ServletConfig sc) throws ServletException {
        this.sc=sc;
        Stripersist.requestInit();
        EntityManager em = Stripersist.getEntityManager();
        doInit(em);
    }

    //<editor-fold defaultstate="collapsed" desc="Interface methods">
    @Override
    public ServletConfig getServletConfig() {
        return sc;
    }

    @Override
    public void service(ServletRequest sr, ServletResponse sr1) throws ServletException, IOException {
        return;
    }

    @Override
    public String getServletInfo() {
        return"";
    }

    @Override
    public void destroy() {

    }
    //</editor-fold>
}
