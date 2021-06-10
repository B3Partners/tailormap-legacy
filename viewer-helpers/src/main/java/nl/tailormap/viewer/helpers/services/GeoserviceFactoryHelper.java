package nl.tailormap.viewer.helpers.services;

import nl.tailormap.viewer.config.services.ArcGISService;
import nl.tailormap.viewer.config.services.GeoService;
import nl.tailormap.viewer.config.services.UpdateResult;
import nl.tailormap.viewer.config.services.WMSService;
import nl.tailormap.web.WaitPageStatus;

import javax.persistence.EntityManager;
import java.util.HashMap;
import java.util.Map;

public class GeoserviceFactoryHelper {
    public static boolean isUpdatable(GeoService gs){
        return gs instanceof ArcGISService || gs instanceof WMSService;
    }

    public static UpdateResult update(EntityManager em, GeoService gs) throws Exception {
        GeoServiceHelper helper = GeoserviceFactoryHelper.getServiceHelper(gs);
        return helper.updateService(em, gs);
    }

    public static void checkServiceOnline(EntityManager em, GeoService s) throws Exception {
        Map params = new HashMap();
        params.put(s.PARAM_ONLINE_CHECK_ONLY, Boolean.TRUE);
        params.put(s.PARAM_USERNAME, s.getUsername());
        params.put(s.PARAM_PASSWORD, s.getPassword());
        GeoServiceHelper helper = getServiceHelper(s);
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

    public static GeoServiceHelper getServiceHelper(GeoService gs){
        if(gs instanceof WMSService){
            return new WMSServiceHelper();
        }else if(gs instanceof ArcGISService){
            return new ArcGISServiceHelper();
        }
        return null;
    }
}
