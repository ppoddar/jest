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
public abstract class JESTCommand implements Closeable {
    protected final JESTContext context;

    public JESTCommand(JESTContext context) throws ServletException {
        this.context = context;
    }
    
    public JESTContext getContext() {
        return context;
    }

    public abstract void execute() throws ServletException, IOException;

    public Metamodel getDomainModel() {
        return context.getPersistenceUnit().getMetamodel();
    }

    ResponseTransformer selectTransformer()  {
        return new JSONAPITransformer(this.context);
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
        Object value = context.getServletContext().getAttribute(key);
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
        context.getServletContext().setAttribute(key, value);
    }


}
