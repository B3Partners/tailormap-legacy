package nl.b3p.viewer.helpers.services;

import nl.b3p.viewer.config.services.BoundingBox;
import nl.b3p.viewer.config.services.CoordinateReferenceSystem;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.ows.wms.CRSEnvelope;


public class BoundingBoxHelper {
    private static final Log log = LogFactory.getLog(BoundingBoxHelper.class);

    public static BoundingBox createBoundingbox(CRSEnvelope e) {
        BoundingBox bb = new BoundingBox();
        bb.setCrs(new CoordinateReferenceSystem(e.getSRSName()));
        bb.setMinx(e.getMinX());
        bb.setMiny(e.getMinY());
        bb.setMaxx(e.getMaxX());
        bb.setMaxy(e.getMaxY());
        return bb;
    }

}
