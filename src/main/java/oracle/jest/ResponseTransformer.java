package oracle.jest;

import org.json.JSONObject;

/**
 * Transforms a persistent object to a {@link JSONObject JSON} 
 * in {@link JESTContext}.
 * 
 * @author pinaki poddar
 *
 */
public interface ResponseTransformer {
    /**
     * Transforms the given object to a JSON representation.
     * 
     * @param pObject can be a persistence instance or type 
     * @return
     */
    JSONObject transform(Object pObject);
    JSONObject error(Throwable ex);

}
