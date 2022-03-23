package nl.tailormap.viewer.helpers.featuresources;

import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.SimpleMessage;
import nl.tailormap.viewer.config.app.ApplicationLayer;
import nl.tailormap.viewer.config.app.ConfiguredAttribute;
import nl.tailormap.viewer.config.services.AttributeDescriptor;
import nl.tailormap.viewer.config.services.FeatureTypeRelation;
import nl.tailormap.viewer.config.services.Layer;
import nl.tailormap.viewer.config.services.SimpleFeatureType;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.stripesstuff.stripersist.Stripersist;

import javax.persistence.EntityManager;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.ResourceBundle;

public class SimpleFeatureTypeHelper {
    private static final Log log = LogFactory.getLog(SimpleFeatureTypeHelper.class);
    public static void clearReferences(Collection<SimpleFeatureType> typesToRemove) {
        // Clear references
        int removed = Stripersist.getEntityManager().createQuery("update Layer set featureType = null where featureType in (:types)")
                .setParameter("types", typesToRemove)
                .executeUpdate();
        if(removed > 0) {
            log.warn("Cleared " + removed + " references to " + typesToRemove.size() + " type names which are to be removed");
        }
    }

    public static void synchronizeFeaturetype(ApplicationLayer appLayer, EntityManager em, ActionBeanContext context,
                                              ResourceBundle bundle, Map<String, String> attributeAliases, boolean geomVisible){
        Layer layer = appLayer.getService().getSingleLayer(appLayer.getLayerName(), em);
        // Synchronize configured attributes with layer feature type
        if (layer != null) {
            if (layer.getFeatureType() == null || layer.getFeatureType().getAttributes().isEmpty()) {
                appLayer.getAttributes().clear();
            } else {
                List<String> attributesToRetain;

                SimpleFeatureType sft = layer.getFeatureType();
                // Rebuild ApplicationLayer.attributes according to Layer FeatureType
                // New attributes are added at the end of the list; the original
                // order is only used when the Application.attributes list is empty
                // So a feature for reordering attributes per applicationLayer is
                // possible.
                // New Attributes from a join or related featureType are added at the
                //end of the list.
                attributesToRetain = rebuildAttributes(appLayer, sft, em, context, bundle, attributeAliases, geomVisible, null, true);

                // Remove ConfiguredAttributes which are no longer present
                List<ConfiguredAttribute> attributesToRemove = new ArrayList<>();
                for (ConfiguredAttribute ca : appLayer.getAttributes()) {
                    if (ca.getFeatureType() == null) {
                        ca.setFeatureType(layer.getFeatureType());
                    }
                    if (!attributesToRetain.contains(ca.getFullName())) {
                        // Do not modify list we are iterating over
                        attributesToRemove.add(ca);
                        if (context != null && !"save".equals(context.getEventName()) ) {
                            context.getMessages().add(new SimpleMessage(bundle.getString("viewer_admin.applicationtreelayeractionbean.unavailable"), ca.getAttributeName()));
                        }
                    }
                }
                for (ConfiguredAttribute ca : attributesToRemove) {
                    appLayer.getAttributes().remove(ca);
                    em.remove(ca);
                }

            }
        }
    }


    private static List<String> rebuildAttributes(ApplicationLayer appLayer, SimpleFeatureType sft, EntityManager em, ActionBeanContext context,
                                           ResourceBundle bundle, Map<String, String> attributeAliases, boolean geomVisible, String headName, boolean searchNextRelation) {
        Layer layer = appLayer.getService().getSingleLayer(appLayer.getLayerName(),em);
        List<String> attributesToRetain = new ArrayList<>();
        for(AttributeDescriptor ad: sft.getAttributes()) {
            String name = ad.getName();

            String fullName=sft.getId()+":"+name;
            //if attribute already added return.
            if (attributesToRetain.contains(fullName)){
                return attributesToRetain;
            }
            attributesToRetain.add(fullName);

            // Used for display in JSP
            if(StringUtils.isNotBlank(ad.getAlias())) {
                attributeAliases.put(fullName, ad.getAlias());
            }

            if(appLayer.getAttribute(sft,name) == null) {
                ConfiguredAttribute ca = new ConfiguredAttribute();
                // default visible if not geometry type
                // and not a attribute of a related featuretype
                boolean defaultVisible=true;
                if (!layer.getFeatureType().getId().equals(sft.getId())|| (!geomVisible && AttributeDescriptor.GEOMETRY_TYPES.contains(ad.getType()))){
                    defaultVisible=false;
                }
                ca.setVisible(defaultVisible);
                ca.setAttributeName(name);
                ca.setFeatureType(sft);
                appLayer.getAttributes().add(ca);
                em.persist(ca);

                if(context != null && !"save".equals(context.getEventName())) {
                    String message =bundle.getString("viewer_admin.applicationtreelayeractionbean.newattr") + " ";
                    if(!layer.getFeatureType().getId().equals(sft.getId())){
                        message+=bundle.getString("viewer_admin.applicationtreelayeractionbean.joined") + " ";
                    }
                    message+=bundle.getString("viewer_admin.applicationtreelayeractionbean.attrsrc") + " ";
                    if(layer.getFeatureType().getId().equals(sft.getId())){
                        message+=": "+ bundle.getString("viewer_admin.applicationtreelayeractionbean.visible");
                    }
                    context.getMessages().add(new SimpleMessage(message, name));
                }
            }
        }

        String sftName = sft.getTypeName();
        if (sft.getRelations()!=null && headName == null){
            for (FeatureTypeRelation rel : sft.getRelations()){
                if(searchNextRelation) {
                    attributesToRetain.addAll(rebuildAttributes(appLayer, rel.getForeignFeatureType(), em, context, bundle, attributeAliases, geomVisible, sft.getTypeName(), rel.isSearchNextRelation()));
                }
            }
        } else if (!headName.equals(sft.getTypeName())){
            if(searchNextRelation) {
                for (FeatureTypeRelation rel : sft.getRelations()){
                    attributesToRetain.addAll(rebuildAttributes(appLayer, rel.getForeignFeatureType(), em, context, bundle, attributeAliases, geomVisible, headName, rel.isSearchNextRelation()));
                }
            }
        }
        return attributesToRetain;
    }


}
