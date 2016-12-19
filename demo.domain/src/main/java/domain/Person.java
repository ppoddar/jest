package domain;

import javax.persistence.Entity;
import javax.persistence.Id;

@Entity
public class Person {
    @Id
    private String id;
    private String name;

    public Person() {
        // TODO Auto-generated constructor stub
    }

}
