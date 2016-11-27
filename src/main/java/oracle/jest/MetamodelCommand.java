package oracle.jest;

import java.io.IOException;

import javax.persistence.metamodel.Metamodel;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

public class MetamodelCommand extends JESTCommand {
    public MetamodelCommand(ServletContext ctx, HttpServletRequest request, HttpServletResponse response) 
     throws ServletException {
        super(ctx, request, response);
    }

    @Override
    public void execute() throws ServletException, IOException {
        Metamodel model = getDomainModel();
        ResponseTransformer transformer = getResponseTransformer();
        JSONObject result = transformer.transform(model);
        result.write(response.getWriter());
        
        response.setStatus(200);
    }
    
    

}
