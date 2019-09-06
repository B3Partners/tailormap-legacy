/*
 * Copyright (C) 2012-2017 B3Partners B.V.
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
package nl.b3p.viewer.print;

/**
 *
 * @author Roy Braam
 * @author Eddy Scheper, ARIS B.V.
 * @author Mark Prins
 */
import java.awt.Dimension;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import javax.persistence.EntityManager;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;
import net.sourceforge.stripes.action.ActionBeanContext;
import nl.b3p.commons.HttpClientConfigured;
import nl.b3p.viewer.stripes.ProxyActionBean;
import org.apache.commons.io.IOUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpUriRequest;
import org.opengis.geometry.BoundingBox;

@XmlRootElement(name="info")
@XmlType(propOrder = {"title", "subtitle", "username", "date", "imageUrl", "legendUrls", "bbox", "remark", "quality", "angle", "overviewUrl", "extra", "scale", "uploadURL", "units"})
public class PrintInfo {
    private static final Log log = LogFactory.getLog(PrintInfo.class);
    
    private String title;
    private String subtitle;
    private String username;
    private String date;
    private String imageUrl;
    private String bbox;
    private String remark;
    private int quality;
    private int angle;
    private String scale;
    private String units;
    private List<PrintExtraInfo> extra = new ArrayList();
    private List<Legend> legendUrls = new ArrayList();
    
    private List<File> tempFiles = new ArrayList();
    
    private String overviewUrl;

    private String uploadURL;
    
    public PrintInfo() {
    }    

    @XmlElement(name="title")
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    @XmlElement(name="username")
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    @XmlElement(name="date")
    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    @XmlElement(name="imageUrl")
    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    @XmlElement(name="bbox")
    public String getBbox() {
        return bbox;
    }

    public void setBbox(String bbox) {
        this.bbox = bbox;
    }

    public void setBbox(BoundingBox extent) {
        this.bbox = extent.getMinX()
                + "," + extent.getMinY()
                + "," + extent.getMaxX()
                + "," + extent.getMaxY();
    }

    @XmlElement(name="remark")
    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    @XmlElement(name="quality")
    public int getQuality() {
        return quality;
    }

    public void setQuality(int quality) {
        this.quality = quality;
    }
    @XmlElement(name="subtitle")
    public String getSubtitle() {
        return subtitle;
    }
    
    public void setSubtitle(String subtitle) {
        this.subtitle = subtitle;
    }

    public void setLegendUrls(List<Legend> legendUrls) {
        this.legendUrls=legendUrls;
    }
    
    @XmlElementWrapper(name="legendUrls")
    @XmlElement(name="legendUrl")
    public List<Legend> getLegendUrls(){
        return this.legendUrls;
    }

    @XmlElement(name="angle")
    public int getAngle() {
        return angle;
    }

    public void setAngle(int angle) {
        this.angle = angle;
    }

    @XmlElement(name="overviewUrl")
    public String getOverviewUrl() {
        return overviewUrl;
    }

    public void setOverviewUrl(String overviewUrl) {
        this.overviewUrl = overviewUrl;
    }

    @XmlElementWrapper(name="extra")
    @XmlElement(name="info")
    public List<PrintExtraInfo> getExtra() {
        return extra;
    }

    public void setExtra(List<PrintExtraInfo> extra) {
        this.extra = extra;
    }

    @XmlElement(name="scale")
    public String getScale() {
        return scale;
    }

    public void setScale(String scale) {
        this.scale = scale;
    }

    public String getUploadURL() {
        return uploadURL;
    }

    public void setUploadURL(String uploadURL) {
        this.uploadURL = uploadURL;
    }

    public String getUnits() {
        return units;
    }

    public void setUnits(String units) {
        this.units = units;
    }

