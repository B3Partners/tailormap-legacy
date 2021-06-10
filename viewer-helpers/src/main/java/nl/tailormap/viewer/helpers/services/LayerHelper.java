package nl.tailormap.viewer.helpers.services;

import nl.tailormap.viewer.config.ClobElement;
import nl.tailormap.viewer.config.services.BoundingBox;
import nl.tailormap.viewer.config.services.CoordinateReferenceSystem;
import nl.tailormap.viewer.config.services.GeoService;
import nl.tailormap.viewer.config.services.Layer;
import org.apache.commons.beanutils.BeanUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.mutable.MutableObject;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.ows.wms.CRSEnvelope;
import org.geotools.ows.wms.StyleImpl;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.stripesstuff.stripersist.Stripersist;

import javax.persistence.EntityManager;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static nl.tailormap.viewer.config.services.Layer.DETAIL_WMS_STYLES;
import static nl.tailormap.viewer.config.services.Layer.EXTRA_KEY_METADATA_URL;

public class LayerHelper {
    private static final Log log = LogFactory.getLog(LayerHelper.class);
    private static Set<String> allowedSrsList = new HashSet<>(Arrays.asList(new String[] {
            "EPSG:28992" // RD
    }));

    /**
     * Clone this layer and remove it from the tree of the GeoService this Layer
     * is part of. Used for updating service, call only on non-persistent objects.
     * @return a clone of this Layer with its parent and service set to null and
     * children set to a new, empty list.
     */
    public static Layer pluckCopy(Layer l) {
        if(Stripersist.getEntityManager().contains(l)) {
            throw new IllegalStateException();
        }
        try {
            Layer clone = (Layer) BeanUtils.cloneBean(l);
            clone.setParent(null);
            clone.setChildren(new ArrayList());
            clone.setService(null);

            return clone;
        } catch (Exception e) {
            log.error("Cannot clone layer");
            return null;
        }
    }

