/*
 * Copyright (C) 2011-2016 B3Partners B.V.
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
package nl.b3p.viewer.config.services;

import java.io.Serializable;
import java.util.*;
import javax.persistence.*;
import nl.b3p.viewer.config.ClobElement;
import static nl.b3p.viewer.config.RemoveEmptyMapValuesUtil.removeEmptyMapValues;
import nl.b3p.viewer.config.app.ApplicationLayer;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.ows.wms.CRSEnvelope;
import org.geotools.ows.wms.StyleImpl;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Matthijs Laan
 */
@Entity
@org.hibernate.annotations.Entity(dynamicUpdate = true)
public class Layer implements Cloneable, Serializable {
    private static final Log log = LogFactory.getLog(Layer.class);

    public static final String EXTRA_KEY_METADATA_URL = "metadata.url";
    public static final String EXTRA_KEY_METADATA_STYLESHEET_URL = "metadata.stylesheet";
    public static final String EXTRA_KEY_DOWNLOAD_URL = "download.url";
    public static final String EXTRA_KEY_FILTERABLE = "filterable";
    public static final String EXTRA_IMAGE_EXTENSION ="image_extension";
    public static final String EXTRA_KEY_ATTRIBUTION = "attribution";

    /**
     * JSON representation of wms:Style elements from capabilities for this layer
     */
    public static final String DETAIL_WMS_STYLES = "wms.styles";

    /**
     * Layer.details map key for comma separated list of layer names of children
     * of this layer.
     */
    public static final String DETAIL_ALL_CHILDREN = "all_children";

    public static final String DETAIL_ALTERNATE_LEGEND_IMAGE_URL = "alternateLegendImageUrl";

    private static Set<String> interestingDetails = new HashSet<>(Arrays.asList(new String[] {
        EXTRA_KEY_METADATA_URL,
        EXTRA_KEY_METADATA_STYLESHEET_URL,
        EXTRA_KEY_DOWNLOAD_URL,
        EXTRA_KEY_FILTERABLE,
        EXTRA_IMAGE_EXTENSION,
        DETAIL_ALL_CHILDREN,
        DETAIL_WMS_STYLES,
        DETAIL_ALTERNATE_LEGEND_IMAGE_URL,
        EXTRA_KEY_ATTRIBUTION
    }));

    private static Set<String> updatableDetails = new HashSet<>(Arrays.asList(new String[] {
        EXTRA_KEY_METADATA_URL,
        DETAIL_ALL_CHILDREN,
        DETAIL_WMS_STYLES
    }));
    
    private static Set<String> allowedSrsList = new HashSet<>(Arrays.asList(new String[] {
        "EPSG:28992" // RD
    }));

    @Id
    private Long id;

    @ManyToOne(fetch=FetchType.LAZY)
    private GeoService service;

    @ManyToOne(fetch=FetchType.LAZY)
    private Layer parent;

    private String name;

    private String title;

    /**
     * Alternative title, can be set by admin
     */
    private String titleAlias;

    @Lob
    @org.hibernate.annotations.Type(type="org.hibernate.type.StringClobType")
    private String legendImageUrl;

    private Double minScale;
    private Double maxScale;

    @ElementCollection
    private Set<CoordinateReferenceSystem> crsList = new HashSet<>();

    @ElementCollection
    private Map<CoordinateReferenceSystem,BoundingBox> boundingBoxes = new HashMap<>();

    @ManyToOne(fetch=FetchType.LAZY)
    private TileSet tileset;

    /**
     * If a service does not have a single top layer, a virtual top layer is
     * created. A virtual layer should not be used in a request to the service.
     *
     * Also a WMS layer which does not have a name is virtual.
     */
    private boolean virtual;
    private boolean queryable;
    private boolean filterable;

    @ManyToOne(fetch=FetchType.LAZY, cascade={CascadeType.PERSIST, CascadeType.MERGE})
    private SimpleFeatureType featureType;

