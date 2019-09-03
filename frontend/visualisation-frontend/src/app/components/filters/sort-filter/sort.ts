import { ExtractionGroup, Extractions } from 'src/app/models/canonical';
import { controversy, Sentiment } from 'src/app/models/sentiment';

export interface SortOption {
  viewValue: string;
  sortFunction: (a: any, b: any) => number;
  value?: any;
}

export interface SortOptionGroup {
  name: string;
  members: SortOption[];
}

export type SortOrder = 'ascending' | 'descending';

export interface SortOrderOption {
    order: SortOrder;
    viewValue: string;
}

function sentimentSorter(sentiment: Sentiment) {
  return (a: ExtractionGroup, b: ExtractionGroup) => {
    const countA = a.sentimentCount[sentiment];
    const countB = b.sentimentCount[sentiment];
    return countA - countB;
  };
}

function sortByControversy(a: ExtractionGroup, b: ExtractionGroup): number {
  return controversy(a.sentimentCount) - controversy(b.sentimentCount);
}

function noSort(a: ExtractionGroup, b: ExtractionGroup): number { return 0; }

const noSortOption: SortOption = { value: 'none', viewValue: '--', sortFunction: noSort };

const sentimentOptions: SortOption[] = [
  { value: 'controversy', viewValue: 'most controversial', sortFunction: sortByControversy },
  { value: 'positive', viewValue: 'most positive', sortFunction: sentimentSorter(Sentiment.Positive) },
  { value: 'negative', viewValue: 'most negative', sortFunction: sentimentSorter(Sentiment.Negative) },
  { value: 'neutral', viewValue: 'most neutral', sortFunction: sentimentSorter(Sentiment.Neutral) }
];

function sortByExtractionLength(a: ExtractionGroup, b: ExtractionGroup): number {
  return a.extractions.length - b.extractions.length;
}

function sortByAspects(a: ExtractionGroup, b: ExtractionGroup): number {
  const property = 'aspect';
  return Extractions.groupByFlat(a.extractions, property).length - Extractions.groupByFlat(b.extractions, property).length;
}

function sortByAttributes(a: ExtractionGroup, b: ExtractionGroup): number {
  const property = 'attribute';
  return Extractions.groupByFlat(a.extractions, property).length - Extractions.groupByFlat(b.extractions, property).length;
}

function sortByComments(a: ExtractionGroup, b: ExtractionGroup): number {
  const property = 'comment';
  return Extractions.groupByFlat(a.extractions, property).length - Extractions.groupByFlat(b.extractions, property).length;
}

function sortByGroupName(a: ExtractionGroup, b: ExtractionGroup): number {
  const nameA = a.name.toLowerCase();
  const nameB = b.name.toLowerCase();
  const minLength = Math.min(nameA.length, nameB.length);
  for (let i = 0; i < minLength; i++) {
    const diff = nameA.charCodeAt(i) - nameB.charCodeAt(i);
    if (diff !== 0) {
      return diff;
    }
  }
  return nameA.length < nameB.length ? -1 : 1;
}

const extractionOptions: SortOption[] = [
  { viewValue: 'alphabetically', sortFunction: sortByGroupName },
  { viewValue: 'most talked about', sortFunction: sortByExtractionLength },
];

export const SortFunctions = {
    byGroupName: sortByGroupName,
    byAspects: sortByAspects,
    byAttributes: sortByAttributes,
    byComments: sortByComments,
    byControversy: sortByControversy,
    byPopularity: sortByExtractionLength,
    noSort
};

export const SortOptions = {
    options: {
        noSort: noSortOption,
        alphabetically: extractionOptions[0],
        popularity: extractionOptions[1],
        controversialSentiments: sentimentOptions[0],
        positiveSentiments: sentimentOptions[1],
        negativeSentiments: sentimentOptions[2],
        neutralSentiments: sentimentOptions[2],
    },
    bundles: {
        sentiment: sentimentOptions,
        topics: extractionOptions
    }
};

export const SortOptionGroups = {
    sentiment: { name: 'Sentiment', members: sentimentOptions },
    topics: { name: 'Topics', members: extractionOptions }
};
