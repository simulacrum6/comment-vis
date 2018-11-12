package awkwardrobots.analysis;

import de.tudarmstadt.ukp.dkpro.core.opennlp.OpenNlpPosTagger;
import de.tudarmstadt.ukp.dkpro.core.tokit.BreakIteratorSegmenter;
import org.apache.uima.analysis_engine.AnalysisEngine;
import org.apache.uima.analysis_engine.AnalysisEngineDescription;
import org.apache.uima.fit.factory.AnalysisEngineFactory;
import org.apache.uima.resource.ResourceInitializationException;

public class POSOnlyConfig implements AnalysisConfig {

    private AnalysisEngineDescription description;

    public POSOnlyConfig() throws ResourceInitializationException {
        description = AnalysisEngineFactory.createEngineDescription(
                AnalysisEngineFactory.createEngineDescription(BreakIteratorSegmenter.class),
                AnalysisEngineFactory.createEngineDescription(OpenNlpPosTagger.class)
        );
    }

    @Override
    public AnalysisEngineDescription getConfig() {
        return description;
    }

    @Override
    public AnalysisEngine getEngine() throws ResourceInitializationException {
        return AnalysisEngineFactory.createEngine(description);
    }

}