    @ElementCollection
    @Column(name="keyword")
    private Set<String> keywords = new HashSet<>();

    @ElementCollection
    @Column(name="role_name")
    private Set<String> readers = new HashSet<>();

    @ElementCollection
    @Column(name="role_name")
    public Set<String> writers = new HashSet<>();

    @ElementCollection
    @Column(name = "role_name")
    public Set<String> preventGeomEditors = new HashSet<>();

    @ManyToMany(cascade=CascadeType.PERSIST) // Actually @OneToMany, workaround for HHH-1268
    @JoinTable(inverseJoinColumns=@JoinColumn(name="child", unique=true))
    @OrderColumn(name="list_index")
    private List<Layer> children = new ArrayList<>();

    @ElementCollection
    @JoinTable(joinColumns=@JoinColumn(name="layer"))
    // Element wrapper required because of http://opensource.atlassian.com/projects/hibernate/browse/JPA-11
    private Map<String,ClobElement> details = new HashMap<>();

    
    @ManyToMany(cascade=CascadeType.PERSIST) // Actually @OneToMany, workaround for HHH-1268
    @JoinTable(inverseJoinColumns=@JoinColumn(name="matrix_set"))
    @OrderColumn(name="list_index")
    private List<TileMatrixSet> matrixSets = new ArrayList<>();
    
    public Layer() {
    }

