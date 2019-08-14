package awkwardrobots.data;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collector;
import java.util.stream.Collectors;

public class Opinion {
	
	/**
	 * Creates a list of Opinions from the given Aspect.
	 */
	public static List<Opinion> fromAspect(Aspect aspect) {
		List<Opinion> opinions = new ArrayList<>();
		
		for (Attribute attribute : aspect.getAttributes()) {
			Opinion opinion = new Opinion();
			opinion.setAspect(new Facet(aspect.getName()));
			opinion.setAttribute(new Facet(attribute.getName()));
			opinion.setComment(attribute.getOrigin().getText());
			opinion.setSentiment(attribute.getSentiment());
			
			for (int i = 0; i < attribute.getMentions(); i++) {
				opinions.add(opinion);
			}
		}
		
		return opinions;
	}
	
	/**
	 * Creates a list of Opinions from the given list of Aspects.
	 */
	public static List<Opinion> fromAspects(List<Aspect> aspects) {		
		return aspects.stream()
			.flatMap(aspect -> Opinion.fromAspect(aspect).stream())
			.collect(Collectors.toList());
	}
	
	
	private String comment;
	private Facet attribute;
	private Facet aspect;
	private Sentiment sentiment;
	
	public String getComment() {
		return comment;
	}
	
	public void setComment(String comment) {
		this.comment = comment;
	}
	
	public Facet getAttribute() {
		return attribute;
	}
	
	public void setAttribute(Facet attribute) {
		this.attribute = attribute;
	}
	
	public Facet getAspect() {
		return aspect;
	}
	
	public void setAspect(Facet aspect) {
		this.aspect = aspect;
	}
	
	public Sentiment getSentiment() {
		return sentiment;
	}
	
	public void setSentiment(Sentiment sentiment) {
		this.sentiment = sentiment;
	}
	
	@Override
	public String toString() {
		return "Opinion [comment=" + comment + ", attribute=" + attribute + ", aspect=" + aspect + ", sentiment="
				+ sentiment + "]";
	}
	
	@Override
	public int hashCode() {
		return Objects.hash(aspect, attribute, comment, sentiment);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Opinion other = (Opinion) obj;
		return Objects.equals(aspect, other.aspect) && Objects.equals(attribute, other.attribute)
				&& Objects.equals(comment, other.comment) && sentiment == other.sentiment;
	}

}
