package awkwardrobots.util;

import awkwardrobots.data.Comment;
import org.apache.commons.lang3.StringUtils;

import java.io.*;
import java.util.ArrayList;
import java.util.List;

public class TXTCommentParser implements CommentParser {

    @Override
    public List<Comment> parse(InputStream inputStream) throws IOException {
        ArrayList<Comment> comments = new ArrayList<>();
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
