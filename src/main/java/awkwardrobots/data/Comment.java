package awkwardrobots.data;

import awkwardrobots.util.Sentiment;

public class Comment {
    private Sentiment sentiment;
    private String text;

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
}
