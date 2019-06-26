package awkwardrobots.io;

import awkwardrobots.data.CommentList;

import java.io.IOException;
import java.io.InputStream;

// TODO: make more flexible by allowing files/paths and strings as input?
@FunctionalInterface
public interface CommentParser {
    CommentList parseComments(InputStream inputStream) throws IOException;
}
