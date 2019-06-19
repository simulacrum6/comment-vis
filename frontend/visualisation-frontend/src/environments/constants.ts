import { default as Color } from 'color';
import { Sentiment, Sentiments } from 'src/app/models/sentiment';

/** View **/

// TODO: change from string to Color
// TODO: align with sentiment order
export const SentimentColors = {
  positive: 'rgb(0, 163, 51)',
  neutral: 'rgb(169, 169, 169)',
  negative: 'rgb(255, 0, 0)',
};

// TODO: delete once SentimentColors is adjusted
export const SentimentColorObjects: { positive: Color, negative: Color, neutral: Color, unknown: Color } = {
  positive: Color('rgb(0, 163, 51)'),
  negative: Color('rgb(255, 0, 0)'),
  neutral: Color('rgb(169, 169, 169)'),
  unknown: Color('rgba(255, 255, 255, 0)')
};

export const backgroundAlpha = 0.3;
export const hoverBackgroundAlpha = 0.6;

export const DefaultColorStrings = {
  backgroundColor: {
    positive: SentimentColorObjects.positive.alpha(backgroundAlpha).toString(),
    negative: SentimentColorObjects.negative.alpha(backgroundAlpha).toString(),
    neutral: SentimentColorObjects.neutral.alpha(backgroundAlpha).toString(),
    unknown: SentimentColorObjects.unknown.alpha(backgroundAlpha).toString()
  },
  borderColor: {
    positive: SentimentColorObjects.positive.toString(),
    negative: SentimentColorObjects.negative.toString(),
    neutral: SentimentColorObjects.neutral.toString(),
    unknown: SentimentColorObjects.unknown.toString()
  },
  hoverBackgroundColor: {
    positive: SentimentColorObjects.positive.alpha(hoverBackgroundAlpha).toString(),
    negative: SentimentColorObjects.negative.alpha(hoverBackgroundAlpha).toString(),
    neutral: SentimentColorObjects.neutral.alpha(hoverBackgroundAlpha).toString(),
    unknown: SentimentColorObjects.unknown.alpha(hoverBackgroundAlpha).toString()
  },
  hoverBorderColor: {
    positive: SentimentColorObjects.positive.toString(),
    negative: SentimentColorObjects.negative.toString(),
    neutral: SentimentColorObjects.neutral.toString(),
    unknown: SentimentColorObjects.unknown.toString()
  }
};
