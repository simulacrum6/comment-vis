package awkwardrobots.analysis;

import awkwardrobots.data.Aspect;
import org.apache.commons.text.similarity.EditDistance;
import org.apache.commons.text.similarity.LevenshteinDistance;

import java.util.ArrayList;
import java.util.Collection;

/**
 * Aggregates Aspects based on the edit distances of their text.
 * Aspects are aggregated if their edit distance is below a set threshold.
 */
public class EditDistanceAggregator implements AspectAggregator {
    public static final Integer DEFAULT_THRESHOLD = 2;
    private static final EditDistance<Integer> DEFAULT_DISTANCE = new LevenshteinDistance(DEFAULT_THRESHOLD);

    private EditDistance<Integer> distanceMeasure;

    /**
     * Creates a new EditDistanceAggregator, using Levenshtein Distance with a maximum distance of 2.
     */
    public EditDistanceAggregator() {
        this.distanceMeasure = DEFAULT_DISTANCE;
    }

    /**
     * Creates a new EditDistanceAggregator, using the given EditDistance.
     */
    public EditDistanceAggregator(EditDistance<Integer> distanceMeasure) {
        this.distanceMeasure = distanceMeasure;
    }

    @Override
    public Collection<Aspect> aggregate(Collection<Aspect> aspects) {
        Aspect[] array = aspects.toArray(new Aspect[]{});

        Collection<Aspect> aggregates = new ArrayList<>();

        for (int i = 0; i < array.length; i++) {
            Aspect aspect = array[i];

            if (aspect == null) {
                continue;
            }

            Collection<Aspect> equivalents = new ArrayList<>();

            // search rest of array for equivalent Aspects
            for (int j = i; j < array.length; j++) {
                Aspect other = array[j];
                if (other != null && areSimilar(aspect, other)) {
                    equivalents.add(other);
                    array[j] = null; // marks this aspect as consumed
                }
            }

            aggregates.add(Aspect.combine(equivalents));
        }

        return aggregates;
    }

    /**
     * Checks whether two Aspects are similar.
     * Aspects are similar if their edit distance is below the EditDistanceMeasure's threshold.
     */
    private boolean areSimilar(Aspect aspect, Aspect other) {
        return this.distanceMeasure.apply(aspect.getName(), other.getName()) != -1; // -1 is returned, when two texts are above the maximum edit distance.
    }

}
