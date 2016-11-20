package oracle.jest;

import java.lang.reflect.Method;
import java.util.Set;

import javax.persistence.metamodel.Attribute;
import javax.persistence.metamodel.ManagedType;
import javax.persistence.metamodel.Metamodel;

import org.json.JSONObject;

public class JSONAPITransformer implements ResponseTransformer {
    private static final String ATTR_DATA = "data";
    private static final String ATTR_ERRORS = "errors";
    private static final String ATTR_META = "meta";
    private static final String ATTR_RESOURCE_ID = "id";
    private static final String ATTR_RESOURCE_TYPE = "type";
    private static final String ATTR_RESOURCE_ATTRIBUTES = "attributes";
    private static final String ATTR_RESOURCE_RELATIONSHIPS = "relationships";
    private static final String ATTR_RESOURCE_LINKS = "links";
    private static final String ATTR_RESOURCE_META = "meta";
    
    
    public JSONAPITransformer() {
        // TODO Auto-generated constructor stub
    }

    @Override
    public JSONObject transform(Object pObject, JESTContext ctx) {
        JSONObject result = new JSONObject();
        result.put(ATTR_DATA, new JSONObject());
        result.put(ATTR_ERRORS, new JSONObject());
        result.put(ATTR_META, new JSONObject());
        
        Metamodel model = 
        ctx.getPersistenceContext().getEntityManagerFactory().getMetamodel();
        ManagedType<?> type = 
        model.managedType(pObject.getClass());
        for (Attribute<?, ?> attr : type.getAttributes()) {
            attr.getName();
            if (attr.isAssociation()) {
                
            } else if (attr.isCollection()) {
                
            } else {
                String prop = attr.getName();
                result.getJSONObject(ATTR_DATA)
                      .getJSONObject(ATTR_RESOURCE_ATTRIBUTES)
                      .put(prop, Reflection.getValue(pObject, prop));
            }
        }
        
        return result;
        
    }

    @Override
    public JSONObject error(Throwable ex, JESTContext ctx) {
        throw new AbstractMethodError();
    }
    
    
    JSONObject newResourceObject(String id, String type) {
        JSONObject resource = new JSONObject();
        resource.put(ATTR_RESOURCE_ID, id);
        resource.put(ATTR_RESOURCE_TYPE, type);
        
        resource.put(ATTR_RESOURCE_ATTRIBUTES, new JSONObject());
        resource.put(ATTR_RESOURCE_RELATIONSHIPS, new JSONObject());
        resource.put(ATTR_RESOURCE_LINKS, new JSONObject());
        resource.put(ATTR_RESOURCE_META, new JSONObject());
        
        return resource;
        
    }
    
    JSONObject newResourceIdentiferObject(String id, String type) {
        JSONObject resource = new JSONObject();
        resource.put(ATTR_RESOURCE_ID, id);
        resource.put(ATTR_RESOURCE_TYPE, type);
        
        return resource;
        
    }

    
    JSONObject newLinkObject(String id, String type) {
        JSONObject resource = new JSONObject();
        resource.put(ATTR_RESOURCE_ID, id);
        resource.put(ATTR_RESOURCE_TYPE, type);
        
        return resource;
        
    }

}
