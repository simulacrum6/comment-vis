package awkwardrobots.data;

import java.util.List;

public class Attribute {
    private int mentions;
    private String name;
    private List<Comment> origin;

    public int getMentions() {
        return mentions;
    }

    public void setMentions(int mentions) {
        this.mentions = mentions;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<Comment> getOrigin() {
        return origin;
    }

    public void setOrigin(List<Comment> origin) {
        this.origin = origin;
    }
}
