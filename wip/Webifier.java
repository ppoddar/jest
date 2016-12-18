package oracle.jest;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;


public class Webifier {

    public Webifier() {
        // TODO Auto-generated constructor stub
    }

    public static void main(String[] args) throws IOException {
        if (args.length == 0) {
            throw new IllegalArgumentException("missing jar file name");
        }
        File file = new File(args[0]);
        if (!file.exists()) {
            throw new IOException("jar file " + file + " not found");
        }
        if (file.isDirectory()) {
            throw new IOException("input " + file + " can not be a directory");
        }

        InputStream jar = new FileInputStream(file);
        
        JarAnalyzer analyzer = new JarAnalyzer(args[0], jar);
        
        analyzer.exists("META-INF/persistence.xml");
        
        analyzer.exists("javax/persistence/Persistence.class");

    }

}
