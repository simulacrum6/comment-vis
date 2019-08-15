package awkwardrobots.analysis;

import java.util.Collection;
import java.util.Map;

import awkwardrobots.data.Facet;

public class DictionaryGrouper implements FacetGrouper {

    private Map<String, String> dictionary;
    
    /**
     * Creates a new DictionaryGrouper from the given dictionary.
     *
     * @param dictionary the dictionary mapping from group names to canonical group names.
     */
    public DictionaryGrouper(Map<String, String> dictionary) {
    	this.dictionary = dictionary;
    }
	
	@Override
	public void assignGroups(Collection<Facet> facets) {
		for (Facet facet : facets) {
			String groupName = dictionary.getOrDefault(facet.getGroup(), facet.getGroup());
			facet.setGroup(groupName);
		}
	}

}
