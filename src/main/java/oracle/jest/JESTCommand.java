package oracle.jest;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public interface JESTCommand {
    public void execute(HttpServletRequest request, 
            HttpServletResponse response, JESTContext ctx) throws ServletException,IOException;

}
