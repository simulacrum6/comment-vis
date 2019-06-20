import { default as Color } from 'color';
import { Sentiment, Sentiments } from 'src/app/models/sentiment';

/** View **/

export const SentimentColors: { positive: Color, negative: Color, neutral: Color, unknown: Color } = {
  positive: Color('rgb(0, 163, 51)'),
  negative: Color('rgb(255, 0, 0)'),
  neutral: Color('rgb(169, 169, 169)'),
  unknown: Color('rgba(255, 255, 255, 0)')
};

export const backgroundAlpha = 0.3;
export const hoverBackgroundAlpha = 0.6;

export const DefaultColorStrings = {
  backgroundColor: {
    positive: SentimentColors.positive.alpha(backgroundAlpha).toString(),
    negative: SentimentColors.negative.alpha(backgroundAlpha).toString(),
    neutral: SentimentColors.neutral.alpha(backgroundAlpha).toString(),
    unknown: SentimentColors.unknown.alpha(backgroundAlpha).toString()
  },
  borderColor: {
    positive: SentimentColors.positive.toString(),
    negative: SentimentColors.negative.toString(),
    neutral: SentimentColors.neutral.toString(),
    unknown: SentimentColors.unknown.toString()
  },
  hoverBackgroundColor: {
    positive: SentimentColors.positive.alpha(hoverBackgroundAlpha).toString(),
    negative: SentimentColors.negative.alpha(hoverBackgroundAlpha).toString(),
    neutral: SentimentColors.neutral.alpha(hoverBackgroundAlpha).toString(),
    unknown: SentimentColors.unknown.alpha(hoverBackgroundAlpha).toString()
  },
  hoverBorderColor: {
    positive: SentimentColors.positive.toString(),
    negative: SentimentColors.negative.toString(),
    neutral: SentimentColors.neutral.toString(),
    unknown: SentimentColors.unknown.toString()
  }
};
