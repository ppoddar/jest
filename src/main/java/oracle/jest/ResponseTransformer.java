package oracle.jest;

import org.json.JSONObject;

/**
 * Transforms an object to a {@link JSONObject}.
 * 
 * @author pinaki poddar
 *
 */
public interface ResponseTransformer {
    JSONObject transform(Object pObject, JESTContext ctx);
    JSONObject error(Throwable ex, JESTContext ctx);

}
