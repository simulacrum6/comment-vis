package awkwardrobots.util;

import awkwardrobots.data.Comment;
import org.apache.commons.lang3.StringUtils;

import java.io.*;

public class MockCommentProvider {

    /**
     * @param amount maximum is 1000
     * @return labelled sentences from yelp dataset (testdata.txt), unordered
     */
    public static Comment[] getComments(int amount) {
        Comment[] comments = new Comment[amount];
        InputStream testDataStream = MockCommentProvider.class.getResourceAsStream("/testData.txt");

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
