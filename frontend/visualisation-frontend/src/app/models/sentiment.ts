import { Extraction } from './canonical';

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

    public static fromArray(sentiments: Sentiment[]): SentimentCount {
        const count = new SentimentCount();
        for (const sentiment of sentiments) {
            count.inc(sentiment);
        }
        return count;
    }

    public static fromExtractions(extractions: Extraction[]): SentimentCount {
        const sentiments = extractions.map(e => e.sentiment);
        return SentimentCount.fromArray(sentiments);
    }

    public inc(sentiment: Sentiment, count: number = 1): void {
        this[sentiment] += count;
    }

    public dec(sentiment: Sentiment, count: number = 1): void {
        this[sentiment] -= count;
    }

    public getOverallCount(): number {
      return this.positive + this.neutral + this.negative + this.unknown;
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
