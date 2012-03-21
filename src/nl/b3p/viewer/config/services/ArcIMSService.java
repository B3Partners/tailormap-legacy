/*
 * Copyright (C) 2011 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package nl.b3p.viewer.config.services;

import java.net.URL;
import java.util.Map;
import java.util.Set;
import javax.persistence.*;
import nl.b3p.geotools.data.arcims.ArcIMSServer;
import nl.b3p.geotools.data.arcims.axl.AxlField;
import nl.b3p.geotools.data.arcims.axl.AxlFieldInfo;
import nl.b3p.geotools.data.arcims.axl.AxlLayerInfo;
import nl.b3p.web.WaitPageStatus;
import org.geotools.data.ServiceInfo;
import org.geotools.data.ows.HTTPClient;
import org.geotools.data.ows.SimpleHttpClient;
import org.json.JSONException;
import org.json.JSONObject;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Matthijs Laan
 */
@Entity
@DiscriminatorValue(ArcIMSService.PROTOCOL)
public class ArcIMSService extends GeoService {
    public static final String PROTOCOL = "arcims";
    
    public static final String PARAM_SERVICENAME = "ServiceName";
    public static final String PARAM_USERNAME = "username";
    public static final String PARAM_PASSWORD = "password";    
    
    @Basic
    private String serviceName;

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    @Override
    public GeoService loadFromUrl(String url, Map params, WaitPageStatus status) throws Exception {
        try {
            status.setCurrentAction("Ophalen informatie...");

            ArcIMSService ims = new ArcIMSService();
            ims.setUsername((String)params.get(PARAM_USERNAME));
            ims.setPassword((String)params.get(PARAM_PASSWORD));            
           
            HTTPClient client = new SimpleHttpClient();
            client.setUser(ims.getUsername());
            client.setPassword(ims.getPassword());
            
            serviceName = (String)params.get(PARAM_SERVICENAME);
           
            ArcIMSServer gtims = new ArcIMSServer(new URL(url), serviceName, client);

            ServiceInfo si = gtims.getInfo();
            ims.setName(si.getTitle());
            ims.setServiceName(gtims.getServiceName());
            ims.setUrl(url);

            status.setProgress(50);
            status.setCurrentAction("Inladen layers...");
            
            /* Automatically create featuresource */
            ArcXMLFeatureSource fs = new ArcXMLFeatureSource();
            fs.setLinkedService(ims);
            fs.setServiceName(ims.getServiceName());
            fs.setUsername(ims.getUsername());
            fs.setPassword(ims.getPassword());
            
            fs.setUrl(url);
            
            /* ArcIMS has a flat layer structure, create a virtual top layer */
            
            Layer top = new Layer();
            
            top.setVirtual(true);
            top.setTitle("Layers");
            top.setService(ims);

            for(AxlLayerInfo axlLayerInfo: gtims.getAxlServiceInfo().getLayers()) {
                top.getChildren().add(parseAxlLayerInfo(axlLayerInfo, ims, fs, top));
            }
            ims.setTopLayer(top);
            
            if(!Boolean.FALSE.equals(params.get(PARAM_PERSIST_FEATURESOURCE)) && !fs.getFeatureTypes().isEmpty()) {
                fs.setName(FeatureSource.findUniqueName(ims.getName()));
                Stripersist.getEntityManager().persist(fs);
            }
            
            return ims;
        } finally {
            status.setCurrentAction("");
            status.setProgress(100);
            status.setFinished(true);
        }
    }
    
    
    @Override
    public JSONObject toJSONObject(boolean flatten, Set<String> layersToInclude) throws JSONException {
        JSONObject o = super.toJSONObject(flatten, layersToInclude);
        if(serviceName != null) {
            o.put("serviceName", serviceName);
        }
        return o;
    }    
    
    @Override
    public JSONObject toJSONObject(boolean flatten) throws JSONException {
        return toJSONObject(flatten, null);
    }
    
    private Layer parseAxlLayerInfo(AxlLayerInfo axl, GeoService service, ArcXMLFeatureSource fs, Layer parent) {
        Layer l = new Layer();
        l.setParent(parent);
        l.setService(service);
        l.setFilterable(AxlLayerInfo.TYPE_FEATURECLASS.equals(axl.getType()));
        l.setQueryable(true);
        l.setName(axl.getId());
        l.setTitle(axl.getName());
        l.getDetails().put("axl_type", axl.getType());
        String s = axl.getMinscale();
        if(s != null) {
            try {
                l.setMinScale(Double.parseDouble(s.replace(',', '.')));
            } catch(NumberFormatException nfe) {
            }
        }
        s = axl.getMaxscale();
        if(s != null) {
            try {
                l.setMaxScale(Double.parseDouble(s.replace(',', '.')));
            } catch(NumberFormatException nfe) {
            }
        }
        
        if(axl.getFclass() != null) {
            SimpleFeatureType sft = new SimpleFeatureType();
            sft.setFeatureSource(fs);
            sft.setTypeName(axl.getId());
            sft.setWriteable(false);
            sft.setDescription(axl.getName());

            for(AxlFieldInfo axlField: axl.getFclass().getFields()) {
                AttributeDescriptor att = new AttributeDescriptor();
                sft.getAttributes().add(att);
                att.setName(axlField.getName());

                String type;
                switch(axlField.getType()) {
                    case AxlField.TYPE_SHAPE: 
                        if(sft.getGeometryAttribute() == null) {
                            sft.setGeometryAttribute(att.getName());
                        }
                        type = AttributeDescriptor.TYPE_GEOMETRY;
                        break;
                    case AxlField.TYPE_BOOLEAN:
                        type = AttributeDescriptor.TYPE_BOOLEAN;
                        break;
                    case AxlField.TYPE_ROW_ID:
                    case AxlField.TYPE_BIG_INTEGER:
                    case AxlField.TYPE_SMALL_INTEGER:
                    case AxlField.TYPE_INTEGER:
                        type = AttributeDescriptor.TYPE_INTEGER;
                        break;
                    case AxlField.TYPE_DOUBLE:
                    case AxlField.TYPE_FLOAT:
                        type = AttributeDescriptor.TYPE_DOUBLE;
                        break;
                    case AxlField.TYPE_DATE:
                        type = AttributeDescriptor.TYPE_DATE;
                        break;
                    case AxlField.TYPE_CHAR:
                    case AxlField.TYPE_STRING:
                    default:
                        type = AttributeDescriptor.TYPE_STRING;
                }
                att.setType(type);
            }
            fs.getFeatureTypes().add(sft);
            l.setFeatureType(sft);
        }
                        
        return l;
    }
}
