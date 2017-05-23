/*
 * Copyright (C) 2012-2016 B3Partners B.V.
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

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.Date;
import javax.servlet.http.HttpServletResponse;
import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.util.JAXBSource;
import javax.xml.transform.Result;
import javax.xml.transform.Source;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.sax.SAXResult;
import javax.xml.transform.stream.StreamSource;
import nl.b3p.mail.Mailer;
import org.apache.commons.io.output.ByteArrayOutputStream;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.fop.apps.FOPException;
import org.apache.fop.apps.FOUserAgent;
import org.apache.fop.apps.Fop;
import org.apache.fop.apps.FopFactory;

/**
 *
 * @author meine
 */
public class PrintGenerator  implements Runnable{
    private static final Log log = LogFactory.getLog(PrintGenerator.class);
    
    private final PrintInfo info;
    private final String mimeType;
    private final File xsl;
    private final String filename;
    private final String fromName;
    private final String fromMail;
    private final  String toMail;

    public PrintGenerator(PrintInfo info, String mimeType, File xsl, String filename, String fromName, String fromMail, String toMail) {
        this.info = info;
        this.mimeType = mimeType;
        this.xsl = xsl;
        this.filename = filename;
        this.fromName = fromName;
        this.fromMail = fromMail;
        this.toMail = toMail;
    }

    @Override
    public void run() {
        try {
            mailPrint();
        } catch (Exception ex) {
            log.error("Cannot create print.", ex);
            try {
                Mailer.sendMail(fromName, fromMail,toMail, "Fout bij printen", "De print kon niet worden gemaakt. De foutmelding is: " + ex.getLocalizedMessage());
            } catch (Exception ex1) {
                log.error("Cannot send mail for reporting exception");
            }
        }
    }
    
    public void mailPrint() throws Exception{
        File temp = File.createTempFile("flamingo", "print");
        try {
            FileOutputStream fos = new FileOutputStream(temp);

            String path = new File(xsl.getParent()).toURI().toString();
            //        PrintInfo info, String mimeType, InputStream xslIs, String basePath, OutputStream ou
            createOutput(info, mimeType, new FileInputStream(xsl), path, fos, filename);
            Mailer.sendMail(fromName, fromMail,toMail,"Print is klaar", "De print is klaar en staat in de bijlage", temp, filename);
        } finally {
            temp.delete();
        }
    }
    
    
    public static void createOutput(PrintInfo info, String mimeType, File xslFile,
            boolean addJavascript, HttpServletResponse response, String filename) throws URISyntaxException, IOException {

        String path = new File(xslFile.getParent()).toURI().toString();
        createOutput(info, mimeType, new FileInputStream(xslFile), path, addJavascript, response,filename);
    }
    public static void createOutput(PrintInfo info, String mimeType, URL xslUrl,
            boolean addJavascript, HttpServletResponse response, String filename) throws URISyntaxException, IOException {

        String path = xslUrl.toString().substring(0, xslUrl.toString().lastIndexOf("/")+1);
        createOutput(info, mimeType, xslUrl.openStream(), path, addJavascript, response,filename);
    }
    /**
     * Create the output pdf.
     * @param info the print info
     * @param mimeType mimeType of the result
     * @param xslIs inputstream for xsl sheet
     * @param basePath the base path of that sheet
     * @param addJavascript addJavascript?
     * @param response the response for the outputstream
     * @param filename output filename
     * @throws URISyntaxException if getting the image fails
     * @throws IOException if saving the image fails
     */
    public static void createOutput(PrintInfo info, String mimeType, InputStream xslIs, String basePath,
            boolean addJavascript, HttpServletResponse response, String filename) throws URISyntaxException, IOException {

  
        /* Setup output stream */
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        createOutput(info, mimeType, xslIs, basePath, out,filename);
        /* Setup response */
        response.setContentType(mimeType);
        response.setContentLength(out.size());

        response.setHeader("Content-Disposition", "attachment; filename=" + filename);

       //TODO: Postprocess pages to add javascript print
       /* use postprocessing with itext to add Javascript to output 
         if (addJavascript) {
         addJsToPdfOutput(out, response);
         } else {
         response.getOutputStream().write(out.toByteArray());
         }*/
        response.getOutputStream().write(out.toByteArray());

        response.getOutputStream().flush();

    }
    
    
    public static void createOutput(PrintInfo info, String mimeType, InputStream xslIs, String basePath, OutputStream out, String filename)
            throws URISyntaxException, IOException {
        
        /* Setup fopfactory */
        FopFactory fopFactory = FopFactory.newInstance(new URI(basePath));

        try {
            /* Construct fop */
            FOUserAgent foUserAgent = fopFactory.newFOUserAgent();
            foUserAgent.setCreator("Flamingo");
            foUserAgent.setProducer("Flamingo");

            Date now = new Date();
            foUserAgent.setCreationDate(now);
            foUserAgent.setTitle("Kaart");

            Fop fop = fopFactory.newFop(mimeType, foUserAgent, out);

            /* Setup Jaxb */
            JAXBContext jc = JAXBContext.newInstance(PrintInfo.class);
            JAXBSource src = new JAXBSource(jc, info);
            
            if (log.isDebugEnabled()) {
                log.debug("Print XML:\n" + PrintUtil.printInfoToString(info));
            }
            /* Setup xslt */
            Source xsltSrc = new StreamSource(xslIs);
            xsltSrc.setSystemId(basePath);

            TransformerFactory factory = TransformerFactory.newInstance();
            Transformer transformer = factory.newTransformer(xsltSrc);

            Result res = new SAXResult(fop.getDefaultHandler());

            transformer.transform(src, res);
          
         } catch (FOPException | JAXBException | TransformerException ex) {
            log.error("Fout tijdens print output: ", ex);
        } finally {
            out.close();
        }
    }
    
}
