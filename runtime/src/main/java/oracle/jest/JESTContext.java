package oracle.jest;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.metamodel.Metamodel;
import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

/**
 * A context associates an {@link ServletContext execution context} for
 * HTTP request-response with that of {@link EntityManagerFactory 
 * persistence operation}.
 * <p>
 * The context also provides a {@link ResponseTransformer protocol} to
 * transform HTTP response to {@link JSONObject JSON format}.
 *  
 * @author pinaki poddar
 *
 */
public interface JESTContext {
    public static final String PERSISTENCE_UNIT     = "emf";
    public static final String PERSISTENCE_CONTEXT  = "em";
    public static final String RESPONSE_TRANSFORMER = "response-transformer";
    
    public static final String HEADER_ACCEPT = "Accept";
    
    public static final String MIMETYPE_JSON_API = "application/vnd.api+json";
    
    /**
     * Gets the persistence unit associated with this context.
     * A persistence unit is always associated with this context.
     * 
     * @return
     */
    public EntityManagerFactory getPersistenceUnit();
    
    public ServletContext getServletContext();

    /**
     * Gets the persistence context.
     * Creates and associates the persistence context if it is not 
     * associated.
     *  
     * @return
     */
    public EntityManager getPersistenceContext();
    public Metamodel getPersistenceModel();

    
    public ResponseTransformer getResponseTransformer();
    
    public HttpServletRequest getRequest();
    public HttpServletResponse getResponse();

}
