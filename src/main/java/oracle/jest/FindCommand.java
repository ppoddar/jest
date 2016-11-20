package oracle.jest;

import java.io.IOException;
import java.util.Set;

import javax.persistence.EntityManager;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.metamodel.EntityType;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

public class FindCommand implements JESTCommand {

    @Override
    public void execute(HttpServletRequest request, HttpServletResponse response, 
            JESTContext ctx) throws ServletException,IOException {
        String[] splats = request.getPathInfo().split("/");
        String entityTypeName = splats[0];
        EntityManager em = ctx.getPersistenceContext();
        EntityType<?> cls = ctx.resolveTypeByName(entityTypeName);
        Object pObject = null;
        if (splats.length > 1) {
            Object id = convert(splats[1], cls.getIdType().getJavaType());
            pObject = em.find(cls.getJavaType(), id);
            for (int i = 2; i < splats.length; i++) {
                pObject = Reflection.getValue(pObject, splats[i]);
                
            }
        } else {
            CriteriaQuery<?> q = em.getCriteriaBuilder().createQuery();
            q.from(cls);
            em.createQuery(q).getResultList();
        }


        if (pObject == null) {
            response.setStatus(404);
        } else {
            ResponseTransformer transfomer = ctx.getResponseTransformer();
            JSONObject json = transfomer.transform(pObject, ctx);
            json.write(response.getWriter());
            
        }

    }


    Object convert(String data, Class<?> targetType) {
        if (targetType == String.class) {
            return data;
        } else if (targetType == int.class || targetType == Integer.class) {
            return Integer.parseInt(data);
        } else if (targetType == double.class || targetType == Double.class) {
            return Double.parseDouble(data);
        }
        return data;
    }
    
    

}
