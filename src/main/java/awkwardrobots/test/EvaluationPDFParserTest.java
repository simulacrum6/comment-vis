package awkwardrobots.test;

import awkwardrobots.data.Comment;
import awkwardrobots.util.CommentParser;
import awkwardrobots.util.EvaluationPDFParser;
import org.junit.Test;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.util.List;

import static org.junit.Assert.assertNotNull;

public class EvaluationPDFParserTest {

    @Test
    public void testPDFParsing() throws FileNotFoundException {
        CommentParser parser = new EvaluationPDFParser();
        FileInputStream in = new FileInputStream("src/main/resources/evaluations/sprachtechnologie.pdf");
        List<Comment> comments = parser.parse(in);
        assertNotNull(comments);

        System.out.println(comments);
    }
}
