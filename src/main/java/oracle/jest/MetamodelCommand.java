package oracle.jest;

import java.io.IOException;

import javax.persistence.metamodel.Metamodel;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

public class MetamodelCommand extends JESTCommand {
    public MetamodelCommand(JESTContext ctx)
     throws ServletException {
        super(ctx);
        System.err.println("Created " + this);
    }

    @Override
    public void execute() throws ServletException, IOException {
        System.err.println(this + ".execute() ");
        Metamodel model = getDomainModel();
        ResponseTransformer transformer = getContext().getResponseTransformer();
        
        HttpServletResponse response = getContext().getResponse();
        
        try {
            transformer.transform(model, response);
        } catch (Exception ex) {
            ex.printStackTrace();
        }

        
        response.setStatus(200);
    }
    
    

}
