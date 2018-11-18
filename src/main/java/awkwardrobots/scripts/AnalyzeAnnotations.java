package awkwardrobots.scripts;

import awkwardrobots.analysis.POSOnlyConfig;
import awkwardrobots.data.Comment;
import awkwardrobots.dkpro.types.CommentAnnotation;
import awkwardrobots.io.CommentReader;
import awkwardrobots.io.DatasetLoader;
import awkwardrobots.util.CommentToJCas;
import de.tudarmstadt.ukp.dkpro.core.api.lexmorph.type.pos.POS;
import de.tudarmstadt.ukp.dkpro.core.api.segmentation.type.Sentence;
import org.apache.uima.analysis_engine.AnalysisEngine;
import org.apache.uima.fit.util.JCasUtil;
import org.apache.uima.jcas.JCas;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

public class AnalyzeAnnotations {

    public static void main(String[] args) throws Exception {
    	String[] datasets = new String[] { "lecture_evaluations", "kotzias2015" };
    	
    	Map<String, String> datasetLanguage = new HashMap<>();
    	datasetLanguage.put("lecture_evaluations", "de");
    	datasetLanguage.put("kotzias2015", "en");
    	
    	List<Map<String, Object>> datasetStats = new ArrayList<>();
    	Set<String> statNames = new HashSet<>();
    	
        // load data
    	for (String datasetName : datasets) {
    		List<Comment> comments = DatasetLoader.loadComments(datasetName, null);
    		
	        // analyze
	        JCas jcas = CommentToJCas.convert(comments, datasetLanguage.get(datasetName));
	        AnalysisEngine engine = new POSOnlyConfig().getEngine();
	        engine.process(jcas);
	        
	        // calculate stats
	        Map<String, Object> features = new HashMap<>();
	        
	        features.put("name", datasetName);
	        features.put("language", datasetLanguage.get(datasetName));
	        
	        Collection<CommentAnnotation> commentAnnos = JCasUtil.select(jcas, CommentAnnotation.class);
	        Set<String> uniqueCommentAnnos = commentAnnos.stream()
	        		.map(anno -> anno.getCoveredText())
	        		.collect(Collectors.toSet());
	        features.put("comment_count", commentAnnos.size());
	        features.put("unique_comment_count", uniqueCommentAnnos.size());
	        features.put("unique_comment_ratio", new Double(uniqueCommentAnnos.size()) / new Double(commentAnnos.size()) );
	
	        Collection<POS> posAnnos = JCasUtil.select(jcas, POS.class);
	        Map<String, Integer> tagCounts = new HashMap<>();
	        for (POS pos : posAnnos) {
	        	String tag = pos.getCoarseValue();
	        	Integer count = tagCounts.containsKey(tag) ? tagCounts.get(tag) : 0;
	        	tagCounts.put(tag, count + 1);
	        }
	        for (Map.Entry<String, Integer> entry : tagCounts.entrySet()) {
	        	features.put(entry.getKey() + "_POS_count", entry.getValue());
	        }
	        
	        List<String> tags = new ArrayList<>(tagCounts.keySet());
	        Collections.sort(tags);
	    
	        features.put("tag_count", tags.size());
	        features.put("encountered_tags", String.join(",", tags));
	        
	        
	        datasetStats.add(features);
	        statNames.addAll(features.keySet());
    	}
	        
        
        // store
        StringBuilder stats = new StringBuilder();
    	
    	List<String> header = new ArrayList<>(statNames);
    	Collections.sort(header);
    	
        stats.append(String.join("\t", header));
        stats.append("\n");
    	
    	for (Map<String, Object> features : datasetStats) {
    		for (String stat : header) {
    			stats.append(features.get(stat));
    			stats.append("\t");
    		}
    		stats.append("\n");
    	}
    	
    	String out = DatasetLoader.ROOT_PATH + "stats/datasets.csv";
    	Path outPath = Paths.get(out);
    	
    	if (Files.notExists(outPath.getParent()))
    		Files.createDirectories(outPath.getParent());
    	
    	Files.write(outPath, stats.toString().getBytes());
    }
}
