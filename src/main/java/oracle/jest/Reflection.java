package oracle.jest;

import java.lang.reflect.Method;

import javax.persistence.metamodel.Attribute;

public class Reflection {
    private static Class<?>[]  EMPTY_PARAMETER_TYPES = {};
    private static Object[]    EMPTY_ARG_TYPES = {};

    public Reflection() {
        // TODO Auto-generated constructor stub
    }
    
    public static Object getValue(Object source, String prop) {
        try {
            String methodName = "get" + Character.toUpperCase(prop.charAt(0))
                          + prop.substring(1);
            Method getter = source.getClass().getMethod(methodName, EMPTY_PARAMETER_TYPES);
            return getter.invoke(source, EMPTY_ARG_TYPES);
        } catch (Exception ex) {
            throw new RuntimeException(ex);
        }
        
    }
    
    Object getAssociation(Object source, Attribute<?, ?> attr) {
        if (!attr.isAssociation()) throw new IllegalArgumentException(
                attr + " is not an association");
        Object v = getValue(source, attr.getName());
        return v;
    }

}
