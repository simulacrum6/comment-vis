package awkwardrobots.test;

import awkwardrobots.data.Comment;
import awkwardrobots.io.DatasetLoader;
import org.junit.Test;

import java.io.File;
import java.io.IOException;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class DatasetLoaderTest {

    private String kotzias = "kotzias2015";
    private String yelp = "yelp_labelled";
    private String evaluations = "lecture_evaluations";

    @Test
    public void testFindFiles() {
        File[] files;

        files = DatasetLoader.findFiles(kotzias, null);
        assertEquals(3, files.length);

        files = DatasetLoader.findFiles(kotzias, yelp);
        assertEquals(1, files.length);

        files = DatasetLoader.findFiles(evaluations, null);
        assertTrue(files.length > 1);
    }

    @Test
    public void testLoadLines() throws IOException {
        List<String> lines;

        lines = DatasetLoader.loadLines(kotzias, null);
        assertTrue(!lines.isEmpty());

        assertTrue(lines.size() > DatasetLoader.loadLines(kotzias, yelp).size());
    }

    @Test
    public void testLoadComments() throws IOException {
        List<Comment> comments;

        comments = DatasetLoader.loadComments(kotzias, null);
        assertTrue(!comments.isEmpty());

        assertTrue(comments.size() > DatasetLoader.loadLines(kotzias, yelp).size());

        comments = DatasetLoader.loadComments(evaluations, null);
        assertTrue(!comments.isEmpty());
    }
}
