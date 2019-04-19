package awkwardrobots.scripts;

import awkwardrobots.analysis.POSOnlyConfig;
import awkwardrobots.data.Comment;
import awkwardrobots.data.Sentiment;
import awkwardrobots.dkpro.types.CommentAnnotation;
import awkwardrobots.io.DatasetLoader;
import awkwardrobots.util.CommentToJCas;
import de.tudarmstadt.ukp.dkpro.core.api.lexmorph.type.pos.POS;
import de.tudarmstadt.ukp.dkpro.core.api.segmentation.type.Token;

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
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

//TODO: clean up
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
	        AnalysisEngine engine = new POSOnlyConfig().createEngine();
	        engine.process(jcas);
	        
	        // calculate stats
	        Map<String, Object> features = new HashMap<>();
	        
	        features.put("name", datasetName);
	        features.put("language", datasetLanguage.get(datasetName));
	        
	        // token features
	        Collection<Token> tokens = JCasUtil.select(jcas, Token.class);
	        Set<String> uniqueTokens = tokens.stream()
	        		.map(Token::getCoveredText)
	        		.collect(Collectors.toSet());
	        
	        features.put("token_count", tokens.size());
	        features.put("unique_token_count", uniqueTokens.size());
	        features.put("unique_token_ratio(ttr)",  new Double(uniqueTokens.size()) / new Double(tokens.size()));
	        
	        // top k tokens
	        Map<String, Long> tokenCounts = tokens.stream()
	        		.map(Token::getCoveredText)
	        		.collect(Collectors.groupingBy(Function.identity(), Collectors.counting()));
	        
	        Map<String, Long> sortedTokenCounts = sortByValue(tokenCounts, false);
	        
	        int topK = 10;
	        int n = 1;
	        
	        for (Entry<String, Long> entry : sortedTokenCounts.entrySet()) {
	        	if (n > topK) { break; }
	        	features.put("token_top" + n, entry.getKey());
	        	features.put("token_top" + n + "_ratio", new Double(entry.getValue()) / new Double(tokens.size()));
	        	n++;
	        }
	        
	        // comment features
	        Collection<CommentAnnotation> commentAnnos = JCasUtil.select(jcas, CommentAnnotation.class);
	        Set<String> uniqueCommentAnnos = commentAnnos.stream()
	        		.map(anno -> anno.getCoveredText())
	        		.collect(Collectors.toSet());
	        Long positiveComments = commentAnnos.stream()
	        		.filter(comment -> comment.getSentiment().equals(Sentiment.POSITIVE.toString()))
	        		.collect(Collectors.counting());
	        features.put("comment_count", commentAnnos.size());
	        features.put("unique_comment_count", uniqueCommentAnnos.size());
	        features.put("unique_comment_ratio", new Double(uniqueCommentAnnos.size()) / new Double(commentAnnos.size()) );
	        features.put("token_comment_ratio", new Double(tokens.size()) / new Double(commentAnnos.size()));
	        features.put("positive_rate", new Double(positiveComments) / new Double(commentAnnos.size()));
	        
	        
	        // pos features
	        List<POS> posAnnos = new ArrayList<>(JCasUtil.select(jcas, POS.class));
	        Map<String, Integer> tagCounts = new HashMap<>();
	        for (POS pos : posAnnos) {
	        	String tag = pos.getCoarseValue();
	        	Integer count = tagCounts.containsKey(tag) ? tagCounts.get(tag) : 0;
	        	tagCounts.put(tag, count + 1);
	        }
	        for (Entry<String, Integer> entry : tagCounts.entrySet()) {
	        	features.put("pos_" + entry.getKey() + "_count", entry.getValue());
	        	features.put("pos_" + entry.getKey() + "_ratio", new Double(entry.getValue()) / new Double(tokens.size()));
	        }
	        	       
	        // top k pos tags
	        Map<String, Integer> sortedTagCounts = sortByValue(tagCounts, false);
	        
	        topK = 5;
	        n = 1;	        
	        for (Entry<String, Integer> entry : sortedTagCounts.entrySet()) {
	        	if (n > topK) { break; }
	        	System.out.println(entry.getValue());
	        	features.put("pos_top" + n, entry.getKey());
	        	features.put("pos_top" + n + "_ratio", new Double(entry.getValue()) / new Double(posAnnos.size()));
	        	n++;
	        }
	                
	        // tagset sizes
	        List<String> tags = new ArrayList<>(tagCounts.keySet());
	        Collections.sort(tags);
	    
	        features.put("pos_tag_count", tags.size());
	        features.put("pos_tags_encountered", "[" + String.join(" ", tags) + "]");
	        
	        
	        // pos sequences
	        Map<CommentAnnotation, Collection<POS>> posPerComment = JCasUtil.indexCovered(jcas, CommentAnnotation.class, POS.class);
	        Map<String, Integer> sequenceCounts = new HashMap<>();
	        
	        for (CommentAnnotation comment : commentAnnos) {
	        	List<POS> posAnnotations = new ArrayList<>(posPerComment.get(comment));
		        for (int j = 1; j < 2; j++) {
		        	for (int i = 0; i < posAnnotations.size() - j; i++) {
			        	String sequence = posAnnotations.subList(i, i+j+1).stream()
			        			.map(pos -> pos.getCoarseValue())
			        			.collect(Collectors.joining("_"));
			        	Integer count = sequenceCounts.containsKey(sequence) ? sequenceCounts.get(sequence) : 0;
			        	sequenceCounts.put(sequence, count + 1);
			        }
		        }
	        }
	        for (Entry<String, Integer> entry : sequenceCounts.entrySet()) {
	        	features.put("sequence_" + entry.getKey() + "_count", entry.getValue());
	        	features.put("sequence_" + entry.getKey() + "_ratio", new Double(entry.getValue()) / new Double(tokens.size() - entry.getKey().split("_").length * commentAnnos.size()));
	        }
	        
	        
	        // top k sequences
	        Map<String, Integer> sortedSequenceCounts = sortByValue(sequenceCounts, false);
	        
	        topK = 5;
	        n = 1;	        
	        for (Entry<String, Integer> entry : sortedSequenceCounts.entrySet()) {
	        	if (n > topK) { break; }
	        	System.out.println(entry.getValue());
	        	features.put("sequence_top" + n, entry.getKey());
	        	features.put("sequence_top" + n + "_ratio", new Double(entry.getValue()) / new Double(tokens.size() - entry.getKey().split("_").length * commentAnnos.size()));
	        	n++;
	        }
	        
	        datasetStats.add(features);
	        statNames.addAll(features.keySet());
    	}
	        
        
        // store results
        StringBuilder stats = new StringBuilder();
    	
    	List<String> header = new ArrayList<>(statNames);
    	Collections.sort(header);
    	
        stats.append(String.join(",", header));
        stats.append("\n");
    	
    	for (Map<String, Object> features : datasetStats) {
    		for (String stat : header) {
    			stats.append(features.get(stat));
    			stats.append(",");
    		}
    		stats.append("\n");
    	}
    	
    	String out = DatasetLoader.ROOT_PATH + "stats/datasets.csv";
    	Path outPath = Paths.get(out);
    	
    	if (Files.notExists(outPath.getParent()))
    		Files.createDirectories(outPath.getParent());
    	
    	Files.write(outPath, stats.toString().getBytes());
    }
    
    public static <K, V extends Comparable<? super V>> Map<K, V> sortByValue(Map<K, V> map, boolean ascending) {
        List<Entry<K, V>> list = new ArrayList<>(map.entrySet());
        list.sort(Entry.comparingByValue());
        
        if (!ascending) { Collections.reverse(list); }
        
        Map<K, V> result = new LinkedHashMap<>();
        for (Entry<K, V> entry : list) {
            result.put(entry.getKey(), entry.getValue());
        }

        return result;
    }
}
