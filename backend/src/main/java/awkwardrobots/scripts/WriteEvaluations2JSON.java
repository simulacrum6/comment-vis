package awkwardrobots.scripts;

import java.io.File;
import java.util.List;
import java.util.stream.Collectors;

import com.fasterxml.jackson.databind.ObjectMapper;

import awkwardrobots.analysis.EditDistanceGrouper;
import awkwardrobots.analysis.FacetGrouper;
import awkwardrobots.analysis.POSTagAspectExtractor;
import awkwardrobots.data.Aspect;
import awkwardrobots.data.Comment;
import awkwardrobots.data.Facet;
import awkwardrobots.data.Opinion;
import awkwardrobots.io.DatasetLoader;

public class WriteEvaluations2JSON {
	
	public static void main(String[] args) throws Exception {
		// transform to opinions
		List<Comment> comments = DatasetLoader.loadComments("lecture_evaluations");
		List<Aspect> aspects = new POSTagAspectExtractor().extract(comments);
		List<Opinion> opinions = Opinion.fromAspects(aspects);
		
		// assign groups, just a single grouper for now
		FacetGrouper grouper = new EditDistanceGrouper();
		List<Facet> facetAspects = opinions.stream()
				.map(Opinion::getAspect)
				.collect(Collectors.toList());
		List<Facet> facetAttributes = opinions.stream()
				.map(Opinion::getAttribute)
				.collect(Collectors.toList());
		grouper.assignGroups(facetAspects);
		grouper.assignGroups(facetAttributes);
		
		// save to file
		new ObjectMapper().writeValue(new File("src/main/resources/data/lecture_evaluations/evaulations.ce.json"), opinions);
	}
}
