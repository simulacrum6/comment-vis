package awkwardrobots.util;

import awkwardrobots.data.Comment;

import java.io.InputStream;
import java.util.List;

public interface CommentParser {
    List<Comment> parse(InputStream inputStream);
}
