package nl.b3p.gbi.converter;

import com.fasterxml.jackson.databind.AnnotationIntrospector;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategy;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Parser {

    ObjectMapper mapper;

    public Parser(){
        mapper = new ObjectMapper();
        mapper.setPropertyNamingStrategy(PropertyNamingStrategy.LOWER_CAMEL_CASE);
    }

    public List<Paspoort> parse(String content) throws IOException {
        return Collections.singletonList(parseFile(content));
    }

    public List<Paspoort> parse(File f) throws IOException {

        if(f.isDirectory()){
            File[] fs = f.listFiles();
            List<Paspoort> ps = new ArrayList<>();
            for (File file : fs) {
                try{
                    ps.add(parseFile(file));
                }catch(IOException e){
                    System.err.println("Cannot parse " + file + ". Skipping file.");
                }
            }
            return ps;
        }else{
            return Collections.singletonList(parseFile(f));
        }

    }

    private Paspoort parseFile(File f) throws IOException {
        if(f.isDirectory()){
            throw new IOException("Parameter is not a file, but a directory. Aborting");
        }
        ObjectMapper mapper = new ObjectMapper();
        mapper.setPropertyNamingStrategy(PropertyNamingStrategy.LOWER_CAMEL_CASE);

        return mapper.readValue(f, Paspoort.class);
    }

    private Paspoort parseFile(String f) throws IOException {
        return mapper.readValue(f, Paspoort.class);
    }
}
