package awkwardrobots.scripts;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.List;

import com.fasterxml.jackson.databind.ObjectMapper;

import awkwardrobots.data.Opinion;
import awkwardrobots.io.OpinionParser;
import awkwardrobots.io.SemEvalXMLParser;

public class WriteSemEval2JSON {
	public static void main(String[] args) throws FileNotFoundException, IOException {
		OpinionParser parser = new SemEvalXMLParser();
		String dataPath = "src/main/resources/data/brun2018/data/semeval_format/foursquare_gold.xml";
		String outPath = "src/main/resources/data/brun2018/data/json/foursquare_gold.json";
		
		List<Opinion> opinions = parser.parseOpinions(new FileInputStream(dataPath));
		
		ObjectMapper mapper = new ObjectMapper();
		mapper.writeValue(new File(outPath), opinions);
	}
}
