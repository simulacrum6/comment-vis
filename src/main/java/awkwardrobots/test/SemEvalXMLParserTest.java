package awkwardrobots.test;

import awkwardrobots.data.Comment;
import awkwardrobots.io.CommentParser;
import awkwardrobots.io.SemEvalXMLParser;
import awkwardrobots.util.Sentiment;
import org.junit.Before;
import org.junit.Test;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

public class SemEvalXMLParserTest {
    private CommentParser parser;
    private FileInputStream in;

    @Before
    public void init() throws FileNotFoundException {
        parser = new SemEvalXMLParser();
        in = new FileInputStream("src/main/resources/data/brun2018/data/semeval_format/foursquare_gold.xml");
    }

    @Test
    public void testXMLParsing() throws IOException {
        List<Comment> comments = parser.parse(in);
        assertNotNull(comments);
    }


    @Test
    public void testCommentIntegrity() throws IOException {
        List<Comment> comments = parser.parse(in);
        Comment gold = new Comment(Sentiment.NEGATIVE, "2 words -filter coffee :-)");
        assertEquals(gold, comments.get(0));
    }
}
