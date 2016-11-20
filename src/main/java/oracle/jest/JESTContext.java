package oracle.jest;

import java.util.Set;

import javax.persistence.EntityManager;
import javax.persistence.metamodel.EntityType;
import javax.persistence.metamodel.Metamodel;
import javax.persistence.metamodel.Type.PersistenceType;
import javax.servlet.ServletContext;

/**
 * A context brings 
 * <ul>
 *   <li>Servlet Context
 *   <li>Persistence Contxet
 *   <li>Response Transformer
 *  </ul>
 *  
 * @author pinaki poddar
 *
 */
public class JESTContext {
    private final EntityManager persistenceContext;
    private Metamodel persistenceDomainModel;
    private final ServletContext servletContext;
    private final ResponseTransformer responseTransformer;
    
    public JESTContext(ServletContext ctx, EntityManager em, ResponseTransformer rp) {
        persistenceContext = em;
        servletContext = ctx;
        responseTransformer = rp;
    }
    
    public ServletContext getServletContext() {
        return servletContext;
    }
    
    public EntityManager getPersistenceContext() {
        return persistenceContext;
    }
    
    public ResponseTransformer getResponseTransformer() {
        return responseTransformer;
    }
    
    public Metamodel getDomainModel() {
        if (persistenceDomainModel == null) {
            persistenceDomainModel = getPersistenceContext()
                    .getEntityManagerFactory()
                    .getMetamodel();
        }
        return persistenceDomainModel;
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
}
