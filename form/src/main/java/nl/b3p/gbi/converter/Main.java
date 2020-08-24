package nl.b3p.gbi.converter;

import java.io.File;
import java.io.IOException;
import java.util.List;

public class Main {

    public static void main(String[] args) throws IOException {
        Parser p = new Parser();
        Converter c = new Converter();

        File f = new File(args[0]);

        List<Paspoort> ps = p.parse(f);

        List<Formulier> fs = c.convert(ps);

        fs.forEach(form ->{System.out.println(form.toString());});
        fs.forEach(form ->{
            try {
                form.toFile(form.getFeatureType() + ".b3p");
            } catch (IOException e) {
                e.printStackTrace();
            }
        });


    }
}
