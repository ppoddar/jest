package oracle.jest;

import javax.persistence.metamodel.Attribute;
import javax.persistence.metamodel.CollectionAttribute;
import javax.persistence.metamodel.EntityType;
import javax.persistence.metamodel.ManagedType;
import javax.persistence.metamodel.Metamodel;
import javax.persistence.metamodel.PluralAttribute;

import org.json.JSONArray;
import org.json.JSONObject;

public class MetamodelTransformer  {
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
    
    private static final String ATTR_ENTITIES = "types";
    private static final String ATTR_LINKS = "links";
    private static final String ATTR_ATTRIBUTE_NAME = "name";
    private static final String ATTR_ATTRIBUTE_TYPE = "type";

    private static final String ATTR_LINK_TYPE   = "type";
    private static final String ATTR_LINK_SOURCE = "source";
    private static final String ATTR_LINK_TARGET = "target";

    private final Metamodel model;
    private final JSONObject json;
    
    public MetamodelTransformer(Metamodel model) {
        this.model = model;
        this.json = new JSONObject();
        
        System.err.println("Created " + this);
    }
    
    JSONObject transformModel() {
        System.err.println(this + ".transformModel() " + 
    model.getManagedTypes().size() + " types");
        json.put(ATTR_ENTITIES, new JSONArray());
        json.put(ATTR_LINKS,    new JSONArray());
        for (EntityType<?> t : model.getEntities()) {
            json.accumulate(ATTR_ENTITIES, transformType(t));
        }
        System.err.println("created Metamodel json\r\n" + json.toString(4));
        return json;
    }
    
    JSONObject transformType(EntityType<?> type) {
        System.err.println(this + ".transformType() " + type.getName());
        JSONObject result = new JSONObject();
        result.put(ATTR_TYPE_NAME, type.getName());
        result.put(ATTR_RESOURCE_ATTRIBUTES, new JSONArray());
        for (Attribute<?, ?> attr : type.getAttributes()) {
            result.accumulate(ATTR_RESOURCE_ATTRIBUTES, 
                    transformAttribute(attr));
            
            ManagedType<?> targetType = getTargetType(attr);
            if (targetType != null) {
                JSONObject relation = newLink("relation",
                        getTypeName(attr.getDeclaringType()),
                        getTypeName(targetType));
                json.accumulate(ATTR_LINKS, relation);
            }
        }
        if (type.getSupertype() != null) {
            // inheritance relation
            ManagedType<?> superType = getManagedTypeForJavaClass(
                    type.getSupertype().getJavaType());
            if (superType != null) {
                JSONObject inheritance = newLink("inheritance",
                    getTypeName(type), 
                    getTypeName(superType));
                json.accumulate(ATTR_LINKS, inheritance);
            }
        }
        return result;
    }

    
        
    
    JSONObject transformAttribute(Attribute<?, ?> attr) {
        System.err.println(this + ".transformAttribute() " + attr.getName());
        JSONObject result = new JSONObject();
        result.put(ATTR_ATTRIBUTE_NAME, attr.getName());
        result.put(ATTR_ATTRIBUTE_TYPE, attr.getJavaType().getSimpleName());
        return result;
    }
    

    
    JSONObject newLink(String category, String source, String target) {
        JSONObject link = new JSONObject();
        link.put(ATTR_LINK_SOURCE, source);
        link.put(ATTR_LINK_TARGET, target);
        link.put(ATTR_LINK_TYPE, category);
        
        return link;
        
    }
    
    
    /**
     * gets target type of given attribute.
     * @return
     */
    ManagedType<?> getTargetType(Attribute<?, ?> attr) {
        Class<?> cls = attr.getJavaType();
        if (attr.isCollection()) {
            cls = PluralAttribute.class.cast(attr)
                    .getElementType()
                    .getJavaType();
        }
        return getManagedTypeForJavaClass(cls);
    }
    
    ManagedType<?> getManagedTypeForJavaClass(Class<?> cls) {
        for (ManagedType<?> t : model.getManagedTypes()) {
            if (t.getJavaType() == cls) return t;
        }
        return null;
    }
    
    String getTypeName(ManagedType<?> type) {
        switch (type.getPersistenceType()) {
        case ENTITY:
            return ((EntityType<?>)type).getName();
        case EMBEDDABLE:
        case MAPPED_SUPERCLASS:
            return type.getJavaType().getSimpleName();
        default:
            return null;
        }
    }

}
