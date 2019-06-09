import {Aspect} from './model';
import Color from 'color';
import {BarComponent} from './bar.component';

export class ModelTransformation {

  private parentComponent: BarComponent;

  private chartColors = {
    red: 'rgb(255, 0, 0)',
    gray: 'rgb(169, 169, 169)',
    green: 'rgb(0, 163, 51)',
  };

  constructor(parentComponent: BarComponent) {
    this.parentComponent = parentComponent;
  }

  buildChartData(aspects: Aspect[], sort: any, sortOrder: any, prevalence: any): void {
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
        switch (sort.value) {
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
        if (sortOrder.value === 'ascending') {
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
        borderColor = this.chartColors.green;
        label = 'Positive';
        data = positiveSentiments;
      } else if (i === 1) {
        borderColor = this.chartColors.gray;
        label = 'Neutral';
        data = neutralSentiments;
      } else {
        borderColor = this.chartColors.red;
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
