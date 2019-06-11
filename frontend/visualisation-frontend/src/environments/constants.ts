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
const sentimentColors = {
  positive: Color('rgb(0, 163, 51)'),
  negative: Color('rgb(255, 0, 0)'),
  neutral: Color('rgb(169, 169, 169)'),
  unknown: Color('rgba(255, 255, 255, 0)')
};

const backgroundAlpha = 0.3;
const hoverBackgroundAlpha = 0.6;

export const DefaultColorStrings = {
  backgroundColor: {
    positive: sentimentColors.positive.alpha(backgroundAlpha).toString(),
    negative: sentimentColors.negative.alpha(backgroundAlpha).toString(),
    neutral: sentimentColors.neutral.alpha(backgroundAlpha).toString(),
    unknown: sentimentColors.unknown.alpha(backgroundAlpha).toString()
  },
  borderColor: {
    positive: sentimentColors.positive.toString(),
    negative: sentimentColors.negative.toString(),
    neutral: sentimentColors.neutral.toString(),
    unknown: sentimentColors.unknown.toString()
  },
  hoverBackgroundColor: {
    positive: sentimentColors.positive.alpha(hoverBackgroundAlpha).toString(),
    negative: sentimentColors.negative.alpha(hoverBackgroundAlpha).toString(),
    neutral: sentimentColors.neutral.alpha(hoverBackgroundAlpha).toString(),
    unknown: sentimentColors.unknown.alpha(hoverBackgroundAlpha).toString()
  },
  hoverBorderColor: {
    positive: sentimentColors.positive.toString(),
    negative: sentimentColors.negative.toString(),
    neutral: sentimentColors.neutral.toString(),
    unknown: sentimentColors.unknown.toString()
  }
};
