package awkwardrobots.data;

import java.util.Objects;

public class Facet {
	private String text;
	private String group;
	
	
	public Facet(String text, String group) {
		this.text = text;
		this.group = group;
	}
	
	
	public Facet(String text) {
		this(text, text);
	}

	public String getText() {
		return text;
	}

	public void setText(String text) {
		this.text = text;
	}

	public String getGroup() {
		return group;
	}

	public void setGroup(String group) {
		this.group = group;
	}
	
	@Override
	public String toString() {
		return "Facet [text=" + text + ", group=" + group + "]";
	}

	@Override
	public int hashCode() {
		return Objects.hash(group, text);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Facet other = (Facet) obj;
		return Objects.equals(group, other.group) && Objects.equals(text, other.text);
	}
}
