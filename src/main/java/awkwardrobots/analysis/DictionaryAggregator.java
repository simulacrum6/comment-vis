package awkwardrobots.analysis;

import awkwardrobots.data.Aspect;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

/**
 * Aggregates Collections of Aspects, based on a dictionary. 
 * Aspect under the same name in the dictionary are mapped to a single canonical Aspect.
 */
public class DictionaryAggregator implements AspectAggregator {

    private Map<String, String> dictionary;
    private Map<String, Collection<Aspect>> canonicalNames;

    /**
     * Creates a new DictionaryAggregator from the given dictionary.
     *
     * @param dictionary the dictionary mapping alternative Aspect names to canonical Aspect names
     */
    public DictionaryAggregator(Map<String, String> dictionary) {
        this.dictionary = dictionary;
    }

    @Override
    public Collection<Aspect> aggregate(Collection<Aspect> aspects) {
        this.canonicalNames = new HashMap<>();

        for (Aspect aspect : aspects) {
            String canonicalName = dictionary.getOrDefault(aspect.getName(), aspect.getName());
            Collection<Aspect> equivalents = canonicalNames.getOrDefault(canonicalName, new ArrayList<>());
            equivalents.add(aspect);
            canonicalNames.put(canonicalName, equivalents);
        }

        Collection<Aspect> aggregates = new ArrayList<>();

        for (Map.Entry<String, Collection<Aspect>> entry : canonicalNames.entrySet()) {
            String canonicalName = entry.getKey();
            Collection<Aspect> equivalents = entry.getValue();
            Aspect aggregate = Aspect.combine(equivalents);
            aggregate.setName(canonicalName);
            aggregates.add(aggregate);
        }

        return aggregates;
    }
}