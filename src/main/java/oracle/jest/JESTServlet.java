package oracle.jest;

import java.net.URL;
import java.net.URLClassLoader;
import java.util.Enumeration;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@SuppressWarnings("serial")
public class JESTServlet extends HttpServlet {
    
    public static final String PERSISTENCE_UNIT_NAME = "persistence-unit";
    private static final String PERSISTENCE_UNIT = "emf";
    
    public static final String HEADER_ACCEPT = "Accept";
    
    public static final String MIMETYPE_JSON_API = "application/vnd.api+json";
    
    
    @Override
    public void init(ServletConfig config) throws ServletException {
        super.init(config);
        System.err.println(this + " Initialiing ----------------------- ");
        //printResourceVisbility(Thread.currentThread().getContextClassLoader(), "META-INF/persistence.xml");
        //printResourceVisbility(Thread.currentThread().getContextClassLoader().getParent(), "META-INF/persistence.xml");
        String unitName = config.getInitParameter(PERSISTENCE_UNIT_NAME);
        System.err.println(this + " persistence unit="+unitName);
        if (unitName == null) {
            throw new RuntimeException("Missing initial parameter " + PERSISTENCE_UNIT_NAME);
        } else {
            try {
                EntityManagerFactory emf = Persistence.createEntityManagerFactory(unitName);
                System.err.println(this + " persistence unit resolved to "+emf);
                getServletContext().setAttribute(PERSISTENCE_UNIT, emf);
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
        
        System.err.println("JESTServlet request path info " + path);
        
        JESTCommand command = ROOT_PATH.equals(path) ? new MetamodelCommand()
                : new FindCommand();
            
        
        EntityManagerFactory emf = (EntityManagerFactory)
                getServletContext().getAttribute(PERSISTENCE_UNIT);
        EntityManager em = emf.createEntityManager();
        ResponseTransformer transformer = selectTransformer(request);
        JESTContext ctx = new JESTContext(
                getServletContext(), em, transformer);
        try {
            command.execute(request, response, ctx);
        } catch (Exception ex) {
            em.close();
        }
    }
    
    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response) 
    throws ServletException {
        
    }
    
    ResponseTransformer selectTransformer(HttpServletRequest request) throws ServletException {
        return new JSONAPITransformer();
/*        String accept = request.getHeader(HEADER_ACCEPT);
        if (MIMETYPE_JSON_API.equals(accept)) {
            return new JSONAPITransformer();
        } else {
            throw new ServletException("Unsupported " + HEADER_ACCEPT 
                    + " header " + accept);
        }
        */
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
}
