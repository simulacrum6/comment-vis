package awkwardrobots.data;

import awkwardrobots.util.Sentiment;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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

    public void addAttributes(List<Attribute> attributes) {
        if (this.attributes == null) {
            this.attributes = attributes;
        } else {
            this.attributes.addAll(attributes);
        }
    }

    public List<Attribute> getPositiveAttributes() {
        if (attributes == null)
            return new ArrayList<>();
        return attributes.stream()
                .filter(attribute -> attribute.getSentiment() == Sentiment.POSITIVE)
                .collect(Collectors.toList());
    }

    public List<Attribute> getNegativeAttributes() {
        if (attributes == null)
            return new ArrayList<>();
        return attributes.stream()
                .filter(attribute -> attribute.getSentiment() == Sentiment.NEGATIVE)
                .collect(Collectors.toList());
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
