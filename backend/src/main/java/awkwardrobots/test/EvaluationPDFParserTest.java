package awkwardrobots.test;

import awkwardrobots.data.Comment;
import awkwardrobots.io.CommentParser;
import awkwardrobots.io.EvaluationPDFParser;
import org.junit.Before;
import org.junit.Test;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

public class EvaluationPDFParserTest {
    private CommentParser parser;
    private FileInputStream in;
    private List<Comment> comments;

    @Before
    public void init() throws FileNotFoundException {
        parser = new EvaluationPDFParser();
        in = new FileInputStream("src/main/resources/data/lecture_evaluations/sprachtechnologie.pdf");
    }

    @Test
    public void testPDFParsing() throws IOException {
        List<Comment> comments = parser.parse(in);
        assertNotNull(comments);
    }

    @Test
    public void testCommentExtraction() throws IOException {
        List<Comment> comments = parser.parse(in);
        Comment first = comments.get(0);
        assertEquals("Keine Angabe", first.getText());

        Comment last = comments.get(comments.size() - 1);
        assertEquals("weniger programmieren", last.getText());
    }
}