    public static Layer loadLayer(org.geotools.ows.wms.Layer gtLayer, GeoService service) {

        Layer l = new Layer();

        l.setName( gtLayer.getName());
        if (l.getName() != null && l.getName().length() > 254) {
            log.warn("Layer name longer than 254 char will be truncated, was: " + l.getName());
            // fix issue#1078
            l.setName(l.getName().substring(0, 252) + "...");
            log.warn("Truncated layer name is: " + l.getName());
        }
        l.setVirtual(l.getName() == null);
        l.setTitle(gtLayer.getTitle());
        if (l.getTitle() != null && l.getTitle().length() > 254) {
            log.warn("Layer title longer than 254 char will be truncated, was: " + l.getTitle());
            // fix issue#1078
            l.setTitle(l.getTitle().substring(0, 252) + "...");
            log.warn("Truncated layer title is: " + l.getTitle());
        }
        l.setMinScale(gtLayer.getScaleDenominatorMin());
        l.setService(service);
        if (Double.isNaN(l.getMinScale())) {
            if (!Double.isNaN(gtLayer.getScaleDenominatorMin())) {
                l.setMinScale( gtLayer.getScaleDenominatorMin());
            } else {
                l.setMinScale(null);
            }
        }
        l.setMaxScale(gtLayer.getScaleDenominatorMax());
        if (Double.isNaN(l.getMaxScale())) {
            if (!Double.isNaN(gtLayer.getScaleDenominatorMax())) {
                l.setMaxScale(gtLayer.getScaleDenominatorMax());
            } else {
                l.setMaxScale(null);
            }
        }
        /* if min and max -scale are null, get them from the ScaleHint
         * Not quite as save as Scale Denominator, because the implementation
         * various for implementing service products.
         * Scalehint indicates the diagonal size of a pixel in map units, to calculate
         * the scale use Pythagorean theorem
         */
        if (l.getMinScale() == null && l.getMaxScale() == null) {
            l.setMinScale(gtLayer.getScaleDenominatorMin());
            l.setMaxScale( gtLayer.getScaleDenominatorMax());
            if (Double.isNaN(l.getMinScale())) {
                l.setMinScale(null);
            }
            if (Double.isNaN(l.getMaxScale())) {
                l.setMaxScale(null);
            }
            if (l.getMinScale() != null && l.getMaxScale() != null) {
                /*
                 * In GeoServer 2.2.3 > the scalehint is not the resolution(in units per pixel) but is the
                 * scaledenominator. So no need to calculate the pixel width/height from the diagonal.
                 * Dirty fix... Check if minScale < 750(large resolution) or maxScale < 5000 (very large resolution)
                 */
                if (l.getMinScale() < 750 && l.getMaxScale() < 5000) {
                    /*
                     * Scalehint indicates the diagonal size of a pixel in map units, to calculate
                     * the scale use Pythagorean theorem
                     */
                    l.setMaxScale(Math.sqrt(l.getMinScale() * l.getMinScale() / 2));
                    l.setMaxScale( Math.sqrt(l.getMaxScale() * l.getMaxScale() / 2));
                }
            }
        }

        for (CRSEnvelope e : gtLayer.getLayerBoundingBoxes()) {
            BoundingBox b = BoundingBoxHelper.createBoundingbox(e);
            l.getBoundingBoxes().put(b.getCrs(), b);
        }

        gtLayer.getSrs().retainAll(allowedSrsList);
        for (String s : gtLayer.getSrs()) {
            l.getCrsList().add(new CoordinateReferenceSystem(s));
        }
        l.setQueryable( gtLayer.isQueryable());
        if (gtLayer.getKeywords() != null) {
            l.getKeywords().addAll(Arrays.asList(gtLayer.getKeywords()));
        }

        if (!gtLayer.getMetadataURL().isEmpty()) {
            l.getDetails().put(EXTRA_KEY_METADATA_URL, new ClobElement(gtLayer.getMetadataURL().get(0).getUrl().toString()));
        }

        if (!gtLayer.getStyles().isEmpty()) {
            try {
                JSONArray styles = new JSONArray();
                for (StyleImpl style : gtLayer.getStyles()) {
                    JSONObject jstyle = new JSONObject();
                    styles.put(jstyle);
                    jstyle.put("name", style.getName());
                    if (style.getTitle() != null) { // is actually required in XSD
                        jstyle.put("title", style.getTitle().toString());
                    }
                    if (style.getAbstract() != null) {
                        jstyle.put("abstract", style.getAbstract().toString());
                    }
                    JSONArray legendUrls = new JSONArray();
                    jstyle.put("legendURLs", legendUrls);
                    for (String url : (List<String>) style.getLegendURLs()) {
                        // HACK append &SERVICE=WMS if not present, see #628
                        if (!StringUtils.containsIgnoreCase(url, "SERVICE=WMS")) {
                            url = url.concat("&SERVICE=WMS");
                        }
                        legendUrls.put(url);
                    }
                }
                if (styles.length() > 0) {
                    l.getDetails().put(DETAIL_WMS_STYLES, new ClobElement(styles.toString()));
                }
            } catch (JSONException e) {
                log.error("Error creating styles JSON", e);
            }
        }

        if (gtLayer.getStyles().size() > 0 && gtLayer.getStyles().get(0).getLegendURLs().size() > 0) {
            String legendUrl = (String) gtLayer.getStyles().get(0).getLegendURLs().get(0);
            // HACK append &SERVICE=WMS if not present, see #628
            if (!StringUtils.containsIgnoreCase(legendUrl, "SERVICE=WMS")) {
                legendUrl = legendUrl.concat("&SERVICE=WMS");
            }
            l.setLegendImageUrl( legendUrl);
        }

        for (org.geotools.ows.wms.Layer child : gtLayer.getLayerChildren()) {
            Layer childLayer = loadLayer(child, service);
            childLayer.setParent(l);
            l.getChildren().add(childLayer);
        }

        return l;
    }

    public static void initLayerCollectionsForUpdate(GeoService service) {
        EntityManager em = Stripersist.getEntityManager();
        // Use separate query instead of one combined one: may lead to lots of
        // duplicate fields depending on the size of each collection
        em.createQuery("from Layer l left join fetch l.crsList where l.service = :this").setParameter("this", service).getResultList();
        em.createQuery("from Layer l left join fetch l.boundingBoxes where l.service = :this").setParameter("this", service).getResultList();
        em.createQuery("from Layer l left join fetch l.keywords where l.service = :this").setParameter("this", service).getResultList();
        em.createQuery("from Layer l left join fetch l.details where l.service = :this").setParameter("this", service).getResultList();
        em.createQuery("from Layer l left join fetch l.children where l.service = :this").setParameter("this", service).getResultList();
    }

    public static void setAllChildrenDetail(Layer layer, EntityManager em) {
        layer.accept(new Layer.Visitor() {

            @Override
            public boolean visit(final Layer l, EntityManager em) {

                if(!l.getChildren().isEmpty()) {
                    final MutableObject<List<String>> layerNames = new MutableObject<>(new ArrayList());
                    l.accept(new Layer.Visitor() {

                        @Override
                        public boolean visit(Layer child, EntityManager em) {
                            if(child != l && child.getChildren().isEmpty() && !child.isVirtual()) {
                                layerNames.getValue().add(child.getName());
                            }
                            return true;
                        }
                    },em);

                    if(!layerNames.getValue().isEmpty()) {
                        l.getDetails().put(Layer.DETAIL_ALL_CHILDREN, new ClobElement(StringUtils.join(layerNames.getValue(), ",")));
                        l.setVirtual(false);
                    }
                }

                return true;
            }
        },em);
    }
}
