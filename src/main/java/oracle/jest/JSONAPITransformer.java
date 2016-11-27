package oracle.jest;

import javax.persistence.metamodel.Attribute;
import javax.persistence.metamodel.EntityType;
import javax.persistence.metamodel.ManagedType;
import javax.persistence.metamodel.Metamodel;

import org.json.JSONObject;

public class JSONAPITransformer implements ResponseTransformer {
    private static final String ATTR_TYPE_NAME = "name";
    private static final String ATTR_DATA = "data";
    private static final String ATTR_ERRORS = "errors";
    private static final String ATTR_META = "meta";
    private static final String ATTR_RESOURCE_ID = "id";
    private static final String ATTR_RESOURCE_TYPE = "type";
    private static final String ATTR_RESOURCE_ATTRIBUTES = "attributes";
    private static final String ATTR_RESOURCE_RELATIONSHIPS = "relationships";
    private static final String ATTR_RESOURCE_LINKS = "links";
    private static final String ATTR_RESOURCE_META = "meta";
    
    private final JESTContext ctx;
    
    public JSONAPITransformer(JESTContext ctx) {
        this.ctx = ctx;
    }
    
    JSONObject transformModel(Metamodel model) {
        JSONObject result = new JSONObject();
        for (EntityType<?> t : model.getEntities()) {
            result.accumulate("types", transformType(t));
        }
        return result;
    }
    
    JSONObject transformType(EntityType<?> type) {
        JSONObject result = new JSONObject();
        result.put(ATTR_TYPE_NAME, type.getName());
        return result;
    }
    
    @Override
    public JSONObject transform(Object pObject) {
        if (Metamodel.class.isInstance(pObject)) 
            return transformModel(Metamodel.class.cast(pObject));
        if (EntityType.class.isInstance(pObject)) 
            return transformType(EntityType.class.cast(pObject));
        
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
    public JSONObject error(Throwable ex) {
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
