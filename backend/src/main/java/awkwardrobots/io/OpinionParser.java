package awkwardrobots.io;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

import awkwardrobots.data.Opinion;

public interface OpinionParser {
	List<Opinion> parseOpinions(InputStream inputStream) throws IOException;
}
