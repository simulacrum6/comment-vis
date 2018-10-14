package awkwardrobots.util;

import awkwardrobots.data.Comment;
import awkwardrobots.data.CommentList;
import org.apache.commons.lang3.StringUtils;

import java.io.*;

public class TXTCommentParser implements CommentParser {

    @Override
    public CommentList parse(InputStream inputStream) throws IOException {
        CommentList comments = new CommentList();
        try (Reader reader = new InputStreamReader(inputStream);
             BufferedReader bufferedReader = new BufferedReader(reader)) {
            String line;
            Sentiment sentiment = Sentiment.UNCLEAR;
            while (StringUtils.isNotEmpty(line = bufferedReader.readLine())) {
                if (line.endsWith("1")) sentiment = Sentiment.POSITIVE;
                else if (line.endsWith("0")) sentiment = Sentiment.NEGATIVE;
                comments.add(new Comment(sentiment, line.substring(0, line.indexOf('\t'))));
            }
            return comments;
        }
    }
}
