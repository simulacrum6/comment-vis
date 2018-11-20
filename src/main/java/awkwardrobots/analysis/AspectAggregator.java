package awkwardrobots.analysis;

import awkwardrobots.data.Aspect;

import java.util.Collection;

/**
 * Aggregates collections of Aspects by combining similar Aspects in the collection.
 * Combining Aspects should preserve their Attributes and Mentions.
 * The exact method by which Aspects are combined is up to the implementer.
 *
 * @see Aspect#combine
 */
@FunctionalInterface
public interface AspectAggregator {

    /**
     * Aggregates the given Aspects.
     *
     * @param aspects the Aspects to aggregate.
     * @return a Collection of Aspects equal to or smaller than the given Aspects.
     */
    Collection<Aspect> aggregate(Collection<Aspect> aspects);

}