    public Layer(org.geotools.ows.wms.Layer l, GeoService service) {
        name = l.getName();
        if (name != null && name.length() > 254) {
            log.warn("Layer name longer than 254 char will be truncated, was: " + name);
            // fix issue#1078
            name = name.substring(0, 252) + "...";
            log.warn("Truncated layer name is: " + name);
        }
        virtual = name == null;
        title = l.getTitle();
        if (title != null && title.length() > 254) {
            log.warn("Layer title longer than 254 char will be truncated, was: " + title);
            // fix issue#1078
            title = title.substring(0, 252) + "...";
            log.warn("Truncated layer title is: " + title);
        }
        minScale = l.getScaleDenominatorMin();
        this.service = service;
        if(Double.isNaN(minScale)) {
            if(!Double.isNaN( l.getScaleDenominatorMin())){
                minScale = l.getScaleDenominatorMin();
            }else{
                minScale = null;
            }
        }
        maxScale = l.getScaleDenominatorMax();
        if(Double.isNaN(maxScale)) {
            if(!Double.isNaN(l.getScaleDenominatorMax())){
                maxScale = l.getScaleDenominatorMax();
            }else{
                maxScale = null;
            }
        }
        /* if min and max -scale are null, get them from the ScaleHint
         * Not quite as save as Scale Denominator, because the implementation
         * various for implementing service products.
         * Scalehint indicates the diagonal size of a pixel in map units, to calculate
         * the scale use Pythagorean theorem
         */
        if (minScale==null && maxScale ==null){
            minScale = l.getScaleDenominatorMin();
            maxScale = l.getScaleDenominatorMax();
            if (Double.isNaN(minScale)){
                minScale=null;
            }
            if (Double.isNaN(maxScale)){
                maxScale=null;
            }
            if (minScale!=null && maxScale!=null){
                /*
                 * In GeoServer 2.2.3 > the scalehint is not the resolution(in units per pixel) but is the
                 * scaledenominator. So no need to calculate the pixel width/height from the diagonal.
                 * Dirty fix... Check if minScale < 750(large resolution) or maxScale < 5000 (very large resolution)
                 */
                if (minScale < 750 && maxScale < 5000){
                    /*
                     * Scalehint indicates the diagonal size of a pixel in map units, to calculate
                     * the scale use Pythagorean theorem
                     */
                    minScale = Math.sqrt(minScale*minScale/2);
                    maxScale = Math.sqrt(maxScale*maxScale/2);
                }
            }
        }

        for(CRSEnvelope e: l.getLayerBoundingBoxes()) {
            BoundingBox b = new BoundingBox(e);
            boundingBoxes.put(b.getCrs(), b);
        }
        
        l.getSrs().retainAll(allowedSrsList);
        for(String s: l.getSrs()) {
            crsList.add(new CoordinateReferenceSystem(s));
        }
        queryable = l.isQueryable();
        if(l.getKeywords() != null) {
            keywords.addAll(Arrays.asList(l.getKeywords()));
        }

        if(!l.getMetadataURL().isEmpty()) {
            details.put(EXTRA_KEY_METADATA_URL, new ClobElement(l.getMetadataURL().get(0).getUrl().toString()));
        }

        if(!l.getStyles().isEmpty()) {
            try {
                JSONArray styles = new JSONArray();
                for(StyleImpl style: l.getStyles()) {
                    JSONObject jstyle = new JSONObject();
                    styles.put(jstyle);
                    jstyle.put("name", style.getName());
                    if(style.getTitle() != null) { // is actually required in XSD
                        jstyle.put("title", style.getTitle().toString());
                    }
                    if(style.getAbstract() != null) {
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
                if(styles.length() > 0) {
                    details.put(DETAIL_WMS_STYLES, new ClobElement(styles.toString()));
                }
            } catch(JSONException e) {
                log.error("Error creating styles JSON", e);
            }
        }

        if(l.getStyles().size() > 0 && l.getStyles().get(0).getLegendURLs().size() > 0) {
            String legendUrl = (String) l.getStyles().get(0).getLegendURLs().get(0);
            // HACK append &SERVICE=WMS if not present, see #628
            if (!StringUtils.containsIgnoreCase(legendUrl, "SERVICE=WMS")) {
                legendUrl = legendUrl.concat("&SERVICE=WMS");
            }
            legendImageUrl = legendUrl;
        }

        for(org.geotools.ows.wms.Layer child: l.getLayerChildren()) {
            Layer childLayer = new Layer(child, service);
            childLayer.setParent(this);
            children.add(childLayer);
        }
    }

    protected void update(Layer update) {
        update(update, null);
    }

    protected void update(Layer update, Set<String> additionalUpdatableDetails) {
        if(!getName().equals(update.getName())) {
            throw new IllegalArgumentException("Cannot update layer with properties from layer with different name!");
        }

        virtual = update.virtual;
        queryable = update.queryable;
        filterable = update.filterable;
        title = update.title;
        minScale = update.minScale;
        maxScale = update.maxScale;

        if(!boundingBoxes.equals(update.boundingBoxes)) {
            boundingBoxes.clear();
            boundingBoxes.putAll(update.boundingBoxes);
        }
        if(!crsList.equals(update.crsList)) {
            crsList.clear();
            crsList.addAll(update.crsList);
        }
        if(!keywords.equals(update.keywords)) {
            keywords.clear();
            keywords.addAll(update.keywords);
        }

        // updateableDetails maps are used for clearing only details which are
        // set by loading metadata, leave details set by other code alone

        for(String s: updatableDetails) {
            details.remove(s);
        }
        if(additionalUpdatableDetails != null) {
            for(String s: additionalUpdatableDetails) {
                details.remove(s);
            }
        }
        // update all metadata loaded details
        details.putAll(update.getDetails());
        removeEmptyMapValues(details);

        legendImageUrl = update.legendImageUrl;

        // tileSet ignored -- only for tile services!
    }

    /**
     * Copy user modified properties of given layer onto this instance. Used for
     * updating the topLayer. Not called for other layers, those instances are
     * updated with update().
     *
     * @param other the source of properties to copy
     */
    protected void copyUserModifiedProperties(Layer other) {
        setTitleAlias(other.getTitleAlias());
        getReaders().clear();
        getReaders().addAll(other.getReaders());
        getWriters().clear();
        getWriters().addAll(other.getWriters());
    }

    /**
     * Clone this layer and remove it from the tree of the GeoService this Layer
     * is part of. Used for updating service, call only on non-persistent objects.
     * @return a clone of this Layer with its parent and service set to null and
     * children set to a new, empty list.
     */
    public Layer pluckCopy() {
        if(Stripersist.getEntityManager().contains(this)) {
            throw new IllegalStateException();
        }
        try {
            Layer clone = (Layer)super.clone();
            clone.setParent(null);
            clone.setChildren(new ArrayList());
            clone.setService(null);

            return clone;
        } catch(CloneNotSupportedException e) {
            return null;
        }
    }

    /**
     * Checks if the layer is bufferable.
     *
     * @return {@code true} if the layer has a featuretype, {@code false}
     * otherwise
     */
    public boolean isBufferable(){
        return this.getFeatureType() != null;
    }

    public interface Visitor {
        public boolean visit(Layer l, EntityManager em);
    }

    /**
     * Do a depth-first traversal while the visitor returns true. Uses the call
     * stack to save layers yet to visit.
     *
     * @param visitor the Layer.Visitor
     * @param em the entity manager to use
     * @return {@code true} if visitor accepted all layers
     */
    public boolean accept(Layer.Visitor visitor, EntityManager em) {
        for(Layer child: getCachedChildren(em)) {
            if(!child.accept(visitor, em)) {
                return false;
            }
        }
        return visitor.visit(this, em);
    }

    public String getDisplayName() {
        if(StringUtils.isNotBlank(titleAlias)) {
            return titleAlias;
        } else if(StringUtils.isNotBlank("title")) {
            return title;
        } else {
            return name;
        }
    }

    public JSONObject toJSONObject() throws JSONException {
        JSONObject o = new JSONObject();

        o.put("id", id);
        o.put("serviceId", service.getId());
        o.put("name", name);

        o.put("virtual", virtual);
        o.put("queryable", queryable);
        o.put("filterable", filterable);

        if(title != null) {
            o.put("title", title);
        }
        if(titleAlias != null) {
            o.put("titleAlias", titleAlias);
        }
        if(legendImageUrl != null) {
            o.put("legendImageUrl", legendImageUrl);
        }
        if(minScale != null) {
            if (minScale.isNaN()||minScale.isInfinite()){
                log.error("Can't use minScale: "+minScale+ " of Servicelayer" +this.service.getName() +" - "+this.name );
            }else{
                o.put("minScale", minScale);
            }
        }
        if(maxScale != null) {
            if (maxScale.isNaN()||maxScale.isInfinite()){
                log.error("Can't use maxScale: "+maxScale+ " of Servicelayer" +this.service.getName() +" - "+this.name );
            }else{
                o.put("maxScale", maxScale);
            }
        }

        o.put("hasFeatureType", featureType != null);
        if(featureType != null) {
            o.put("featureTypeName", featureType.getTypeName());
            o.put("featureTypeId",featureType.getId());
        }

        /* Only include "interesting" details in JSON */

        if(!details.isEmpty()) {
            JSONObject d = new JSONObject();
            o.put("details", d);
            for(Map.Entry<String,ClobElement> e: details.entrySet()) {
                if(interestingDetails.contains(e.getKey())) {
                    d.put(e.getKey(), e.getValue().getValue());
                }
            }
        }

        if (tileset!=null){
            o.put("tileHeight",tileset.getHeight());
            o.put("tileWidth",tileset.getWidth());
            if (tileset.getResolutions()!=null){
                String resolutions="";
                for (Double d : tileset.getResolutions()){
                    if (resolutions.length()>0){
                        resolutions+=",";
                    }
                    resolutions+=d.toString();
                }
                o.put("resolutions",resolutions);
            }
        }

        if (boundingBoxes.size()==1){
            BoundingBox bbox=boundingBoxes.values().iterator().next();
            o.put("bbox",bbox.toJSONObject());
        }
        JSONArray sets = new JSONArray();
        o.put("matrixSets", sets);
        for (TileMatrixSet matrixSet : matrixSets) {
            sets.put(matrixSet.toJSONObject());
        }

        return o;
    }

    public List<Layer> getCachedChildren(EntityManager em) {
        return service.getLayerChildrenCache(this, em);
    }
    
    public List<ApplicationLayer> getApplicationLayers(EntityManager em){
        List<ApplicationLayer> appLayers = em.createQuery("from ApplicationLayer where service = :service"
                + " and layerName = :layerName").setParameter("service", service).setParameter("layerName", this.getName()).getResultList();
        return appLayers;
    }

    //<editor-fold defaultstate="collapsed" desc="getters en setters">
    public Layer getParent() {
        return parent;
    }

    public void setParent(Layer parent) {
        this.parent = parent;
    }

    public boolean isVirtual() {
        return virtual;
    }

    public void setVirtual(boolean virtual) {
        this.virtual = virtual;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getTitleAlias() {
        return titleAlias;
    }

    public void setTitleAlias(String titleAlias) {
        this.titleAlias = titleAlias;
    }

    public GeoService getService() {
        return service;
    }

    public void setService(GeoService service) {
        this.service = service;
    }

    public Set<CoordinateReferenceSystem> getCrsList() {
        return crsList;
    }

    public void setCrsList(Set<CoordinateReferenceSystem> crsList) {
        this.crsList = crsList;
    }

    public SimpleFeatureType getFeatureType() {
        return featureType;
    }

    public void setFeatureType(SimpleFeatureType featureType) {
        this.featureType = featureType;
    }

    public boolean isFilterable() {
        return filterable;
    }

    public void setFilterable(boolean filterable) {
        this.filterable = filterable;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean isQueryable() {
        return queryable;
    }

    public void setQueryable(boolean queryable) {
        this.queryable = queryable;
    }

    public Set<String> getReaders() {
        return readers;
    }

    public void setReaders(Set<String> readers) {
        this.readers = readers;
    }

    public Set<String> getWriters() {
        return writers;
    }

    public void setWriters(Set<String> writers) {
        this.writers = writers;
    }

    public Set<String> getPreventGeomEditors() {
        return preventGeomEditors;
    }

    public void setPreventGeomEditors(Set<String> preventGeomEditors) {
        this.preventGeomEditors = preventGeomEditors;
    }

    public List<Layer> getChildren() {
        return children;
    }

    public void setChildren(List<Layer> children) {
        this.children = children;
    }

    public Set<String> getKeywords() {
        return keywords;
    }

    public void setKeywords(Set<String> keywords) {
        this.keywords = keywords;
    }

    public Map<String, ClobElement> getDetails() {
        return details;
    }

    public void setDetails(Map<String, ClobElement> details) {
        this.details = details;
    }

    public Double getMaxScale() {
        return maxScale;
    }

    public void setMaxScale(Double maxScale) {
        this.maxScale = maxScale;
    }

    public Double getMinScale() {
        return minScale;
    }

    public void setMinScale(Double minScale) {
        this.minScale = minScale;
    }

    public TileSet getTileset() {
        return tileset;
    }

    public void setTileset(TileSet tileset) {
        this.tileset = tileset;
    }

    public String getLegendImageUrl() {
        return legendImageUrl;
    }

    public void setLegendImageUrl(String legendImageUrl) {
        this.legendImageUrl = legendImageUrl;
    }

    public Map<CoordinateReferenceSystem, BoundingBox> getBoundingBoxes() {
        return boundingBoxes;
    }

    public void setBoundingBoxes(Map<CoordinateReferenceSystem, BoundingBox> boundingBoxes) {
        this.boundingBoxes = boundingBoxes;
    }
    
    public List<TileMatrixSet> getMatrixSets() {
        return matrixSets;
    }

    public void setMatrixSets(List<TileMatrixSet> matrixSets) {
        this.matrixSets = matrixSets;
    }
    //</editor-fold>
}
