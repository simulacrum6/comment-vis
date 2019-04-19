package awkwardrobots.data;

public enum Sentiment {
    POSITIVE, NEGATIVE, UNCLEAR;

    public static Sentiment fromString(String sentiment) {
        sentiment = sentiment.toUpperCase();

        if (sentiment.startsWith("POS") || sentiment.equals("1"))
            return Sentiment.POSITIVE;

        if (sentiment.startsWith("NEG") || sentiment.equals("0"))
            return Sentiment.NEGATIVE;

        return UNCLEAR;
    }
}
