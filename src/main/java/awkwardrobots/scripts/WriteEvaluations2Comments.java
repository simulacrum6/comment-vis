package awkwardrobots.scripts;

import awkwardrobots.data.Comment;
import awkwardrobots.util.CommentParser;
import awkwardrobots.util.CommentWriter;
import awkwardrobots.util.EvaluationPDFParser;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class WriteEvaluations2Comments {
    public static void main(String[] args) throws Exception {
        CommentParser parser = new EvaluationPDFParser();
        CommentWriter writer = new CommentWriter();

        String path = "src/main/resources/data/lecture_evaluations/";
        File directory = new File(path);
        File[] files = directory.listFiles((File dir, String filename) -> filename.endsWith(".pdf"));

        List<Comment> allEvaluations = new ArrayList<>();

        if (files == null) {
            throw new IOException("No Files found under the given path!");
        }
        
        for (File file : files) {
            List<Comment> comments = parser.parse(new FileInputStream(file));
            String out = file.getPath().replace(".pdf", ".comment.csv");
            writer.write(comments, out);
            allEvaluations.addAll(comments);
        }

        writer.write(allEvaluations, path + "_all.comment.csv");
    }
}
