package oracle.jest;

import java.io.IOException;
import java.io.PrintWriter;

import javax.persistence.metamodel.Attribute;
import javax.persistence.metamodel.Attribute.PersistentAttributeType;
import javax.persistence.metamodel.Bindable.BindableType;
import javax.persistence.metamodel.CollectionAttribute;
import javax.persistence.metamodel.EmbeddableType;
import javax.persistence.metamodel.EntityType;
import javax.persistence.metamodel.ManagedType;
import javax.persistence.metamodel.MappedSuperclassType;
import javax.persistence.metamodel.Metamodel;
import javax.persistence.metamodel.PluralAttribute;
import javax.persistence.metamodel.SingularAttribute;
import javax.persistence.metamodel.Type.PersistenceType;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;

public class JSONAPITransformer implements ResponseTransformer {
    private final JESTContext ctx;
    
    public JSONAPITransformer(JESTContext ctx) {
        this.ctx = ctx;
    }
    
    @Override
    public void transform(Object pObject, HttpServletResponse response) {
        System.err.println(this + ".transform() " + pObject.getClass());

        JSONObject json = null;
        if (Metamodel.class.isInstance(pObject)) {
            Metamodel model = Metamodel.class.cast(pObject);
            json = new MetamodelTransformer(model).transformModel();
        } else if (EntityType.class.isInstance(pObject)) {
            json = new MetamodelTransformer(ctx.getPersistenceModel())
                    .transformType(EntityType.class.cast(pObject));
        } else {
            throw new UnsupportedOperationException();
        }
        PrintWriter writer = null;
        try {
            writer = response.getWriter();
        } catch (IOException ex) {
            throw new RuntimeException(ex);
        }
        try {
            json.write(writer);
        } catch (Exception ex) {
            ex.printStackTrace(writer);
        }
    }

}
