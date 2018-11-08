package awkwardrobots.util;

public enum Sentiment {
    POSITIVE, NEGATIVE, UNCLEAR;

    public static Sentiment fromString(String sentiment) {
        sentiment = sentiment.toUpperCase();

        if (sentiment.startsWith("POS"))
            return Sentiment.POSITIVE;

        if (sentiment.startsWith("NEG"))
            return Sentiment.NEGATIVE;

        return UNCLEAR;
    }
}
