package awkwardrobots.io;

import awkwardrobots.data.Comment;
import awkwardrobots.data.CommentList;
import awkwardrobots.data.Sentiment;

import org.xml.sax.Attributes;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.DefaultHandler;

import javax.xml.parsers.ParserConfigurationException;
import javax.xml.parsers.SAXParser;
import javax.xml.parsers.SAXParserFactory;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SemEvalXMLParser implements CommentParser {

    @Override
    public CommentList parse(InputStream inputStream) throws IOException {
        try {
            SAXParser parser = SAXParserFactory
                    .newInstance()
                    .newSAXParser();

            CommentList comments = new CommentList();
            ReviewHandler handler = new ReviewHandler(comments);
            parser.parse(inputStream, handler);

            return comments;
        } catch (ParserConfigurationException | SAXException e) {
            throw new IOException(e);
        }
    }

    private enum TagType {
        REVIEW,
        SENTENCES,
        SENTENCE,
        OPINIONS,
        OPINION,
        TEXT
    }

    private class ReviewHandler extends DefaultHandler {
        private Map<String, Sentiment> sentimentMap = new HashMap<>();

        private List<Comment> comments;
        private List<Sentiment> sentiments;

        private TagType currentTag;
        private Comment current;

        public ReviewHandler() {
            this.sentimentMap.put("negative", Sentiment.NEGATIVE);
            this.sentimentMap.put("positive", Sentiment.POSITIVE);
            this.sentimentMap.put("neutral", Sentiment.UNCLEAR);
        }

        public ReviewHandler(List<Comment> comments) {
            this.comments = comments;
        }

        @Override
        public void startElement(String uri, String localName, String tagName, Attributes attributes) {
            if (tagName.equalsIgnoreCase("sentence")) {
                this.current = new Comment();
                this.currentTag = TagType.SENTENCE;
                return;
            }

            if (tagName.equalsIgnoreCase("text")) {
                this.currentTag = TagType.TEXT;
                return;
            }

            if (tagName.equalsIgnoreCase("opinions")) {
                this.sentiments = new ArrayList<>();
                return;
            }

            if (tagName.equalsIgnoreCase("opinion")) {
                String sentiment = attributes.getValue("polarity");
                this.sentiments.add(sentimentMap.get(sentiment));
            }
        }

        @Override
        public void endElement(String uri, String localName, String tagName) {
            if (tagName.equalsIgnoreCase("opinions")) {
                //TODO: Find good sorting.
                this.current.setSentiment(this.sentiments.get(0));
                return;
            }

            if (tagName.equalsIgnoreCase("sentence")) {
                this.comments.add(this.current);
                return;
            }
        }

        @Override
        public void characters(char chars[], int start, int length) {
            if (this.currentTag == TagType.TEXT) {
                this.current.setText(new String(chars, start, length));
            }
        }
    }
}
