package awkwardrobots.analysis;

import awkwardrobots.data.Aspect;

import java.util.Collection;

//TODO: equivalents should also be preserved, to make process revertable.
/**
 * Aggregates collections of Aspects by combining similar Aspects in the collection.
 * Combining Aspects should preserve their Attributes and Mentions.
 *
 * @see Aspect#combine
 */
@FunctionalInterface
public interface AspectAggregator {

    /**
     * Aggregates the given Aspects.
     *
     * @param aspects the Aspects to aggregate.
     * @return a Collection of Aspects equal to or smaller in size than the given Aspects.
     */
    Collection<Aspect> aggregate(Collection<Aspect> aspects);

}
