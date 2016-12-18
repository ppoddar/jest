package domain;

import java.util.List;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;

@Entity
public class Movie {
    @Id
    private String id;
    private String title;
    
    @ManyToOne
    private Person director;
    
    @ManyToMany
    private List<Actor> actors;
    
    public Movie() {
    }

}
