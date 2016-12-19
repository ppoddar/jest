package oracle.jest;

import javax.servlet.http.HttpServletResponse;

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
     * Transforms the given object to a representation
     * and write to given response.
     * 
     * @param pObject can be a persistence instance or type 
     * or an entire data model
     */
    void transform(Object pObject, HttpServletResponse response);
    

}
