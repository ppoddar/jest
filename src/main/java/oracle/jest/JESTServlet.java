package oracle.jest;

import java.net.URL;
import java.net.URLClassLoader;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;

import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;


@SuppressWarnings("serial")
public class JESTServlet extends HttpServlet {
    
    private static final String PERSISTENCE_UNIT_NAME = "persistence-unit";
    
    
    
    
    @Override
    public void init(ServletConfig config) throws ServletException {
        super.init(config);
        System.err.println(this + " Initializing ----------------------- ");
        ClassLoader cl = Thread.currentThread().getContextClassLoader();
        List<String> unitNames = scanResources(cl, "META-INF/persistence.xml");
        System.err.println(this + " found " + unitNames.size() + " persistence units "+unitNames);
        String unitName = "";
        if (unitNames.isEmpty()) {
            throw new RuntimeException("No persistence unit found in deployed "
                    + "application. A persistence unit is defined in a "
                    + "META-INF/persistence.xml file and must be visible to "
                    + "servlet at initialization");
        } else if (unitNames.size() > 1) {
            unitName = config.getInitParameter(PERSISTENCE_UNIT_NAME);
            if (unitName == null) {
                throw new RuntimeException("Found " + unitNames.size() 
                        + " persistence units " + unitNames 
                        + " in deployed application. "
                        + " However " + PERSISTENCE_UNIT_NAME + " property "
                        + " is not specified in deployment descriptor "
                        + " to disambiguate among these units");
            } else if (!unitNames.contains(unitName)) {
                throw new RuntimeException("Found " + unitNames.size() 
                + " persistence units " + unitNames 
                + " in deployed application. "
                + " However persistent unit name " + unitName 
                + " specified in deployment descriptor "
                + " does not match any of these units");
            }
        } else {
            unitName = unitNames.get(0);
            try {
                EntityManagerFactory emf = Persistence.createEntityManagerFactory(unitName);
                System.err.println(this + " persistence unit resolved to "+emf);
                getServletContext().setAttribute(JESTContext.PERSISTENCE_UNIT, emf);
            } catch (Exception ex) {
                throw new RuntimeException("Can not initialize persistence unit " + unitName, ex);
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
        JESTCommand command = ROOT_PATH.equals(path) 
                ? new MetamodelCommand(getServletContext(), request, response)
                : new FindCommand(getServletContext(), request, response);
            
        try {
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
