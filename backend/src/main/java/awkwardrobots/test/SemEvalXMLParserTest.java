package awkwardrobots.test;

import awkwardrobots.data.Comment;
import awkwardrobots.data.Facet;
import awkwardrobots.data.Opinion;
import awkwardrobots.data.Sentiment;
import awkwardrobots.io.CommentParser;
import awkwardrobots.io.SemEvalXMLParser;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;

public class SemEvalXMLParserTest {
    private SemEvalXMLParser parser;
    private FileInputStream in;

    @Before
    public void init() throws FileNotFoundException {
        parser = new SemEvalXMLParser();
        in = new FileInputStream("src/main/resources/data/brun2018/data/semeval_format/foursquare_gold.xml");
    }

    @After
    public void tearDown() throws IOException {
    	in.close();
    }
    
    @Test
    public void testCommentParsing() throws IOException {
        List<Comment> comments = parser.parseComments(in);
        assertNotNull(comments);
    	assertFalse(comments.isEmpty());
    }
    
    @Test
    public void testOpinionParsing() throws IOException {
        List<Opinion> opinions = parser.parseOpinions(in);
        assertNotNull(opinions);
    	assertFalse(opinions.isEmpty());

    }


    @Test
    public void testCommentIntegrity() throws IOException {
    	Comment goldComment = new Comment(Sentiment.NEGATIVE, "2 words -filter coffee :-)");
    	List<Comment> comments = parser.parseComments(in);
        assertEquals(goldComment, comments.get(0));
    }
    
    @Test
    public void testOpinionIntegrity() throws IOException {        
        Opinion goldOpinion = new Opinion();
        goldOpinion.setComment("2 words -filter coffee :-)");
        goldOpinion.setAspect(new Facet("coffee", "DRINKS"));
        goldOpinion.setAttribute(new Facet("QUALITY"));
        goldOpinion.setSentiment(Sentiment.NEGATIVE);

        List<Opinion> opinions = parser.parseOpinions(in);
        assertEquals(goldOpinion, opinions.get(0));
    }

}
