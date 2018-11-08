package awkwardrobots.util;

import awkwardrobots.data.Aspect;
import awkwardrobots.data.Attribute;
import awkwardrobots.data.Comment;
import awkwardrobots.data.CommentList;
import de.tudarmstadt.ukp.dkpro.core.api.lexmorph.type.pos.POS;
import de.tudarmstadt.ukp.dkpro.core.api.segmentation.type.Sentence;
import de.tudarmstadt.ukp.dkpro.core.api.syntax.type.chunk.Chunk;
import de.tudarmstadt.ukp.dkpro.core.opennlp.OpenNlpChunker;
import de.tudarmstadt.ukp.dkpro.core.opennlp.OpenNlpPosTagger;
import de.tudarmstadt.ukp.dkpro.core.tokit.BreakIteratorSegmenter;
import org.apache.uima.UIMAException;
import org.apache.uima.analysis_engine.AnalysisEngine;
import org.apache.uima.analysis_engine.AnalysisEngineDescription;
import org.apache.uima.fit.factory.AnalysisEngineFactory;
import org.apache.uima.fit.util.JCasUtil;
import org.apache.uima.jcas.JCas;
import org.apache.uima.resource.ResourceInitializationException;

import java.io.File;
import java.io.FileInputStream;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Extracts Aspects and Attributes using simple rule-based approaches.
 */
public class SimpleAspectExtractor {

    List<Aspect> aspects = new ArrayList<>();
    List<Attribute> attributes = new ArrayList<>();


    public static void main(String[] args) throws Exception {
        File file = new File("src/main/resources/data/kotzias2015/yelp_labelled.txt");
        CommentList comments = new TXTCommentParser().parse(new FileInputStream(file));

        SimpleAspectExtractor extractor = new SimpleAspectExtractor();
        extractor.extract(comments);

        //extractor.getAspects().stream().forEach(aspect -> System.out.println(aspect.getName()));
        //extractor.getAttributes().stream().forEach(attribute -> System.out.println(attribute.getName()));
    }

    public void extract(List<Comment> comments) throws UIMAException {
        // create JCas
        JCas jcas = CommentToJCas.convert(comments);

        // annotate JCas
        AnalysisEngineDescription config = getAnalysisConfig();
        AnalysisEngine analysisEngine = AnalysisEngineFactory.createEngine(config);
        analysisEngine.process(jcas);

        // extract
        for (Sentence sentence : JCasUtil.select(jcas, Sentence.class)) {
            Collection<Chunk> chunks = JCasUtil.selectCovered(jcas, Chunk.class, sentence.getBegin(), sentence.getEnd());
            System.out.println("----------");
            System.out.println("SENTENCE " + sentence.getCoveredText());
            for (Chunk chunk : chunks) {
                System.out.println("\tCHUNK(" + chunk.getChunkValue() + ") " + chunk.getCoveredText());
                if (chunk.getChunkValue().equals("NP")) {
                    Collection<POS> tags = JCasUtil.selectCovered(jcas, POS.class, chunk.getBegin(), chunk.getEnd());
                    List<Attribute> chunkAttributes = tags.stream()
                            .peek(pos -> System.out.print("\t\t POS(" + pos.getCoarseValue() + "/"))
                            .peek(pos -> System.out.print(pos.getPosValue() + ") "))
                            .peek(pos -> System.out.println(pos.getCoveredText()))
                            .filter(pos -> pos.getPosValue().startsWith("JJ")) // adjective
                            .map(pos -> new Attribute(pos.getCoveredText()))
                            .peek(att -> System.out.println("\t  ATTRIBUTE " + att.getName()))
                            .collect(Collectors.toList());

                    Aspect aspect = new Aspect();
                    for (POS tag : tags) {
                        if (tag.getPosValue().startsWith("NN")) {
                            aspect.setName(chunk.getCoveredText());
                            System.out.println("\t  ASPECT " + aspect.getName());
                            aspect.setAttributes(chunkAttributes);
                            aspects.add(aspect);
                        }
                    }
                } else if (chunk.getChunkValue().equals("ADJP")) {
                    System.out.println(chunk.getCoveredText());
                    Attribute attribute = new Attribute(chunk.getCoveredText());
                    System.out.println("\t  ATTRIBUTE " + attribute.getName());
                    attributes.add(attribute);
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

    private AnalysisEngineDescription getAnalysisConfig() throws ResourceInitializationException {
        return AnalysisEngineFactory.createEngineDescription(
                AnalysisEngineFactory.createEngineDescription(BreakIteratorSegmenter.class),
                AnalysisEngineFactory.createEngineDescription(OpenNlpPosTagger.class),
                AnalysisEngineFactory.createEngineDescription(OpenNlpChunker.class)
        );
    }
}
