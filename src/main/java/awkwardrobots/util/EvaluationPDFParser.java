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
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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
            Pattern relevant = Pattern.compile("" +
                    "(Positive Resonanz)|" +
                    "(Wiederholungen)|" +
                    "(Verbesserungsvorschläge)");
            Matcher finder = relevant.matcher("");


            while (iterator.hasNext()) {
                String line = iterator.next();
                finder.reset(line);
                if (finder.matches()) {
                    Sentiment sentiment = getSentiment(line);
                    comments.addAll(getComments(iterator, sentiment));
                }
            }
            inputStream.close();
            return comments;
        } catch (IOException e) {
            System.err.println("Could not parse document.");
            e.printStackTrace();
        }

        return comments;
    }

    private Sentiment getSentiment(String line) {
        if (line.equals("Wiederholungen"))
            return Sentiment.UNCLEAR;

        if (line.equals("Positive Resonanz"))
            return Sentiment.POSITIVE;

        if (line.equals("Verbesserungsvorschläge"))
            return Sentiment.NEGATIVE;

        throw new IllegalArgumentException("Line must be the start of a feedback question. Was: " + line);
    }

    private List<Comment> getComments(Iterator<String> iterator, Sentiment sentiment) {
        List<Comment> comments = new ArrayList<>();
        String line = "";

        // skip irrelevant lines;
        while (!line.equals("Anz"))
            line = iterator.next();

        while (iterator.hasNext()) {
            line = iterator.next();

            // break if end of list is reached
            if (line.startsWith("Summe"))
                break;

            // separate comment from number of mentions
            int lastSpace = line.lastIndexOf(' ');
            String comment = line.substring(0, lastSpace);
            int mentions = Integer.parseInt(line.substring(lastSpace + 1));

            for (int i = 0; i < mentions; i++)
                comments.add(new Comment(sentiment, comment));
        }

        return comments;
    }
}
