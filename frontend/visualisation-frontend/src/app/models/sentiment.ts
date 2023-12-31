import { Extraction } from './canonical';
import { default as Color } from 'color';
import {SentimentColors} from '../../environments/constants';

export enum Sentiment {
    Positive = 'positive',
    Negative = 'negative',
    Neutral = 'neutral',
    Unknown = 'unknown'
}

export const Sentiments: string[] = Object.values(Sentiment);

export class SentimentCount {
    public positive = 0;
    public negative = 0;
    public neutral = 0;
    public unknown = 0;

    public get total(): number {
        return this.positive + this.negative + this.neutral + this.unknown;
    }

    public static fromArray(sentiments: Sentiment[]): SentimentCount {
        const count = new SentimentCount();
        for (const sentiment of sentiments) {
            SentimentCount.inc(count, sentiment);
        }
        return count;
    }

    public static fromExtractions(extractions: Extraction[]): SentimentCount {
        const sentiments = extractions.map(e => e.sentiment);
        return SentimentCount.fromArray(sentiments);
    }

    public static inc(sentimentCount: SentimentCount, sentiment: Sentiment, count: number = 1): void {
        sentimentCount[sentiment] += count;
    }

    public static dec(sentimentCount: SentimentCount, sentiment: Sentiment, count: number = 1): void {
        sentimentCount[sentiment] -= count;
    }
}

/**
 * Maps a given string or number to its corresponding `Sentiment`.
 *
 * Strings must be one of 'positive', 'negative', 'neutral'.
 * Numbers must be one of -1, 0, +1.
 * Other values are Mapped to `Sentiment.Unknown`.
 */
export function mapToSentiment(value: string | number): Sentiment {
    if (value === null || value === undefined) {
        return Sentiment.Unknown;
    }

    if (typeof value === 'string') {
        switch (value.toLowerCase()) {
            case 'positive': return Sentiment.Positive;
            case 'negative': return Sentiment.Negative;
            case 'neutral': return Sentiment.Neutral;
            default: return Sentiment.Unknown;
        }
    }

    if (typeof value === 'number') {
        switch (value) {
            case 1: return Sentiment.Positive;
            case -1: return Sentiment.Negative;
            case 0: return Sentiment.Neutral;
            default: return Sentiment.Unknown;
        }
    }

    return Sentiment.Unknown;
}

/**
 * Maps the given Sentiment to its numeric representation (+1, 0, -1).
 */
export function mapToNumber(sentiment: Sentiment): number {
    switch (sentiment) {
        case Sentiment.Positive: return 1;
        case Sentiment.Negative: return -1;
        case Sentiment.Neutral:
        case Sentiment.Unknown: return 0;
    }
}

/**
 * Maps the given value to a statement about its sentiment.
 */
export function mapToSentimentStatement(value: number) {
    if (value > 0.85) {
        return 'extremely positive';
    }
    if (value > 0.5) {
        return 'positive';
    }
    if (value > 0.2) {
        return 'somewhat positive';
    }
    if (value > -0.2) {
        return 'mixed';
    }
    if (value > -0.5) {
        return 'somewhat negative';
    }
    if (value > -0.85) {
        return 'negative';
    }
    return 'extremely negative';
}

/**
 *  compares the given values and maps them to a statement
 *  @param overallSentimentDifferential the overall sentiment differential
 *  @param sentimentDifferential the sentiment differential for the comparison with the overall value
 */
export function mapToCompareSentimentStatement(overallSentimentDifferential: number, sentimentDifferential: number): string {
  const difference = overallSentimentDifferential - sentimentDifferential;
  if (difference < -0.65) {
    return 'extremely above average';
  }
  if (difference < -0.3) {
    return 'above average';
  }
  if (difference < -0.1) {
    return 'slightly above average';
  }
  if (difference < 0.1) {
    return 'around average';
  }
  if (difference < 0.2) {
    return 'slightly below average';
  }
  if (difference < 0.3) {
    return 'below average';
  }
  if (difference < 0.65) {
    return 'below average';
  }
  return 'extremely below average';
}

/**
 * Get a mixed color representation for a given sentiment ratio.
 */
export function getMixedWeightedSentimentColor(sentimentRatio: number): Color {
  return SentimentColors.neutral.mix(sentimentRatio > 0 ? SentimentColors.positive : SentimentColors.negative, Math.abs(sentimentRatio));
}

export function controversy(counts: SentimentCount, normalized = true) {
    const difference = counts.positive - counts.negative;
    const sum = counts.positive + counts.negative;
    if (!normalized) {
        return 1 / ((Math.abs(difference) + 1) / (sum));
    }
    return 1 - difference / counts.total;
}
