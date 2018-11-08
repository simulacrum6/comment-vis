package awkwardrobots.data;

import awkwardrobots.util.Sentiment;

import java.util.Objects;

public class Comment {
    private Sentiment sentiment;
    private String text;

    public Comment() {
    }

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
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Comment comment = (Comment) o;
        return sentiment == comment.sentiment &&
                Objects.equals(text, comment.text);
    }

    @Override
    public int hashCode() {
        return Objects.hash(sentiment, text);
    }

    @Override
    public String toString() {
        return "Comment{" +
                "sentiment=" + sentiment +
                ", text='" + text + '\'' +
                '}';
    }
}
