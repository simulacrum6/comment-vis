package awkwardrobots.util;

import awkwardrobots.data.Comment;
import org.apache.commons.lang3.StringUtils;

import java.io.*;

public class MockCommentProvider {

    private static final int MAX_AMOUNT = 1000;
    private static final String TEST_DATA = "/testData.txt";

    /**
     * @param amount maximum is {@value #MAX_AMOUNT}
     * @return labelled sentences from yelp dataset ({@value #TEST_DATA}), unordered
     */
    public static Comment[] getComments(int amount) {
        if (amount < 1)
            throw new IllegalArgumentException("Amount must be a positive integer, but was " + amount);

        if (amount > MAX_AMOUNT)
            amount = MAX_AMOUNT;

        Comment[] comments = new Comment[amount];
        InputStream testDataStream = MockCommentProvider.class.getResourceAsStream(TEST_DATA);

        try (Reader reader = new InputStreamReader(testDataStream);
             BufferedReader bufferedReader = new BufferedReader(reader)) {
            int index = 0;
            String line;
            Sentiment sentiment = Sentiment.UNCLEAR;
            while (index < amount && StringUtils.isNotEmpty(line = bufferedReader.readLine())) {
                if (line.endsWith("1")) sentiment = Sentiment.POSITIVE;
                else if (line.endsWith("0")) sentiment = Sentiment.NEGATIVE;
                comments[index++] = new Comment(sentiment, line.substring(0, line.indexOf('\t')));
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        return comments;
    }

}
