package awkwardrobots.io;

import awkwardrobots.data.Comment;
import awkwardrobots.data.CommentList;
import awkwardrobots.data.Facet;
import awkwardrobots.data.Opinion;
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

public class SemEvalXMLParser implements CommentParser, OpinionParser {

    @Override
    public CommentList parseComments(InputStream inputStream) throws IOException {
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
    
    @Override
    public List<Opinion> parseOpinions(InputStream inputStream) throws IOException {
    	try {
            SAXParser parser = SAXParserFactory
                    .newInstance()
                    .newSAXParser();

            List<Opinion> opinions = new ArrayList<Opinion>();
            ReviewOpinionHandler handler = new ReviewOpinionHandler(opinions);
            parser.parse(inputStream, handler);

            return opinions;
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
        TEXT,
        NULL
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
        	this();
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
                this.currentTag = TagType.NULL;
                return;
            }
        }
    }
    
    private class ReviewOpinionHandler extends DefaultHandler {
        private Map<String, Sentiment> sentimentMap = new HashMap<>();
        private List<Opinion> opinions;

        private List<String> currentSentences;
        private List<Opinion> currentOpinions;;
        private TagType currentTag;
        private Opinion current;

        public ReviewOpinionHandler() {
            this.sentimentMap.put("negative", Sentiment.NEGATIVE);
            this.sentimentMap.put("positive", Sentiment.POSITIVE);
            this.sentimentMap.put("neutral", Sentiment.UNCLEAR);
        }

        public ReviewOpinionHandler(List<Opinion> opinions) {
        	this();
            this.opinions = opinions;
        }

        @Override
        public void startElement(String uri, String localName, String tagName, Attributes attributes) {
        	switch (tagName.toLowerCase()) {
	    		case "review": {
	                this.currentTag = TagType.REVIEW;
	                this.currentSentences = new ArrayList<>();
	                this.currentOpinions = new ArrayList<>();
	                return;
	    		}
	    		case "sentences": {
	                this.currentTag = TagType.SENTENCES;
	                return;
	    		}
	    		case "sentence": {
	                this.currentTag = TagType.SENTENCE;
	                return;
	    		}
	    		case "text": {
	                this.currentTag = TagType.TEXT;
	                return;
	    		}
	    		case "opinions": {
	            	this.currentTag = TagType.OPINIONS;
	                return;
	    		}
	    		case "opinion": {
	    			this.currentTag = TagType.OPINION;
	    			String[] groups = attributes.getValue("category").split("#");
	    			Sentiment sentiment = sentimentMap.getOrDefault(attributes.getValue("polarity"), Sentiment.UNCLEAR);
	                String aspect = attributes.getValue("target");
	                
	                if (aspect.equals("NULL")) {
	                	aspect = "";
	                }
	    			
	    			this.current = new Opinion();
	    			current.setSentiment(sentiment);
	    			current.setAspect(new Facet(aspect, groups[0]));
	    			current.setAttribute(new Facet(groups[1]));
	                current.setComment("");
                    this.currentOpinions.add(this.current);
	                return;
	    		}
        	}
        }

        @Override
        public void endElement(String uri, String localName, String tagName) {
            switch (tagName.toLowerCase()) {
            	case "review": {
            		String comment = String.join("\n", this.currentSentences);
            		for (Opinion opinion : this.currentOpinions) {
            			opinion.setComment(comment);
            		}
            		this.opinions.addAll(this.currentOpinions);
            		return;
            	}
            }
        }

        @Override
        public void characters(char chars[], int start, int length) {
            if (this.currentTag == TagType.TEXT) {
            	String text = new String(chars, start, length);
                this.currentSentences.add(text);
                this.currentTag = TagType.NULL;
                return;
            }
        }
    }
}
