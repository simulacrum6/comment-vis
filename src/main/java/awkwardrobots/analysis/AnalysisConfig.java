package awkwardrobots.analysis;

import org.apache.uima.analysis_engine.AnalysisEngine;
import org.apache.uima.analysis_engine.AnalysisEngineDescription;
import org.apache.uima.resource.ResourceInitializationException;

public interface AnalysisConfig {

    AnalysisEngineDescription getConfig();

    AnalysisEngine getEngine() throws ResourceInitializationException;

}
