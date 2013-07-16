package nl.b3p.viewer.util.databaseupdate;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.net.URL;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
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
 *
 * @author Roy Braam
 */
public class DatabaseSynchronizer implements Servlet {

    private static final Log log = LogFactory.getLog(DatabaseSynchronizer.class);
    private static final LinkedHashMap<String, List<String>> updates = new LinkedHashMap<String, List<String>>();
    private static final String SCRIPT_PATH="/scripts";
    private String databaseProductName="postgresql";
    private ServletConfig sc;
    
    static {
        updates.put("init", new ArrayList<String>());
        updates.put("0", new ArrayList<String>());
        updates.get("0").add("schema-export.sql");
        updates.get("0").add("initialize_database.sql");
    }

    public void doInit(){
        
        try {            
            checkScriptDir();
            log.info("Try to update the database");
            Stripersist.requestInit();
            EntityManager em = Stripersist.getEntityManager();
            this.databaseProductName = DynamicStripersistInitializer.databaseProductName;
            if (em!=null){
                Session session = em.unwrap(Session.class);
                Transaction trans=session.beginTransaction();
                LinkedHashMap<String, List<String>> scripts = new LinkedHashMap<String, List<String>>();
                Metadata mdVersion = null;
                //check if any db exists
                try {
                    List<Metadata> metadata = em.createQuery("From Metadata where configKey = :v").setParameter("v", Metadata.VERSION_KEY).getResultList();
                    String version = "init";
                    if (!metadata.isEmpty()) {
                        mdVersion = metadata.get(0);
                        version = mdVersion.getConfigValue();
                    }else{
                        log.info("Database already initialized but not valid. Try to execute scripts again");
                    }
                    scripts = getUpdates(version);
                } catch (Exception e) {
                    log.info("No correct database, run init scripts");
                    scripts.put("0",updates.get("0"));
                }
                if (scripts.isEmpty()){
                    log.info("Database is up to date. No need for running update scripts");
                }else{
                    LinkedHashMap<String, List<File>> scriptFiles = getScriptFiles(scripts);
                    ScriptWorker w = new ScriptWorker(scriptFiles);
                    session.doWork(w);
                    if (w.isErrored()){
                        log.info("Database updates returned a error.");
                    }
                    String updatedVersion = w.getLatestSuccesVersion();
                    if (updatedVersion!=null){
                        if (mdVersion==null){
                            mdVersion = new Metadata();
                            mdVersion.setConfigKey(Metadata.VERSION_KEY);
                        }
                        if(updatedVersion.equals("0")){
                            //if version == 0 the database is created with the schema, version is latest one.
                            updatedVersion=(String) updates.keySet().toArray()[updates.size()-1];
                        }                        
                        mdVersion.setConfigValue(updatedVersion);
                        em.persist(mdVersion);
                        trans.commit();
                        log.info("Database updated to version: "+updatedVersion);
                        //em.getTransaction().commit();
                                               
                    }else{
                        log.info("No updates done on database, maybe a error occured");
                    }
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
    
    private LinkedHashMap<String, List<String>> getUpdates(String version) {
        LinkedHashMap<String, List<String>> scripts = new LinkedHashMap<String, List<String>>();

        boolean versionFound = false;
        for (Entry<String, List<String>> entry : this.updates.entrySet()) {
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

    private void checkScriptDir() {
        File scriptDir = new File(DatabaseSynchronizer.class.getResource(SCRIPT_PATH).getFile());
        File[] scripts=scriptDir.listFiles();
        for (File script : scripts){
            if (script.getName().startsWith(this.databaseProductName.toLowerCase())){
                String scriptName = script.getName().substring(this.databaseProductName.length()+1);
                boolean found=false;
                for (Entry<String, List<String>> entry : this.updates.entrySet()) {
                    for (String registeredScript : entry.getValue()){
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

    private LinkedHashMap<String, List<File>> getScriptFiles(LinkedHashMap<String, List<String>> scripts) throws Exception {
        LinkedHashMap<String, List<File>> scriptFiles = new LinkedHashMap<String, List<File>>();
        for (Entry<String, List<String>> entry : scripts.entrySet()) {
            List<File> scriptList = new ArrayList<File>();
            for (String script : entry.getValue()){
                //check if there is a common script
                URL fileUrl = DatabaseSynchronizer.class.getResource(SCRIPT_PATH+"/"+script);
                File f = null;
                if (fileUrl!=null){
                    f = new File(fileUrl.getFile());
                }else{
                    fileUrl = DatabaseSynchronizer.class.getResource(SCRIPT_PATH+"/"+this.databaseProductName.toLowerCase()+"-"+script);
                    if (fileUrl!=null){
                        f = new File(fileUrl.getFile());
                    }
                }
                if (f == null){
                    throw new Exception("Update script '"+script+"' nor '"+this.databaseProductName.toLowerCase()+"-"+script+"' can be found");
                }
                scriptList.add(f);
            }
            scriptFiles.put(entry.getKey(), scriptList);
        }
        return scriptFiles;
    }
    
    public class ScriptWorker implements Work{
        LinkedHashMap<String, List<File>> updateScripts;
        private String successVersion=null;
        private boolean errored=false;
        
        public ScriptWorker(LinkedHashMap<String, List<File>> scripts){
            this.updateScripts=scripts;
        }
        @Override
        public void execute(Connection cnctn) throws SQLException {                
            ScriptRunner runner = new ScriptRunner(cnctn, true, true);
            for (Entry<String, List<File>> entry : this.updateScripts.entrySet()) {
                List<File> scripts = entry.getValue();
                for (File script : scripts){
                    try {
                        log.info("Run database script: "+script.getPath());
                        runner.runScript(new FileReader(script));
                        if (!this.errored){
                            this.successVersion = entry.getKey();
                        }
                    } catch (Exception ex) {
                        log.error("Error while executing script: " + script.getAbsolutePath(), ex);
                        this.errored = true;
                        break;
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
        doInit();
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
