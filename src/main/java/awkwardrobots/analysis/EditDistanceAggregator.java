package awkwardrobots.analysis;

import awkwardrobots.data.Aspect;
import org.apache.commons.text.similarity.EditDistance;
import org.apache.commons.text.similarity.LevenshteinDistance;

import java.util.ArrayList;
import java.util.Collection;

public class EditDistanceAggregator implements AspectAggregator {
    private static final Integer DEFAULT_THRESHOLD = 2;
    private static final EditDistance<Integer> DEFAULT_DISTANCE = new LevenshteinDistance(DEFAULT_THRESHOLD);

    private EditDistance<Integer> distanceMeasure;

    public EditDistanceAggregator() {
        this.distanceMeasure = DEFAULT_DISTANCE;
    }

    @Override
    public Collection<Aspect> aggregate(Collection<Aspect> aspects) {
        Aspect[] array = aspects.toArray(new Aspect[]{});

        Collection<Aspect> aggregated = new ArrayList<>();

        for (int i = 0; i < array.length; i++) {
            Aspect aspect = array[i];

            if (aspect == null) {
                continue;
            }

            Collection<Aspect> equivalents = new ArrayList<>();

            for (int j = i; j < array.length; j++) {
                Aspect other = array[j];
                if (other != null && areSimilar(aspect, other)) {
                    equivalents.add(other);
                    array[j] = null;
                }
            }

            aggregated.add(Aspect.combine(equivalents));
        }

        return aggregated;
    }

    private boolean areSimilar(Aspect aspect, Aspect other) {
        return this.distanceMeasure.apply(aspect.getName(), other.getName()) != -1;
    }

}
