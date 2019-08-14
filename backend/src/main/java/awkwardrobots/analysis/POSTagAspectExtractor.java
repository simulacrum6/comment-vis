package awkwardrobots.analysis;

import awkwardrobots.data.Aspect;
import awkwardrobots.data.Attribute;
import awkwardrobots.data.Comment;
import awkwardrobots.data.Sentiment;
import awkwardrobots.dkpro.types.CommentAnnotation;
import awkwardrobots.io.CommentReader;
import awkwardrobots.util.CommentToJCas;
import de.tudarmstadt.ukp.dkpro.core.api.lexmorph.type.pos.POS;
import org.apache.uima.UIMAException;
import org.apache.uima.analysis_engine.AnalysisEngine;
import org.apache.uima.fit.util.JCasUtil;
import org.apache.uima.jcas.JCas;
import org.apache.uima.resource.ResourceInitializationException;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * A class for extracting Aspects and Attributes using simple rules for POS Tags.
 * Very simple. This is supposed to be a really bad baseline.
 */
public class POSTagAspectExtractor {

    private String language = "en";
    private AnalysisConfig config;


    public POSTagAspectExtractor() throws ResourceInitializationException {
        config = new POSOnlyConfig();
    }

    //TODO: move to scripts
    public static void main(String[] args) throws Exception {
        String path = "src/main/resources/data/kotzias2015/_all.comment.csv";
        List<Comment> comments = new CommentReader().read(path);

        POSTagAspectExtractor extractor = new POSTagAspectExtractor();
        extractor.language = "en";
        System.out.println(extractor.extract(comments));
    }

    /**
     * Extracts aspects and attributes from a given list of comments.
     * Every noun in a comment is an aspect, every adjective is an attribute.
     * 
     * @param comments the comments to extract aspects and attributes for.
     * @return a list of aspects for the given comments.
     * @throws UIMAException if some DKPro component fails.
     */
    public List<Aspect> extract(List<Comment> comments) throws UIMAException {
        // create JCas
        JCas jcas = CommentToJCas.convert(comments, language);

        // annotate JCas
        AnalysisEngine analysisEngine = config.createEngine();
        analysisEngine.process(jcas);

        // extract
        List<Aspect> aspects = new ArrayList<>();
        for (CommentAnnotation comment : JCasUtil.select(jcas, CommentAnnotation.class)) {
            Collection<POS> tags = JCasUtil.selectCovered(jcas, POS.class, comment.getBegin(), comment.getEnd());

            Aspect aspect = null;
            List<Attribute> attributes = new ArrayList<>();

            for (POS tag : tags) {
            	// extract as aspect, if word is a noun.
                if (tag.getPosValue().startsWith("NN")) {
                    String coveredText = tag.getCoveredText();
                    // check if aspect already exists
                    for (Aspect anotherAspect : aspects) {
                        if (coveredText.equalsIgnoreCase(anotherAspect.getName())) {
                            aspect = anotherAspect;
                            aspect.setMentions(aspect.getMentions() + 1);
                            break;
                        }
                    }
                    // create new one, if aspect does not yet exist.
                    if (aspect == null) {
                        aspect = new Aspect();
                        aspect.setName(tag.getCoveredText());
                        aspects.add(aspect);
                    }
                // extract as attribute, if word is an adjective.
                } else if (tag.getPosValue().startsWith("JJ")) {
                    Sentiment sentiment = Sentiment.fromString(comment.getSentiment());
                    Comment origin = new Comment(sentiment, comment.getCoveredText());
                    Attribute attribute = new Attribute(tag.getCoveredText());
                    attribute.setSentiment(sentiment);
                    attribute.setOrigin(origin);
                    attributes.add(attribute);
                }
            }

            // FIXME: only attributes, found so far are added to the aspect. 
            // all aspects should get all attributes within the same comment. 
            if (aspect != null) {
                aspect.addAttributes(attributes); 
            }
        }

        return aspects;
    }

}
