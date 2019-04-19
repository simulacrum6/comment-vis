package awkwardrobots.data;

import java.util.ArrayList;
import java.util.List;

public class Attribute {
    private int mentions;
    private String name;
    private List<Comment> origin;
    private Sentiment sentiment;

    public Attribute(String name) {
        this.name = name;
        this.mentions = 1;
        this.origin = new ArrayList<>();
        this.sentiment = Sentiment.UNCLEAR;
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

    public List<Comment> getOrigin() {
        return origin;
    }

    public void setOrigin(List<Comment> origin) {
        this.origin = origin;
    }

    public Sentiment getSentiment() {
        return sentiment;
    }

    public void setSentiment(Sentiment sentiment) {
        this.sentiment = sentiment;
    }

    @Override
    public String toString() {
        return name;
    }
}
