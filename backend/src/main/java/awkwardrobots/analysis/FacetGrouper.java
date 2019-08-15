package awkwardrobots.analysis;

import java.util.Collection;

import awkwardrobots.data.Facet;

/**
 * Assigns a group to a collection of Facets.
 * The mechanism by which groups are assigned depends on the implementation.
 */
public interface FacetGrouper {

	/**
	 * Assigns groups to the given collection of Facets.
	 * Groups are assigned by mutating a Facet's group in place.
	 */
	public void assignGroups(Collection<Facet> facets);
}
