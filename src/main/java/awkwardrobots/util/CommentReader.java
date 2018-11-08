package awkwardrobots.util;

import awkwardrobots.data.Comment;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

public class CommentReader {

    private static final String DEFAULT_SEPARATOR = "\t";

    public static void main(String[] args) throws Exception {
        String path = "src/main/resources/data/lecture_evaluations/_all.comment.csv";
        CommentReader reader = new CommentReader();

        List<Comment> comments = reader.read(path);

        for (Comment c : comments) System.out.println(c);
    }

    public List<Comment> read(String file) throws IOException {
        return Files.readAllLines(Paths.get(file))
                .stream()
                .map(this::lineToComment)
                .collect(Collectors.toList());
    }

    private Comment lineToComment(String line) {
        String[] parts = line.split(DEFAULT_SEPARATOR);

        if (parts.length < 2) return null;

        Sentiment sentiment = Sentiment.fromString(parts[1]);
        String text = parts[0];

        return new Comment(sentiment, text);
    }


}
