import { ExtractionGroup, Extractions, diversity } from 'src/app/models/canonical';
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

export interface SortOptionRegistry {
  [identifier: string]: SortOption;
}

export type SortOrder = 'ascending' | 'descending';

export interface SortOrderOption {
    order: SortOrder;
    viewValue: string;
}

export interface SortState {
  order: SortOrderOption;
  sort: SortOption;
}


const ascending: SortOrderOption = { viewValue: 'Ascending', order: 'ascending' };
const descending: SortOrderOption = { viewValue: 'Descending', order: 'descending' };

export const SortOrderOptions = {
  ascending,
  descending
};

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

function sortByDiversity(a: ExtractionGroup, b: ExtractionGroup): number {
  return diversity(a) - diversity(b);
}

function sortByLength(a: ExtractionGroup, b: ExtractionGroup): number {
  return a.name.length - b.name.length;
}


function noSort(a: ExtractionGroup, b: ExtractionGroup): number { return 0; }

const noSortOption: SortOption = { value: 'noSort', viewValue: '--', sortFunction: noSort };

const sentimentOptions: SortOption[] = [
  { value: 'controversialSentiments', viewValue: 'most controversial', sortFunction: sortByControversy },
  { value: 'positiveSentiments', viewValue: 'most positive', sortFunction: sentimentSorter(Sentiment.Positive) },
  { value: 'negativeSentiments', viewValue: 'most negative', sortFunction: sentimentSorter(Sentiment.Negative) },
  { value: 'neutralSentiments', viewValue: 'most neutral', sortFunction: sentimentSorter(Sentiment.Neutral) }
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
  { value: 'alphabetically', viewValue: 'alphabetically', sortFunction: sortByGroupName },
  { value: 'popularity', viewValue: 'most talked about', sortFunction: sortByExtractionLength },
  { value: 'diversity', viewValue: 'most diverse', sortFunction: sortByDiversity},
  { value: 'length', viewValue: 'longest', sortFunction: sortByLength }
];

export const SortFunctions = {
    byGroupName: sortByGroupName,
    byAspects: sortByAspects,
    byAttributes: sortByAttributes,
    byComments: sortByComments,
    byControversy: sortByControversy,
    byDiversity: sortByDiversity,
    byLength: sortByLength,
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
        neutralSentiments: sentimentOptions[3],
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
