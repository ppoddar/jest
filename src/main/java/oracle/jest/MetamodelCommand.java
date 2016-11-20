package oracle.jest;

import java.io.IOException;

import javax.persistence.metamodel.EntityType;
import javax.persistence.metamodel.Metamodel;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

public class MetamodelCommand implements JESTCommand {

    public MetamodelCommand() {
        // TODO Auto-generated constructor stub
    }

    @Override
    public void execute(HttpServletRequest request, HttpServletResponse response, JESTContext ctx)
            throws ServletException, IOException {
        
        Metamodel model = ctx.getDomainModel();
        JSONObject result = new JSONObject();
        for (EntityType<?> t : model.getEntities()) {
            result.accumulate("types", t.getName());
        }
        response.setStatus(200);
        result.write(response.getWriter());
    }

}
