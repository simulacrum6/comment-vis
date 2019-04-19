package awkwardrobots.scripts;

import awkwardrobots.data.Comment;
import awkwardrobots.io.CommentWriter;
import awkwardrobots.io.DatasetLoader;

import java.util.List;

/**
 * Converts Lecture Evaluation PDFs to a csv of comments with sentiments.
 */
public class WriteEvaluations2Comments {
    public static void main(String[] args) throws Exception {
        String root = DatasetLoader.ROOT_PATH;
        String dataset = "lecture_evaluations";
        String out = root + dataset + "/_all.comment.csv";

        List<Comment> comments = DatasetLoader.loadComments(dataset, null);
        CommentWriter writer = new CommentWriter();

        writer.write(comments, out);
    }
}
