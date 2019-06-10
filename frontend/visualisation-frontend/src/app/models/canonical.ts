import { Sentiment, mapToSentiment, SentimentCount } from './sentiment';

export interface StringMap<V> {
    [key: string]: V;
}
export const StringMap = function StringMapConstructor<V>(keys: Set<string>, initValue: V): StringMap<V> {
    let map: StringMap<V> = {};
    keys.forEach(key => map[key] = initValue) // broken with reference datatypes
    return map;
}

export interface Facet {
    text: string;
    group: string;
}

export interface Extraction {
    comment: string;
    aspect: Facet;
    attribute: Facet;
    sentiment: Sentiment;
}

export const Extractions = {
    groupBy: groupBy
}

function groupBy(extractions: Extraction[], property: 'comment' | 'aspect' | 'attribute' | 'sentiment', subProperty: 'text' | 'group' = 'text' ): StringMap<Extraction[]> {
    let extractor = getPropertyExtractor();
    let keys = new Set(extractions.map(extractor)); // set of all property values
    
    // initialize map with empty array
    let groups: StringMap<Extraction[]> = {};
    keys.forEach(key => groups[key] = []); 
    
    for (let extraction of extractions) {
        let property = extractor(extraction);
        groups[property].push(extraction);
    }

    return groups;
    
    function getPropertyExtractor(): (e: Extraction) => string {
        if (property === 'aspect' || property == 'attribute') {
            return getNested;
        } 
        return getSimple;

        function getSimple(extraction: Extraction): string {
            return <string>extraction[property];
        }

        function getNested(extraction: Extraction): string {
            return extraction[property][subProperty];
        }
    }
    
}

export const Extraction = function ExtractionConstructor(): Extraction {
    return {
        comment: '',
        aspect: { text: '', group: '' },
        attribute: { text: '', group: '' },
        sentiment: Sentiment.Unknown
    };
};

export class FacetGroup {
    name: string;
    type: 'aspect' | 'attribute';
    members: Facet[];
    extractions: Extraction[];

    static fromExtractions(extractions: Extraction[], type: 'aspect' | 'attribute', name?: string): FacetGroup {
        name = name || extractions[0][type].group // set to groupname of first extraction if no name was given
        let group = new FacetGroup();
        group.name = name;
        group.type = type;
        group.members = extractions.map(extraction => extraction[type])
        group.extractions = extractions;
        return group; 
    } 
}

export interface NestedFacet {
    readonly name: string;
    readonly type: 'aspect' | 'attribute';
    children: FacetGroup[];
    extractions: Extraction[];
    sentimentCount: SentimentCount;
    comments: string[];
}

class NestedFacetBase implements NestedFacet {
    public readonly name: string;
    public readonly type: 'aspect' | 'attribute';

    private group: FacetGroup;
    private childrenType: 'aspect' | 'attribute';

    constructor(group: FacetGroup, type: 'aspect' | 'attribute') {
        if (group.type !== type) {
            throw new Error(`Illegal input. group.type must be ${this.type}, but was ${group.type}`);
        }
        this.name = group.name;
        this.group = group;
        this.type = type;
        this.childrenType = type === 'aspect' ? 'attribute' : type;
    }

    get children(): FacetGroup[] {
      let childGroupMap = groupBy(this.extractions, this.childrenType);
      let childGroups = Object.keys(childGroupMap).map(key => FacetGroup.fromExtractions(childGroupMap[key], this.childrenType)); 
      return childGroups;
    }

    get extractions(): Extraction[] {
        return this.group.extractions;
    }

    get sentimentCount(): SentimentCount {
        const sentiments: Sentiment[] = this.group.extractions.map(e => e.sentiment);
        return SentimentCount.fromArray(sentiments);
    }

    get comments(): string[] {
        return this.group.extractions.map(extraction => extraction.comment);
    }
}

export class Aspect extends NestedFacetBase implements NestedFacet {
    constructor(group: FacetGroup) {
        super(group, 'aspect');
    }
}

export class Attribute extends NestedFacetBase implements NestedFacet {
    constructor(group: FacetGroup) {
        super(group, 'attribute');
    }
}

export class Model {
    constructor(private extractions: Extraction[]) { }

    get rawExtractions(): Extraction[] {
        return this.extractions;
    }

    get rawAspects(): Facet[] {
        return this.extractions.map(extraction => extraction.aspect);
    }

    get rawAttributes(): Facet[] {
        return this.extractions.map(extraction => extraction.attribute);
    }

    get rawComments(): string[] {
        return this.extractions.map(extraction => extraction.comment);
    }

    get rawSentiments(): Sentiment[] {
        return this.extractions.map(extraction => extraction.sentiment);
    }

    get aspectGroupIndex(): StringMap<FacetGroup> {
        return this.getGroupIndex('aspect');
    }

    get attributeGroupIndex(): StringMap<FacetGroup> {
        return this.getGroupIndex('attribute');
    }

    get aspectGroups(): FacetGroup[] {
        const index = this.aspectGroupIndex;
        return Object.keys(index).map(key => index[key]);
    }

    get attributeGroups(): FacetGroup[] {
        const index = this.attributeGroupIndex;
        return Object.keys(index).map(key => index[key]);
    }

    get aspects(): Aspect[] {
        return this.aspectGroups.map(group => new Aspect(group));
    }

    get attributes(): Attribute[] {
        return this.attributeGroups.map(group => new Attribute(group));
    }

    private getGroupIndex(type: 'aspect' | 'attribute'): StringMap<FacetGroup> {
        let groupIndex: StringMap<FacetGroup> = {};
        for (let extraction of this.extractions) {
            let facet = extraction[type]
            let groupName = facet.group;
            if (!(groupName in groupIndex)) {
                groupIndex[groupName] = { name: groupName, type: type, members: [], extractions: [] }
            }
            groupIndex[groupName].members.push(facet);
            groupIndex[groupName].extractions.push(extraction);
        }
        return groupIndex;
    }

    public sentiment(comment: string, aspect: string, attribute: string, notFound: any = null): Sentiment {
        const extraction: Extraction = this.extractions.find(extraction => {
            return (comment === extraction.comment)
                && (aspect === extraction.aspect.text)
                && (attribute === extraction.attribute.text);
        });
        return extraction ? extraction.sentiment : notFound;
    }
}

/** Json **/

export function parseJson(json: any[]): Extraction[] {
    return json.map(toExtraction);
}

function toExtraction(json: any): Extraction {
    return {
        comment: json.comment,
        aspect: json.aspect,
        attribute: json.attribute,
        sentiment: mapToSentiment(json.sentiment)
    };
}
