package awkwardrobots.scripts;

import awkwardrobots.data.Comment;
import awkwardrobots.io.CommentWriter;
import awkwardrobots.io.DatasetLoader;

import java.util.List;

/**
 * Converts reviews (yelp, amazon, imdb) to csv, containing comments and sentiments.
 */
public class WriteReviews2Comments {
    public static void main(String[] args) throws Exception {
        String root = DatasetLoader.ROOT_PATH;
        String dataset = "kotzias2015";
        String outFile = root + dataset + "/_all.comment.csv";

        List<Comment> comments = DatasetLoader.loadComments(dataset, null);
        CommentWriter writer = new CommentWriter();

        writer.write(comments, outFile);
    }
}
