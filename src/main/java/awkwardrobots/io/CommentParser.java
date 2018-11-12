package awkwardrobots.io;

import awkwardrobots.data.CommentList;

import java.io.IOException;
import java.io.InputStream;

public interface CommentParser {
    CommentList parse(InputStream inputStream) throws IOException;
}
