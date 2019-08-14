package awkwardrobots.test;

import static org.junit.Assert.assertEquals;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.junit.Test;

import awkwardrobots.data.Aspect;
import awkwardrobots.data.Attribute;
import awkwardrobots.data.Sentiment;
import awkwardrobots.data.Comment;
import awkwardrobots.data.Opinion;

public class OpinionTest {
	
	@Test
	public void testTransformations() {
		Aspect aspect = new Aspect("foo");
		
		List<Attribute> attributes = Stream.of("bar", "baz", "zam")
			.map(name -> {
				Attribute attribute = new Attribute(name);
				attribute.setSentiment(Sentiment.NEGATIVE);
				attribute.setOrigin(new Comment(attribute.getSentiment(), aspect.getName() + " " + attribute.getName()));
				return attribute;
			})
			.collect(Collectors.toList());
		
		aspect.addAttributes(attributes);
		
		List<Opinion> opinions = Opinion.fromAspect(aspect);
		assertEquals(attributes.size(), opinions.size());
		
		List<Aspect> aspects = new ArrayList<>();
		aspects.add(aspect);
		aspects.add(aspect);
		aspects.add(aspect);
		aspects.add(aspect);
		aspects.add(aspect);
		
		opinions = Opinion.fromAspects(aspects);
		assertEquals(attributes.size() * aspects.size(), opinions.size());
		
	}
}
