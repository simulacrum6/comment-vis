package awkwardrobots.data;

import java.util.Objects;

public class Opinion {
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
