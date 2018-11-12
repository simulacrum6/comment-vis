package awkwardrobots.util;

import awkwardrobots.data.Comment;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;

public class DatasetLoader {

    public static final String ROOT_PATH = "src/main/resources/data/";

    public static File[] findFiles(String dataset, String subset) {
        if (!(dataset.equalsIgnoreCase("kotzias2015") || dataset.equalsIgnoreCase("lecture_evaluations")))
            throw new IllegalArgumentException("Dataset name not valid.");

        String extension = dataset.equalsIgnoreCase("lecture_evaluations") ? ".pdf" : ".txt";

        File directory = new File(ROOT_PATH + dataset);

        File[] files;
        if (subset == null || subset.equals("*")) {
            files = directory.listFiles((File dir, String filename) -> filename.endsWith(extension));
        } else {
            files = new File[]{new File(ROOT_PATH + dataset + "/" + subset + extension)};
        }

        return files;
    }

    public static List<String> loadLines(String dataset, String subset) throws IOException {
        if (dataset.equalsIgnoreCase("lecture_evaluations"))
            throw new IOException("'lecture_evaluations' are not readable line by line");

        File[] files = DatasetLoader.findFiles(dataset, subset);

        List<String> lines = new ArrayList<>();
        for (File file : files) {
            List<String> content = Files.readAllLines(file.toPath());
            lines.addAll(content);
        }

        return lines;
    }

    public static List<Comment> loadComments(String dataset, String subset) throws IOException {
        File[] files = DatasetLoader.findFiles(dataset, subset);

        CommentParser parser = dataset.equalsIgnoreCase("lecture_evaluations") ?
                new EvaluationPDFParser() :
                new TXTCommentParser();

        List<Comment> comments = new ArrayList<>();
        for (File file : files) {
            comments.addAll(parser.parse(new FileInputStream(file)));
        }

        return comments;
    }
}
