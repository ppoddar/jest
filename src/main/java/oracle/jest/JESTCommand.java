package oracle.jest;

import java.io.Closeable;
import java.io.IOException;
import java.util.Set;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.metamodel.EntityType;
import javax.persistence.metamodel.Metamodel;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * @author pinaki poddar
 *
 */
public abstract class JESTCommand implements Closeable, JESTContext {
    protected final ServletContext servletContext;
    protected final HttpServletRequest request;
    protected final HttpServletResponse response;

    public JESTCommand(ServletContext context, HttpServletRequest request, HttpServletResponse response) throws ServletException {
        this.servletContext = context;
        this.request = request;
        this.response = response;
        
        response.setContentType(MIMETYPE_JSON_API);
    }

    public abstract void execute() throws ServletException, IOException;

    public EntityManagerFactory getPersistenceUnit() {
        return getContextAttribute(PERSISTENCE_UNIT, 
                EntityManagerFactory.class);
    }

    public ResponseTransformer getResponseTransformer() {
        ResponseTransformer t = getContextAttribute(RESPONSE_TRANSFORMER, 
                ResponseTransformer.class);
        if (t == null) {
            t = selectTransformer();
            setContextAttribute(RESPONSE_TRANSFORMER, t);
        }
        return t;
    }

    public EntityManager getPersistenceContext() {
        EntityManager em = getContextAttribute(PERSISTENCE_CONTEXT, 
                EntityManager.class);
        if (em != null) return em;
        EntityManagerFactory emf = getPersistenceUnit();
        em = emf.createEntityManager();
        servletContext.setAttribute(PERSISTENCE_CONTEXT, em);
        return em;
    }

    public Metamodel getDomainModel() {
        return getPersistenceUnit().getMetamodel();
    }

    ResponseTransformer selectTransformer()  {
        return new JSONAPITransformer(this);
        /*
         * String accept = request.getHeader(HEADER_ACCEPT); if
         * (MIMETYPE_JSON_API.equals(accept)) { return new JSONAPITransformer();
         * } else { throw new ServletException("Unsupported " + HEADER_ACCEPT +
         * " header " + accept); }
         */
    }

    public void close() {

    }

    public EntityType<?> resolveTypeByName(String entityTypeName) {
        Set<EntityType<?>> types = getDomainModel().getEntities();
        for (EntityType<?> t : types) {
            if (t.getName().equals(entityTypeName)) {
                return t;
            }
        }
        return null;
    }
    
    private <T> T getContextAttribute(String key, Class<T> cls, boolean mustExist) {
        Object value = servletContext.getAttribute(key);
        if (value == null) {
            if (mustExist) {
                throw new RuntimeException(key + " not found in context");
            } else {
                return null;
            }
        }
        if (!cls.isInstance(value)) {
            throw new RuntimeException(value + " is not an instance of " + cls);
            
        }
        return cls.cast(value);
    }
    
    private <T> T getContextAttribute(String key, Class<T> cls) {
        return getContextAttribute(key, cls, false);
    }
    
    private void setContextAttribute(String key, Object value) {
        servletContext.setAttribute(key, value);
    }


}
