export enum Sentiment {
    Positive = 'positive',
    Negative = 'negative',
    Neutral = 'neutral',
    Unknown = 'unknown'
}

export const Sentiments = [
    Sentiment.Positive,
    Sentiment.Negative,
    Sentiment.Neutral,
    Sentiment.Unknown
]

export class SentimentCount {
    public positive: number = 0;
    public negative: number = 0;
    public neutral: number = 0;
    public unknown: number = 0;

    public static fromArray(sentiments: Sentiment[]): SentimentCount {
        let count: SentimentCount = new SentimentCount();
        for (let sentiment of sentiments) {
            count.inc(sentiment);
        }
        return count;
    }

    public inc(sentiment: Sentiment, count: number = 1): void {
        this[sentiment] += count;
    }

    public dec(sentiment: Sentiment, count: number = 1): void {
        this[sentiment] -= count;
    }
}

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
}
