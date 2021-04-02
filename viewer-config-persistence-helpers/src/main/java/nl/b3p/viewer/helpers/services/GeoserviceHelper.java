package nl.b3p.viewer.helpers.services;

import nl.b3p.viewer.config.ClobElement;
import nl.b3p.viewer.config.services.GeoService;
import nl.b3p.viewer.config.services.Layer;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.mutable.MutableObject;
import org.stripesstuff.stripersist.Stripersist;

import javax.persistence.EntityManager;
import java.util.ArrayList;
import java.util.List;


public class GeoserviceHelper {

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
