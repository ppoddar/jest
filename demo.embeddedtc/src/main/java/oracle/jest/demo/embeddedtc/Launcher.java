package oracle.jest.demo.embeddedtc;

import java.io.File;

import org.apache.catalina.WebResourceRoot;
import org.apache.catalina.core.StandardContext;
import org.apache.catalina.startup.Tomcat;
import org.apache.catalina.webresources.DirResourceSet;
import org.apache.catalina.webresources.StandardRoot;

import oracle.jest.JESTServlet;

public class Launcher {

    public static void main(String[] args) throws Exception {
        Tomcat tomcat = new Tomcat();
        
        int webPort = args.length == 1 ? Integer.valueOf(args[0]) : 8090;
        
        tomcat.setPort(webPort);
        
        StandardContext ctx = (StandardContext)tomcat.addWebapp("/", 
                new File("target/classes").getAbsolutePath());
        
        Tomcat.addServlet(ctx, "jest", JESTServlet.class.getName());
        ctx.addServletMapping("/jest/*", "jest");

        ctx.setPreemptiveAuthentication(false);
        
        tomcat.start();
        tomcat.getServer().await();
    }

}
