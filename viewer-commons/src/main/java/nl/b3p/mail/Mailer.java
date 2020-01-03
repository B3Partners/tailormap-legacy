/*
 * Copyright (C) 2012-2013 B3Partners B.V.
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
package nl.b3p.mail;

import java.io.File;
import java.util.Date;
import javax.activation.DataHandler;
import javax.activation.DataSource;
import javax.activation.FileDataSource;
import javax.mail.*;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;
import javax.naming.Context;
import javax.naming.InitialContext;

/**
 *
 * @author Matthijs Laan
 * @author Meine Toonen
 */
public class Mailer {

    public static Session getMailSession() throws Exception {
        
        Context init = new InitialContext();
        Context env = (Context) init.lookup("java:comp/env");
        Session session = (Session)env.lookup("mail/session");
        return session;
    }

    /**
     * Sends a mail with an attachment enclosed
     * @param fromName The name which should be display as the sender.
     * @param fromEmail The replyaddress
     * @param email To which address(es) the mail should be sent, comma separated string for multiple addresses
     * @param subject Subject of the mail
     * @param mailContent The content of the message
     * @throws Exception if any
     */
    public static void sendMail(String fromName, String fromEmail, String email, String subject, String mailContent) throws Exception {
        sendMail(fromName, fromEmail, email, subject, mailContent, null, "text/plain");
    }

    /**
     * Sends a mail with an attachment enclosed
     * @param fromName The name which should be display as the sender.
     * @param fromEmail The replyaddress
     * @param email To which address(es) the mail should be sent, comma separated string for multiple addresses
     * @param subject Subject of the mail
     * @param mailContent The content of the message
     * @param cc A cc address, comma separated string for multiple cc addresses
     * @throws Exception if any
     */
    public static void sendMail(String fromName, String fromEmail, String email, String subject, String mailContent, String cc) throws Exception {
        sendMail(fromName, fromEmail, email, subject, mailContent, cc, "text/plain");
    }
    
    public static void sendMail(String fromName, String fromEmail, String email, String subject, String mailContent, String cc, String mimetype) throws Exception {

        Address from = new InternetAddress(fromEmail, fromName);
        MimeMessage msg = new MimeMessage(getMailSession());
        msg.setFrom(from);
        InternetAddress[] emailAddresses = InternetAddress.parse(email);
        msg.addRecipients(Message.RecipientType.TO, emailAddresses);
        if(cc != null){
            InternetAddress[] ccAddresses = InternetAddress.parse(cc);
            msg.addRecipients(Message.RecipientType.CC, ccAddresses);
        }
        msg.setSubject(subject);
        msg.setSentDate(new Date());
        msg.setContent(mailContent, mimetype != null ?  mimetype : "text/plain");

        Transport.send(msg);
    }

    /**
     * Sends a mail with an attachment enclosed
     * @param fromName The name which should be display as the sender.
     * @param fromEmail The replyaddress
     * @param email To which address(es) the mail should be sent, comma separated string for multiple addresses
     * @param subject Subject of the mail
     * @param mailContent The content of the message
     * @param attachment The attachment to be sent
     * @param filename Give that attachment a naem.
     * @throws Exception if any
     */
    public static void sendMailWithAttachment(String fromName, String fromEmail, String email, String subject, String mailContent, File attachment, String filename) throws Exception {
    
        Address from = new InternetAddress(fromEmail, fromName);
        Message msg = new MimeMessage(getMailSession());
        msg.setFrom(from);
        InternetAddress[] emailAddresses = InternetAddress.parse(email);
        msg.addRecipients(Message.RecipientType.TO, emailAddresses);
        msg.setSubject(subject);
        msg.setSentDate(new Date());        
        
        // Create the message part
        BodyPart messageBodyPart = new MimeBodyPart();
        messageBodyPart.setText(mailContent);
        
        Multipart multipart = new MimeMultipart();
        multipart.addBodyPart(messageBodyPart);

        // Part two is attachment
        messageBodyPart = new MimeBodyPart();
        DataSource source = new FileDataSource(attachment);
        messageBodyPart.setDataHandler(new DataHandler(source));
        messageBodyPart.setFileName(filename);
        multipart.addBodyPart(messageBodyPart);

        // Send the complete message parts
        msg.setContent(multipart);
         
        Transport.send(msg);
    }
}
