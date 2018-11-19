package awkwardrobots.analysis;

import awkwardrobots.data.Aspect;
import awkwardrobots.data.Attribute;
import awkwardrobots.data.Comment;
import awkwardrobots.dkpro.types.CommentAnnotation;
import awkwardrobots.io.CommentReader;
import awkwardrobots.util.CommentToJCas;
import awkwardrobots.util.Sentiment;
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
 * Extracts Aspects and Attributes using simple rule-based approaches.
 */
public class SimpleAspectExtractor {

    private String language = "en";
    private AnalysisConfig config;


    public SimpleAspectExtractor() throws ResourceInitializationException {
        config = new POSOnlyConfig();
    }

    public static void main(String[] args) throws Exception {
        String path = "src/main/resources/data/kotzias2015/_all.comment.csv";
        List<Comment> comments = new CommentReader().read(path);

        SimpleAspectExtractor extractor = new SimpleAspectExtractor();
        extractor.language = "en";
        System.out.println(extractor.extract(comments));
    }

    public List<Aspect> extract(List<Comment> comments) throws UIMAException {
        // create JCas
        JCas jcas = CommentToJCas.convert(comments, language);

        // annotate JCas
        AnalysisEngine analysisEngine = config.getEngine();
        analysisEngine.process(jcas);

        // extract
        List<Aspect> aspects = new ArrayList<>();
        for (CommentAnnotation comment : JCasUtil.select(jcas, CommentAnnotation.class)) {
            Collection<POS> tags = JCasUtil.selectCovered(jcas, POS.class, comment.getBegin(), comment.getEnd());

            Aspect aspect = null;
            List<Attribute> attributes = new ArrayList<>();

            for (POS tag : tags) {
                if (tag.getPosValue().startsWith("NN")) {
                    String coveredText = tag.getCoveredText();
                    for (Aspect anotherAspect : aspects) {
                        if (coveredText.equalsIgnoreCase(anotherAspect.getName())) {
                            aspect = anotherAspect;
                            aspect.setMentions(aspect.getMentions() + 1);
                            break;
                        }
                    }
                    if (aspect == null) {
                        aspect = new Aspect();
                        aspect.setName(tag.getCoveredText());
                        aspects.add(aspect);
                    }
                } else if (tag.getPosValue().startsWith("JJ")) {
                    Attribute attribute = new Attribute(tag.getCoveredText());
                    attribute.setSentiment(Sentiment.fromString(comment.getSentiment()));
                    attributes.add(attribute);
                }
            }

            if (aspect != null) {
                aspect.addAttributes(attributes);
            }
        }

        return aspects;
    }

}
