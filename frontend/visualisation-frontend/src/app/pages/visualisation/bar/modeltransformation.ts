import {BarComponent} from './bar.component';
import {SentimentColors} from '../../../../environments/constants';
import {Extraction, Extractions} from '../../../models/canonical';
import {SentimentCount} from '../../../models/sentiment';
import {default as Color} from 'color';

export class ModelTransformation {

  private parentComponent: BarComponent;

  constructor(parentComponent: BarComponent) {
    this.parentComponent = parentComponent;
  }

  buildChartData(sort: string, sortOrder: string): void {
    this.parentComponent.chartData = [];
    this.parentComponent.chartLabels = [];

    const positiveSentiments = [];
    const neutralSentiments = [];
    const negativeSentiments = [];

    const model = this.parentComponent.modelService.model;
    if (this.parentComponent.aspectname) {
      const extractions: Extraction[] = model.aspectGroupMap[this.parentComponent.aspectname];
      if (extractions) {
        const extractionsByAttributeGroup: Extraction[][] = Extractions.groupByFlat(extractions, 'attribute');

        extractionsByAttributeGroup.sort((a, b) => {
          const sentimentMapA = a.map(attributeGroup => attributeGroup.sentiment);
          const sentimentsA = SentimentCount.fromArray(sentimentMapA);
          const sentimentMapB = b.map(attributeGroup => attributeGroup.sentiment);
          const sentimentsB = SentimentCount.fromArray(sentimentMapB);

          let countA = 0;
          let countB = 0;
          switch (sort) {
            case 'positive':
              countA = sentimentsA.positive;
              countB = sentimentsB.positive;
              break;
            case 'neutral':
              countA = sentimentsA.neutral;
              countB = sentimentsB.neutral;
              break;
            case 'negative':
              countA = sentimentsA.negative;
              countB = sentimentsB.negative;
              break;
            default:
              countA = sentimentsA.getOverallCount();
              countB = sentimentsB.getOverallCount();
          }
          if (sortOrder === 'ascending') {
            return countA - countB;
          } else {
            return countB - countA;
          }
        });

        extractionsByAttributeGroup.forEach((attributeGroups) => {
          this.parentComponent.chartLabels.push(attributeGroups[0].attribute.group);
          const sentimentMap = attributeGroups.map(attributeGroup => attributeGroup.sentiment);
          const sentiments = SentimentCount.fromArray(sentimentMap);
          positiveSentiments.push(sentiments.positive);
          neutralSentiments.push(sentiments.neutral);
          negativeSentiments.push(sentiments.negative);
        });

        let color: Color;
        let label: string;
        let data = [];
        for (let i = 0; i < 3; i++) {
          if (i === 0) {
            color = SentimentColors.positive;
            label = 'Positive';
            data = positiveSentiments;
          } else if (i === 1) {
            color = SentimentColors.neutral;
            label = 'Neutral';
            data = neutralSentiments;
          } else {
            color = SentimentColors.negative;
            label = 'Negative';
            data = negativeSentiments;
          }
          const dataSet: any = {};
          dataSet.borderColor = color;
          dataSet.borderWidth = 3;
          dataSet.backgroundColor = color.alpha(0.3).string();
          dataSet.hoverBorderColor = color.string();
          dataSet.hoverBackgroundColor = color.alpha(0.6).string();
          dataSet.label = label;
          dataSet.data = data;
          this.parentComponent.chartData.push(dataSet);
        }

        console.log(extractions);
      }
    }
  }
}
