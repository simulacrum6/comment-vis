package awkwardrobots.data;

public class Attribute {
    private int mentions;
    private String name;
    private Comment origin;

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

    public Comment getOrigin() {
        return origin;
    }

    public void setOrigin(Comment origin) {
        this.origin = origin;
    }
}
