/*
 * Copyright (C) 2018B3Partners B.V.
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
package nl.b3p.viewer.admin.stripes;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.List;
import javax.net.ssl.SSLException;
import net.sourceforge.stripes.action.ActionBean;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.DefaultHandler;
import net.sourceforge.stripes.action.ForwardResolution;
import net.sourceforge.stripes.action.Resolution;
import net.sourceforge.stripes.action.StreamingResolution;
import net.sourceforge.stripes.action.StrictBinding;
import net.sourceforge.stripes.action.UrlBinding;
import nl.b3p.viewer.admin.UpgradeCheck;

/**
 *
 * @author Meine Toonen
 */
@UrlBinding("/action/admin/upgradecheck/{$event}")
@StrictBinding
public class AfterUpgradeActionBean implements ActionBean {

    private ActionBeanContext context;
    private static final String JSP = "/WEB-INF/jsp/admin/afterupgrade.jsp";
    private List<UpgradeCheck> checks = new ArrayList<>();

    @Override
    public ActionBeanContext getContext() {
        return context;
    }

    @Override
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public List<UpgradeCheck> getChecks() {
        return checks;
    }

    public void setChecks(List<UpgradeCheck> checks) {
        this.checks = checks;
    }

    @DefaultHandler
    public Resolution view() {

        checks.add(new UpgradeCheck("PDOK WMS", "https://geodata.nationaalgeoregister.nl/inspire/au/wms?&request=GetCapabilities&service=WMS"));
        checks.add(new UpgradeCheck("Openbasiskaart", "https://openbasiskaart.nl/mapcache/wmts/?SERVICE=WMTS&REQUEST=GetCapabilities&VERSION=1.0.0"));
        checks.add(new UpgradeCheck("Flamingo5 Geoserver", "https://flamingo5.b3p.nl/geoserver/Test_omgeving/ows?service=wms&version=1.1.1&request=GetCapabilities"));
        String solrurl = context.getServletContext().getInitParameter("flamingo.solr.url");
        if (!solrurl.equals("http://SERVER/solr")) {
            checks.add(new UpgradeCheck("Solr", solrurl));
        }
        String selfUrl = context.getRequest().getRequestURL().toString();
        selfUrl += "ping";
        checks.add(new UpgradeCheck("Zichzelf aanroepen", selfUrl));
       
        runtests();
        return new ForwardResolution(JSP);
    }
    
    public Resolution ping(){
        return new StreamingResolution("application/json", "{success:true}");
    }

    private void runtests() {
        for (UpgradeCheck check : checks) {
            runTest(check);
        }
    }

    private void runTest(UpgradeCheck check) {
        try {
            String url = check.getUrl();
            URL u = new URL(url);
            URLConnection con = u.openConnection();
            
            con.connect();
            Object obj =con.getContent();
            check.setSuccess(true);
        } catch (MalformedURLException ex) {
            check.setSuccess(false);
            check.setLog("URL malformed: " + ex.getLocalizedMessage());
            check.setRemedy("URL goedzetten.");
        } catch (SSLException ex) {
            check.setSuccess(false);
            check.setLog("Cerficaat problemen: " + ex.getLocalizedMessage());
            check.setRemedy("Is het certificaat wel toegevoegd aan java keystore?");
        } catch (IOException ex) {
            check.setSuccess(false);
            check.setLog("Error connecting: " + ex.getLocalizedMessage());
        }
    }
}
