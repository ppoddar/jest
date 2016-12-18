package oracle.jest;

import java.net.URL;
import java.net.URLClassLoader;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;
import java.util.logging.Logger;

import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

/**
 * A servlet to process entities as REST document.
 * <br>
 * The servlet is based on Java Persistentce API (JPA) interface.
 * On initialization the servelt scans the deployment unit for
 * a persistent unit. A persistent unit is identified by existence
 * of a <code>META-INF/persistence.xml</code> resource within the
 * deployed package.
 * <p>
 * The servlet process HTTP requests via a set of {@link JESTCommand
 * commands}. The servlet passes an {@link JESTContext execution context}
 * before invoking a command.
 * 
 * @author pinaki poddar
 *
 */
@SuppressWarnings("serial")
public class JESTServlet extends HttpServlet {
    
    private static final String PERSISTENCE_UNIT_RESOURCE = "META-INF/persistence.xml";
    private static final String PERSISTENCE_UNIT_NAME = "persistence-unit";
    
    private static final Logger logger = Logger.getLogger("RUNTIME");
    
    @Override
    public void init(ServletConfig config) throws ServletException {
        super.init(config);
        ClassLoader cl = Thread.currentThread().getContextClassLoader();
        printResourceVisbility(cl, PERSISTENCE_UNIT_RESOURCE);
        List<String> unitNames = scanResources(cl, PERSISTENCE_UNIT_RESOURCE);
        logger.info("Found " + unitNames.size() + " persistence units " + unitNames);
        String unitName = "";
        if (unitNames.isEmpty()) {
            throw new RuntimeException("No persistence unit found in " + 
                    "deployed application. " +
                    " A persistence unit is defined in " + PERSISTENCE_UNIT_RESOURCE +
                    " and must be available in current deployment unit");
        } else if (unitNames.size() > 1) {
            unitName = config.getInitParameter(PERSISTENCE_UNIT_NAME);
            if (unitName == null) {
                throw new RuntimeException(
                        "Found " + unitNames.size() + " persistence units " +
                        unitNames + " in deployed unit." +
                        " However no persistent unit name is specified in" +  
                        " deployment descriptor to distinguis a unit");
            } else if (!unitNames.contains(unitName)) {
                throw new RuntimeException(
                        "Found " + unitNames.size() + " persistence units " +
                        unitNames + " in deployed unit." +
                        " However persistent unit " + unitName + 
                        " specified in deployment descriptor does not" +
                        " match any of these units.");
            }
        } else {
            unitName = unitNames.get(0);
            logger.info("Found persistent unit " + unitName + " in deployment unit");
            try {
                logger.info("Resolving persistence unit " + unitName);
                EntityManagerFactory emf = Persistence.createEntityManagerFactory(unitName);
                logger.info(" persistence unit is resolved to "+ emf);
                getServletContext().setAttribute(JESTContext.PERSISTENCE_UNIT, emf);
            } catch (Exception ex) {
                throw new RuntimeException("Can not resolve persistence unit " + 
                        unitName, ex);
                
            } 
        }
    }
    
    /**
     * A GET request has following URL
     * <pre>
     *    /{type}/[id]/[field]  get the resource of specific type with
     *                          given identifier (if provided) and 
     *                          navigates to specific field (if provided) 
     *                          
     *    /                     get the structure of all types and their
     *                          attributes
     * </pre>
     */
    private static final String ROOT_PATH = "/";
    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) 
    throws ServletException {
          
        
        String path = request.getPathInfo();
        System.err.println("Received request GET " + path);
        JESTContext ctx = new DefaultJESTContext(
                getServletContext(), 
                (EntityManagerFactory)getServletContext().getAttribute(JESTContext.PERSISTENCE_UNIT),
                request, response);
        
        JESTCommand command = path == null || ROOT_PATH.equals(path) 
                ? new MetamodelCommand(ctx)
                : new FindCommand(ctx);
            
        try {
            System.err.println("executing " + command.getClass().getName());
            command.execute();
        } catch (Exception ex) {
            command.close();
        }
    }
    
    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response) 
    throws ServletException {
       
    }
    
    void printResourceVisbility(ClassLoader cl, String rsrc) {
        int i = 0;
        try {
            Enumeration<URL> urls = cl.getResources(rsrc);
            System.err.println(this + " looking for " + rsrc + " with " + cl);
            while (urls.hasMoreElements()) {
                i++;
                System.err.println(" found - " + urls.nextElement());
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        }
        System.err.println(" found  " + i + " " + rsrc);
        if (URLClassLoader.class.isInstance(cl)) {
            URL[] urls = URLClassLoader.class.cast(cl).getURLs();
            System.err.println("Classpath used :");
            for (int j = 0; j < urls.length; j++) {
                System.err.println("\t" + urls[j]);
            }
        }
    }
   
    /**
     * Scans all persistence units visible to given classloader
     * and collects unit names.
     * 
     * @param cl
     * @param rsrc
     * @return
     */
    List<String> scanResources(ClassLoader cl, String rsrc) {
        List<String> unitNames = new ArrayList<String>();
        try {
            List<URL> urls = toList(cl.getResources(rsrc));
            if (urls.isEmpty()) return unitNames;
            DocumentBuilder parser = DocumentBuilderFactory.newInstance()
                    .newDocumentBuilder();
            for (URL xml : urls) {
                Document doc = parser.parse(xml.toURI().toString());
                NodeList units = 
                doc.getDocumentElement().getElementsByTagName("persistence-unit");
                for (int i = 0; i < units.getLength(); i++) {
                    Element unit = (Element)units.item(i);
                    if (unit.hasAttribute("name")) {
                        unitNames.add(unit.getAttribute("name"));
                    }
                }
            }
            
        } catch (Exception ex) {
            throw new RuntimeException(ex);
        }
        return unitNames;
    }
    
    <X> List<X> toList(Enumeration<X> e) {
        List<X> list = new ArrayList<X>();
        while (e.hasMoreElements()) list.add(e.nextElement());
        return list;
    }
}
