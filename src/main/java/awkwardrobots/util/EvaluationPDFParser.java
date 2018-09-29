package awkwardrobots.util;

import awkwardrobots.data.Comment;
import org.apache.pdfbox.pdfparser.PDFParser;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.util.PDFTextStripper;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;

public class EvaluationPDFParser implements CommentParser {

    @Override
    public List<Comment> parse(InputStream inputStream) {
        List<Comment> comments = null;
        try {
            PDFParser parser = new PDFParser(inputStream);
            parser.parse();
            PDDocument pdf = new PDDocument(parser.getDocument());
            PDFTextStripper pdfStripper = new PDFTextStripper();
            String text = pdfStripper.getText(pdf);
            List<String> lines = Arrays.asList(text.split(System.lineSeparator()));
            Iterator<String> iterator = lines.iterator();

            comments = new ArrayList<>();
            for (String line : lines) {
                comments.add(new Comment(Sentiment.UNCLEAR, line));
            }
            inputStream.close();
            return comments;
        } catch (IOException e) {
            System.err.println("Could not parse document.");
            e.printStackTrace();
        }

        return comments;
    }
}
