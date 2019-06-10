import {Aspect} from './model';
import Color from 'color';
import {BarComponent} from './bar.component';
import {SentimentColors} from '../../../../environments/constants';

export class ModelTransformation {

  private parentComponent: BarComponent;

  constructor(parentComponent: BarComponent) {
    this.parentComponent = parentComponent;
  }

  buildChartData(aspects: Aspect[], sort: string, sortOrder: string): void {
    this.parentComponent.chartData = [];
    this.parentComponent.chartLabels = [];

    const positiveSentiments = [];
    const neutralSentiments = [];
    const negativeSentiments = [];
    const unknownSentiments = [];

    // Sort
    aspects.forEach((aspect) => {
      aspect.bars.sort((a, b) => {
        let countA = 0;
        let countB = 0;
        switch (sort) {
          case 'positive':
            countA = a.positiveSentimentCount;
            countB = b.positiveSentimentCount;
            break;
          case 'neutral':
            countA = a.neutralSentimentCount;
            countB = b.neutralSentimentCount;
            break;
          case 'negative':
            countA = a.negativeSentimentCount;
            countB = b.negativeSentimentCount;
            break;
          default:
            countA = a.count;
            countB = b.count;
        }
        if (sortOrder === 'ascending') {
          return countA - countB;
        } else {
          return countB - countA;
        }
      });
    });

    aspects.forEach((aspect) => {
      aspect.bars.forEach((bar) => {
        this.parentComponent.chartLabels.push(bar.attributeDescription);
        positiveSentiments.push(bar.positiveSentimentCount);
        neutralSentiments.push(bar.neutralSentimentCount);
        negativeSentiments.push(bar.negativeSentimentCount);
      });
    });

    let borderColor: string;
    let label: string;
    let data = [];
    for (let i = 0; i < 3; i++) {
      if (i === 0) {
        borderColor = SentimentColors.positive;
        label = 'Positive';
        data = positiveSentiments;
      } else if (i === 1) {
        borderColor = SentimentColors.neutral;
        label = 'Neutral';
        data = neutralSentiments;
      } else {
        borderColor = SentimentColors.negative;
        label = 'Negative';
        data = negativeSentiments;
      }
      const dataSet: any = {};
      dataSet.borderColor = borderColor;
      dataSet.borderWidth = 3;
      dataSet.backgroundColor = Color(borderColor).alpha(0.3).string();
      dataSet.hoverBorderColor = Color(borderColor).string();
      dataSet.hoverBackgroundColor = Color(borderColor).alpha(0.6).string();
      dataSet.label = label;
      dataSet.data = data;
      this.parentComponent.chartData.push(dataSet);
    }
  }

}
