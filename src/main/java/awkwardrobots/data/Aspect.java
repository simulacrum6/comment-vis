package awkwardrobots.data;

import java.util.List;

public class Aspect {
    private List<Attribute> attributes;
    private int mentions;
    private String name;

    public List<Attribute> getAttributes() {
        return attributes;
    }

    public void setAttributes(List<Attribute> attributes) {
        this.attributes = attributes;
    }

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

    @Override
    public String toString() {
        return "Aspect{" +
                "attributes=" + attributes +
                ", mentions=" + mentions +
                ", name='" + name + '\'' +
                "}\n";
    }
}
