package awkwardrobots.analysis;

import org.apache.uima.analysis_engine.AnalysisEngine;
import org.apache.uima.analysis_engine.AnalysisEngineDescription;
import org.apache.uima.resource.ResourceInitializationException;

/**
 * A configuration class for DKPro Analyses.
 * Provides Analysis Components either as description or engine.
 */
public interface AnalysisConfig {

	/**
	 * Returns the analysis components as an EngineDescription.
	 */
    AnalysisEngineDescription getEngineDescription();

    /**
     * Creates an AnalysisEngine containing the AnalysisConfig's components and returns it.
     * @throws ResourceInitializationException if some Resource could not be created.
     */
    AnalysisEngine createEngine() throws ResourceInitializationException;

}
