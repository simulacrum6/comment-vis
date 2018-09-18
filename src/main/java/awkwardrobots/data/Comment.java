package awkwardrobots.data;

import awkwardrobots.util.Sentiment;

public class Comment {
    private Sentiment sentiment;
    private String text;

    public Comment(Sentiment sentiment, String text) {
        this.sentiment = sentiment;
        this.text = text;
    }

    public Sentiment getSentiment() {
        return sentiment;
    }

    public void setSentiment(Sentiment sentiment) {
        this.sentiment = sentiment;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    @Override
    public String toString() {
        return "Comment{" +
                "sentiment=" + sentiment +
                ", text='" + text + '\'' +
                '}';
    }
}
