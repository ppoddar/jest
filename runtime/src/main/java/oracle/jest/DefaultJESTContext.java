package oracle.jest;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.metamodel.Metamodel;
import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

class DefaultJESTContext implements JESTContext {
    private final ServletContext servletCtx;
    private final EntityManagerFactory persistenceUnit;
    private  EntityManager persistenceCtx;
    private final HttpServletRequest request;
    private final HttpServletResponse response;
    
    private ResponseTransformer responseTransfomer;
    
    public DefaultJESTContext(ServletContext servletCtx, 
            EntityManagerFactory persistenceUnit, 
            HttpServletRequest request,
            HttpServletResponse response) {
        super();
        this.servletCtx = servletCtx;
        this.persistenceUnit = persistenceUnit;
        this.request = request;
        this.response = response;
    }

    @Override
    public ServletContext getServletContext() {
        return servletCtx;
    }

    @Override
    public EntityManagerFactory getPersistenceUnit() {
        return persistenceUnit;
    }

    @Override
    public EntityManager getPersistenceContext() {
        if (persistenceCtx == null) {
            persistenceCtx = persistenceUnit.createEntityManager();;
        }
        return persistenceCtx;
    }

    @Override
    public ResponseTransformer getResponseTransformer() {
        if (responseTransfomer == null) {
            responseTransfomer = new JSONAPITransformer(this);
        }
        return responseTransfomer;
    }

    @Override
    public HttpServletRequest getRequest() {
        return request;
    }

    @Override
    public HttpServletResponse getResponse() {
        return response;
    }

    @Override
    public Metamodel getPersistenceModel() {
        return persistenceUnit.getMetamodel();
    }

}