    public void cacheLegendImagesAndReadDimensions(ActionBeanContext context, EntityManager em) {
        
        ProxyActionBean pab = new ProxyActionBean();
        pab.setContext(context);
        for(Legend l: legendUrls) {
            for(LegendPart lp: l.getLegendParts()) {
                File legendFile = null;
                InputStream in = null;
                ByteArrayOutputStream legendMemoryCache = new ByteArrayOutputStream();
                FileOutputStream fos = null;
                try {
                    log.debug("Loading legend from URL: " + lp.getUrl());
                    
                    URL u = new URL(lp.getUrl());
                    legendFile = File.createTempFile("legend_img_", null);
                    loadLegend(u, legendMemoryCache, fos, legendFile, pab, em, lp.getServiceId());
                    
                    lp.setUrl(legendFile.toURI().toString());
                    log.debug("Legend part url changed to point to temporary file: " + lp.getUrl());
                    
                    Dimension dim = getImageDimension(new ByteArrayInputStream(legendMemoryCache.toByteArray()));
                    if(dim == null) {
                        log.debug("No dimensions could be determined");
                    } else {
                        lp.setWidth((int)dim.getWidth());
                        lp.setHeight((int)dim.getHeight());
                        log.debug(String.format("Dimensions: %d x %d", lp.getWidth(), lp.getHeight()));
                    }
                } catch (IOException | URISyntaxException e) {
                    log.warn("Exception loading legend dimensions from URL " + lp.getUrl(), e);
                } finally {
                    if(in != null) {
                        try {
                            in.close();
                        } catch (IOException ex) {
                        }
                    }
                    if(fos != null) {
                        try {
                            fos.close();
                        } catch (IOException ex) {
                        }
                    }
                }
            }
        }
    }
    
    private void loadLegend(URL u, ByteArrayOutputStream legendMemoryCache, FileOutputStream fos, File legendFile, ProxyActionBean pab, EntityManager em, Integer serviceId) throws IOException, URISyntaxException {
        tempFiles.add(legendFile);
        legendFile.deleteOnExit();
        fos = new FileOutputStream(legendFile);
        pab.setMustLogin(true);
        pab.setServiceId(new Long(serviceId));
        
        HttpClientConfigured client = pab.getHttpClient(u, em);

        HttpUriRequest req = pab.getHttpRequest(u);
        HttpResponse response = null;
        try {
            response = client.execute(req);

            int statusCode = response.getStatusLine().getStatusCode();
            if (statusCode >= 200 && statusCode < 300) {
                HttpEntity entity = response.getEntity();
                entity.writeTo(legendMemoryCache);
            }else{
                
            }
        } finally {
            if (response != null) {
                client.close(response);
            }
            client.close();
        }

        IOUtils.copy(new ByteArrayInputStream(legendMemoryCache.toByteArray()), fos);
        fos.flush();
    }

    /**
     * Load image dimensions, ideally without decoding the entire image.
     */
    private static Dimension getImageDimension(InputStream image) throws IOException {
        // http://stackoverflow.com/questions/1559253/java-imageio-getting-image-dimension-without-reading-the-entire-file
        
        ImageInputStream in = ImageIO.createImageInputStream(image);
        try {
            final Iterator<ImageReader> readers = ImageIO.getImageReaders(in);
            if(readers.hasNext()) {
                ImageReader reader = readers.next();
                try {
                    reader.setInput(in);
                    return new Dimension(reader.getWidth(0), reader.getHeight(0));
                } finally {
                    reader.dispose();
                }
            }
        } finally {
            if(in != null) {
                in.close();
            }
        }
        return null;
    }
    
    public void removeLegendImagesCache() {
        for(File tempFile: tempFiles) {
            try {
                tempFile.delete();
                log.debug("Temporary file deleted: " + tempFile.getCanonicalPath());
            } catch (IOException e) {
                try {
                    log.error("Error deleting temporary file " + tempFile.getCanonicalPath(), e);
                } catch(IOException ex) {
                }
            }
        }
    }
}
