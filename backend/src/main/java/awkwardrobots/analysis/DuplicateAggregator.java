package awkwardrobots.analysis;

import awkwardrobots.data.Aspect;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

/**
 * Aggregates Aspects by combining duplicate Aspects into a single one.
 * Duplicate Aspects are identified by their name.
 */
public class DuplicateAggregator implements AspectAggregator {

    private Map<String, Collection<Aspect>> canonicalAspects;

    @Override
    public Collection<Aspect> aggregate(Collection<Aspect> aspects) {
        canonicalAspects = new HashMap<>();

        for (Aspect aspect : aspects) {
            Collection<Aspect> equivalents = canonicalAspects.getOrDefault(aspect.getName(), new ArrayList<>());
            equivalents.add(aspect);
            canonicalAspects.put(aspect.getName(), equivalents);
        }

        Collection<Aspect> aggregates = new ArrayList<>();
        for (Collection<Aspect> equivalents : canonicalAspects.values()) {
            aggregates.add(Aspect.combine(equivalents));
        }

        return aggregates;
    }
}
