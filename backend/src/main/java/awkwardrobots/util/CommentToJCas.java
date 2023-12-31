package awkwardrobots.util;

import awkwardrobots.data.Comment;
import awkwardrobots.dkpro.types.CommentAnnotation;
import org.apache.uima.UIMAException;
import org.apache.uima.fit.factory.JCasFactory;
import org.apache.uima.jcas.JCas;

import java.util.List;

public class CommentToJCas {

    private static final String DEFAULT_LANGUAGE = "en";

    //TODO: annotate Sentiment.
    /**
     * Turns a given list of comments into a JCas object.
     *
     * @param comments the list of comments to be converted.
     * @return the converted JCas.
     */
    public static JCas convert(List<Comment> comments) throws UIMAException {
        return convert(comments, DEFAULT_LANGUAGE);
    }

    /**
     * Turns a given list of comments into a JCas object.
     *
     * @param comments the list of comments to be converted.
     * @param language the document language. Should be a ISO 639-1 language code, not null.
     * @return the converted JCas.
     */
    public static JCas convert(List<Comment> comments, String language) throws UIMAException {
        StringBuilder stringBuilder = new StringBuilder();

        for (Comment comment : comments) {
            stringBuilder.append(comment.getText() + " ");
        }

        JCas jcas = JCasFactory.createJCas();
        jcas.setDocumentLanguage(language);
        jcas.setDocumentText(stringBuilder.toString());

        int start = -1;
        int end = -1;
        for (Comment comment : comments) {
            start += 1;
            end = start + comment.getText().length();

            CommentAnnotation annotation = new CommentAnnotation(jcas, start, end);
            annotation.setSentiment(comment.getSentiment().toString());
            annotation.addToIndexes(jcas);

            start = end;
        }

        return jcas;
    }

}
