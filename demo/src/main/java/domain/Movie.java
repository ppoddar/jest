package domain;

import javax.persistence.Entity;
import javax.persistence.Id;

@Entity
public class Movie {
    @Id
    private String id;
    private String title;
    
    public Movie() {
        // TODO Auto-generated constructor stub
    }

}
