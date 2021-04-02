package nl.b3p.viewer.helpers.services;

import nl.b3p.viewer.config.services.ArcGISService;
import nl.b3p.viewer.config.services.GeoService;
import nl.b3p.viewer.config.services.UpdateResult;
import nl.b3p.viewer.config.services.WMSService;
import nl.b3p.web.WaitPageStatus;

import javax.persistence.EntityManager;
import java.util.HashMap;
import java.util.Map;

public class GeoserviceFactoryHelper {

    public static UpdateResult update(EntityManager em, GeoService gs){
        ServiceHelper helper = GeoserviceFactoryHelper.getServiceHelper(gs);
        return helper.updateService(em, gs);
    }

    public static void checkServiceOnline(EntityManager em, GeoService s) throws Exception {
        Map params = new HashMap();
        params.put(s.PARAM_ONLINE_CHECK_ONLY, Boolean.TRUE);
        params.put(s.PARAM_USERNAME, s.getUsername());
        params.put(s.PARAM_PASSWORD, s.getPassword());
        ServiceHelper helper = getServiceHelper(s);
        helper.loadServiceFromURL(s.getUrl(), params, new WaitPageStatus() {
            @Override
            public void setCurrentAction(String currentAction) {
                // no debug logging
                super.currentAction.set(currentAction);
            }

            @Override
            public void addLog(String message) {
                // no debug logging
                logs.add(message);
            }
        },em);
    }

    public static ServiceHelper getServiceHelper(GeoService gs){
        if(gs instanceof WMSService){
            return new WMSServiceHelper();
        }else if(gs instanceof ArcGISService){
            return new ArcGISServiceHelper();
        }
        return null;
    }
}
