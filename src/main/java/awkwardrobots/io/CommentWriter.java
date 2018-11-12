package awkwardrobots.io;

import awkwardrobots.data.Comment;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

/**
 * A class writing {@code Comment}s to disk.
 *
 * @see awkwardrobots.data.Comment
 */
public class CommentWriter {

    public void write(List<Comment> comments, String filepath, String separator) throws IOException {
        List<String> lines = comments.stream()
                .map(comment -> String.join(separator, comment.getText(), comment.getSentiment().toString()))
                .collect(Collectors.toList());

        Files.write(Paths.get(filepath), lines);
    }

    public void write(List<Comment> comments, String filepath) throws IOException {
        write(comments, filepath, "\t");
    }

}
