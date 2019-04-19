package awkwardrobots.io;

import awkwardrobots.data.Comment;
import awkwardrobots.data.CommentList;
import awkwardrobots.data.Sentiment;

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
    private static final String REPETITIONS = "Wiederholungen";
    private static final String POSITIVE_FEEDBACK = "Positive Resonanz";
    private static final String IMPROVEMENTS = "Verbesserungsvorschläge";
    private static final String NEWLINE = System.lineSeparator();
    private static final String END_OF_QUESTION_HEADER = "Anz";
    private static final String END_OF_COMMENTS = "Summe";

    private Matcher feedbackQuestions = Pattern.compile("" +
            "(" + REPETITIONS + ")|" +
            "(" + POSITIVE_FEEDBACK + ")|" +
            "(" + IMPROVEMENTS + ")")
            .matcher("");

    @Override
    public CommentList parse(InputStream inputStream) throws IOException {
        PDFParser parser = new PDFParser(inputStream);
        parser.parse();
        PDDocument pdf = new PDDocument(parser.getDocument());
        PDFTextStripper pdfStripper = new PDFTextStripper();

        CommentList comments = new CommentList();
        Iterator<String> iterator = Arrays
                .asList(pdfStripper.getText(pdf).split(NEWLINE))
                .iterator();

        while (iterator.hasNext()) {
            String line = iterator.next();
            feedbackQuestions.reset(line);
            if (feedbackQuestions.matches()) {
                comments.addAll(getComments(iterator, getSentiment(line)));
            }
        }

        pdf.close();
        inputStream.close();

        return comments;
    }

    private Sentiment getSentiment(String line) {
        if (line.equals(REPETITIONS))
            return Sentiment.UNCLEAR;

        if (line.equals(POSITIVE_FEEDBACK))
            return Sentiment.POSITIVE;

        if (line.equals(IMPROVEMENTS))
            return Sentiment.NEGATIVE;

        throw new IllegalArgumentException("Line must be the start of a feedback question. Was: " + line);
    }

    private List<Comment> getComments(Iterator<String> iterator, Sentiment sentiment) {
        List<Comment> comments = new ArrayList<>();
        String line = "";

        // skip irrelevant lines;
        while (!line.equals(END_OF_QUESTION_HEADER))
            line = iterator.next();

        while (iterator.hasNext()) {
            line = iterator.next();

            // break if end of list is reached
            if (line.startsWith(END_OF_COMMENTS))
                break;

            // separate comment from number of mentions
            try {
                int lastSpace = line.lastIndexOf(' ');
                String comment = line.substring(0, lastSpace);
                int mentions = Integer.parseInt(line.substring(lastSpace + 1));

                for (int i = 0; i < mentions; i++)
                    comments.add(new Comment(sentiment, comment));
            } catch (Exception e) {
                e.printStackTrace();
                System.err.println("Culprit: " + line);
            }
        }

        return comments;
    }
}
