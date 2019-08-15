package awkwardrobots.io;

import java.io.File;
import java.io.IOException;
import java.util.List;

import com.fasterxml.jackson.databind.ObjectMapper;

import awkwardrobots.data.Opinion;

public class OpinionWriter {
	public static void write(List<Opinion> opinions, String filePath) throws IOException {
		new ObjectMapper().writeValue(new File(filePath), opinions);
	}
}
