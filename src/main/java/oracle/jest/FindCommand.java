package oracle.jest;

import java.io.IOException;

import javax.persistence.EntityManager;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.metamodel.EntityType;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

public class FindCommand extends JESTCommand {

    public FindCommand(JESTContext ctx) 
        throws ServletException {
        super(ctx);
    }


    @Override
    public void execute() throws ServletException,IOException {
        HttpServletRequest request = getContext().getRequest();
        String[] splats = request.getPathInfo().split("/");
        String entityTypeName = splats[0];
        EntityManager em = getContext().getPersistenceContext();
        EntityType<?> eType = resolveTypeByName(entityTypeName);
        Object pObject = null;
        if (splats.length > 1) {
            Object id = convert(splats[1], eType.getIdType().getJavaType());
            pObject = em.find(eType.getJavaType(), id);
            for (int i = 2; i < splats.length; i++) {
                pObject = Reflection.getValue(pObject, splats[i]);
                
            }
        } else {
            CriteriaQuery<?> q = em.getCriteriaBuilder().createQuery();
            q.from(eType);
            em.createQuery(q).getResultList();
        }


        HttpServletResponse response = getContext().getResponse();
        if (pObject == null) {
            response.setStatus(404);
        } else {
            ResponseTransformer transfomer = getContext().getResponseTransformer();
            
            transfomer.transform(pObject, response);
            response.setStatus(200);
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
