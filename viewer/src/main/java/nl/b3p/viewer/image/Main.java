/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.b3p.viewer.image;

import java.awt.AlphaComposite;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.GraphicsConfiguration;
import java.awt.Image;
import java.awt.Toolkit;
import java.awt.Transparency;
import java.awt.image.BufferedImage;
import java.awt.image.FilteredImageSource;
import java.awt.image.ImageFilter;
import java.awt.image.ImageProducer;
import java.awt.image.RGBImageFilter;
import java.awt.image.RenderedImage;
import java.io.FileOutputStream;
import javax.imageio.ImageIO;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpMethod;
import org.apache.commons.httpclient.methods.GetMethod;

/**
 *
 * @author Roy
 */
public class Main {

    public static void main(String[] args) throws Exception {
        HttpClient client = new HttpClient();
        HttpMethod method = null;
        client.getHttpConnectionManager().getParams().setConnectionTimeout(30000);
        method = new GetMethod("http://localhost/1.png");
        BufferedImage[] bi = new BufferedImage[4];
        client.executeMethod(method);
        bi[0] = ImageTool.readImage(method, "image/png");
        method = new GetMethod("http://localhost/2.png");
        client.executeMethod(method);
        bi[1] = ImageTool.readImage(method, "image/png");
        method = new GetMethod("http://localhost/3.png");
        client.executeMethod(method);
        bi[2] = ImageTool.readImage(method, "image/png");
        method = new GetMethod("http://localhost/4.png");
        client.executeMethod(method);
        bi[3] = ImageTool.readImage(method, "image/png");
        //BufferedImage combinedImage = ImageTool.combineImages(bi, "image/png");
        FileOutputStream combinedOut = new FileOutputStream("c:/combined.png");


        BufferedImage[] bi2 = new BufferedImage[2];
        method = new GetMethod("http://localhost/5.png");
        client.executeMethod(method);
        bi2[0] = ImageTool.readImage(method, "image/png");
        method = new GetMethod("http://localhost/6.png");
        client.executeMethod(method);
        bi2[1] = ImageTool.readImage(method, "image/png");
        //BufferedImage combinedImage2 = ImageTool.combineImages(bi2, "image/png");
        FileOutputStream combinedOut2 = new FileOutputStream("c:/combined2.png");


        FileOutputStream[] files = new FileOutputStream[4];
        files[0] = new FileOutputStream("c:/imageTool1.png");
        files[1] = new FileOutputStream("c:/imageTool2.png");
        files[2] = new FileOutputStream("c:/imageTool3.png");
        files[3] = new FileOutputStream("c:/imageTool4.png");

        for (int i = 0; i < 4; i++) {
            ImageIO.write(bi[i], "png", files[i]);
        }
        ImageIO.write(bi2[0], "png", new FileOutputStream("c:/image5.png"));
        ImageIO.write(bi2[1], "png", new FileOutputStream("c:/image6.png"));
        //ImageIO.write(combinedImage, "png", combinedOut);
        //ImageIO.write(combinedImage2, "png", combinedOut2);

        BufferedImage[] in = new BufferedImage[4];
        method = new GetMethod("http://localhost/1.png");
        client.executeMethod(method);
        in[3] = ImageIO.read(method.getResponseBodyAsStream());
        method = new GetMethod("http://localhost/2.png");
        client.executeMethod(method);
        in[2] = ImageIO.read(method.getResponseBodyAsStream());
        method = new GetMethod("http://localhost/3.png");
        client.executeMethod(method);
        in[1] = ImageIO.read(method.getResponseBodyAsStream());
        method = new GetMethod("http://localhost/4.png");
        client.executeMethod(method);
        in[0] = ImageIO.read(method.getResponseBodyAsStream());

        files = new FileOutputStream[4];
        files[0] = new FileOutputStream("c:/imageIO1.png");
        files[1] = new FileOutputStream("c:/imageIO2.png");
        files[2] = new FileOutputStream("c:/imageIO3.png");
        files[3] = new FileOutputStream("c:/imageIO4.png");
        for (int i = 0; i < 4; i++) {
            GraphicsConfiguration gc =in[i].createGraphics().getDeviceConfiguration();
            BufferedImage out =
            gc.createCompatibleImage(in[i].getWidth(), in[i].getHeight(), Transparency.BITMASK);
            Graphics2D g2d = out.createGraphics();
            g2d.setComposite(AlphaComposite.Src);
            g2d.drawImage(in[i], 0, 0, in[i].getWidth(), in[i].getHeight(), null);
            g2d.dispose();
            if (i!=3)
                in[i]=ImageTool.changeColor(out,new Color(251,251,251),new Color(0,0,0,0));
            else
                in[i]=ImageTool.changeColor(out,new Color(249,252,232), new Color(249,252,232,1));
            System.out.println(in[i].getColorModel().hasAlpha());
            ImageIO.write(in[i], "png", files[i]);
        }
        BufferedImage[] in2= new BufferedImage[3];
        for (int i=0; i < 3; i++){
            in2[i]=in[i+1];
        }
        //BufferedImage combinedImageIO= ImageTool.combineImages(in,"image/png");
        FileOutputStream combinedOutIO = new FileOutputStream("c:/combinedIO.png");
        //ImageIO.write(combinedImageIO, "png", combinedOutIO);
    }
    
}
