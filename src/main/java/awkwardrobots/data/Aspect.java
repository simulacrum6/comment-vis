package awkwardrobots.data;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

// TODO: Decouple Aspects and Attributes?
public class Aspect {
    private List<Attribute> attributes;
    private int mentions;
    private String name;

    /**
     * Creates a new Aspect by combining the given Aspects.
     * <p>
     * The name of the combined Aspect is equal to the first Aspect passed to the method,
     * Attributes and mentions are concatenated.
     */
    public static Aspect combine(Aspect... aspects) {
        Aspect combined = Aspect.fromAspect(aspects[0]);

        // add all others
        for (int i = 1; i < aspects.length; i++) {
            // skip if null
            if (aspects[i] == null) {
                continue;
            }

            Aspect aspect = aspects[i];

            combined.addAttributes(aspect.getAttributes());
            combined.addMentions(aspect.getMentions());
        }

        return combined;
    }

    /**
     * Creates a new Aspect by combining the given Aspects.
     * <p>
     * The name of the combined Aspect is equal to the first Aspect in the given Collection,
     * Attributes and mentions are concatenated.
     */
    public static Aspect combine(Collection<Aspect> aspects) {
        Aspect[] array = new Aspect[aspects.size()];
        return Aspect.combine(aspects.toArray(array));
    }

    /**
     * Creates a new Aspect by copying all properties from the given Aspect.
     */
    public static Aspect fromAspect(Aspect aspect) {
        Aspect copy = new Aspect();
        copy.setName(aspect.getName());
        copy.addAttributes(aspect.getAttributes());
        copy.setMentions(aspect.getMentions());
        return copy;
    }

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

    public void addMentions(int mentions) {
        this.mentions += mentions;
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
