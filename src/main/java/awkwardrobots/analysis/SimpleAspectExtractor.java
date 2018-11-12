package awkwardrobots.analysis;

import awkwardrobots.data.Aspect;
import awkwardrobots.data.Attribute;
import awkwardrobots.data.Comment;
import awkwardrobots.io.CommentReader;
import awkwardrobots.util.CommentToJCas;
import de.tudarmstadt.ukp.dkpro.core.api.lexmorph.type.pos.POS;
import de.tudarmstadt.ukp.dkpro.core.api.segmentation.type.Sentence;
import org.apache.uima.UIMAException;
import org.apache.uima.analysis_engine.AnalysisEngine;
import org.apache.uima.fit.factory.AnalysisEngineFactory;
import org.apache.uima.fit.util.JCasUtil;
import org.apache.uima.jcas.JCas;
import org.apache.uima.resource.ResourceInitializationException;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Extracts Aspects and Attributes using simple rule-based approaches.
 */
public class SimpleAspectExtractor {

    private String language = "en";
    private AnalysisConfig config;

    private List<Aspect> aspects = new ArrayList<>();
    private List<Attribute> attributes = new ArrayList<>();


    public SimpleAspectExtractor() throws ResourceInitializationException {
        config = new POSOnlyConfig();
    }

    public static void main(String[] args) throws Exception {
        String path = "src/main/resources/data/lecture_evaluations/_all.comment.csv";
        List<Comment> comments = new CommentReader().read(path);

        SimpleAspectExtractor extractor = new SimpleAspectExtractor();
        extractor.language = "de";
        extractor.extract(comments);
    }

    public void extract(List<Comment> comments) throws UIMAException {
        // create JCas
        JCas jcas = CommentToJCas.convert(comments, language);

        // annotate JCas
        AnalysisEngine analysisEngine = AnalysisEngineFactory.createEngine(config.getConfig());
        analysisEngine.process(jcas);

        // extract
        for (Sentence sentence : JCasUtil.select(jcas, Sentence.class)) {
            Collection<POS> tags = JCasUtil.selectCovered(jcas, POS.class, sentence.getBegin(), sentence.getEnd());
            List<Attribute> chunkAttributes = tags.stream()
                    .filter(pos -> pos.getPosValue().startsWith("JJ")) // adjective
                    .map(pos -> new Attribute(pos.getCoveredText()))
                    .collect(Collectors.toList());

            Aspect aspect = new Aspect();
            for (POS tag : tags) {
                if (tag.getPosValue().startsWith("NN")) {
                    aspect.setName(sentence.getCoveredText());
                    System.out.println("\t  ASPECT " + aspect.getName());
                    aspect.setAttributes(chunkAttributes);
                    aspects.add(aspect);
                }
            }
        }
    }

    public List<Aspect> getAspects() {
        return this.aspects;
    }

    public List<Attribute> getAttributes() {
        return this.attributes;
    }

}
