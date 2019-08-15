package awkwardrobots.analysis;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.apache.commons.text.similarity.EditDistance;
import org.apache.commons.text.similarity.LevenshteinDistance;

import awkwardrobots.data.Aspect;
import awkwardrobots.data.Facet;

public class EditDistanceGrouper implements FacetGrouper {
    public static final Integer DEFAULT_THRESHOLD = 2;
    private static final EditDistance<Integer> DEFAULT_DISTANCE = new LevenshteinDistance(DEFAULT_THRESHOLD);

    private EditDistance<Integer> distanceMeasure;

    /**
     * Creates a new EditDistanceGrouper, using Levenshtein Distance with a maximum distance of 2.
     */
	public EditDistanceGrouper() {
		this.distanceMeasure = DEFAULT_DISTANCE;
	}
	
    /**
     * Creates a new EditDistanceGrouper, using the given EditDistance.
     */
    public EditDistanceGrouper(EditDistance<Integer> distanceMeasure) {
        this.distanceMeasure = distanceMeasure;
    }
	
	@Override
	public void assignGroups(Collection<Facet> facets) {
		List<Facet> fs = new ArrayList<>(facets);
		
		for (int i = 0; i < fs.size(); i++) {
			Facet facet = fs.get(i);
			Facet closest = null;
			int minDistance = Integer.MAX_VALUE;
			
			// find most similar facet among remaining facets
			for (int j = i + 1; j < fs.size(); j++) {
				Facet other = fs.get(j);
				int distance = getDistance(facet, other);
				if (distance > -1 && distance < minDistance) {
					minDistance = distance;
					closest = other;
				}
			}
			
			// break early if no close facet was found
			if (closest == null) {
				break;
			}
			
			// assign new group, shortest of both
			if (facet.getGroup().length() < closest.getGroup().length()) {
				closest.setGroup(facet.getGroup());
			} else {
				facet.setGroup(closest.getGroup());
			}
		}
	}

    /**
     * Checks whether two Facets are similar.
     * Facets are similar if their edit distance is below the EditDistanceMeasure's threshold.
     */
    private int getDistance(Facet facet, Facet other) {
        return this.distanceMeasure.apply(facet.getGroup(), other.getGroup());
    }
}
