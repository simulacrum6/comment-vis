export class Aspect {
  name: string;
  bars: Bar[];

  static fromJson(json: any[]): Aspect[] {
    const result: Aspect[] = [];
    json.forEach((jsonAspectRoot, rootAspectIndex) => {
      const aspect = new Aspect();
      aspect.name = jsonAspectRoot.aspect.name;
      const bars: Bar[] = [];
      jsonAspectRoot.attributes.forEach((jsonAttribute, attributeIndex) => {
          const bar = new Bar();
          bar.attributeDescription = jsonAttribute.description;
          bar.count = jsonAttribute.commentIds.length;
          let positiveSentimentCount = 0;
          let neutralSentimentCount = 0;
          let negativeSentimentCount = 0;
          const comments: Comment[] = [];
          for (let commentIndex = 0; commentIndex < jsonAspectRoot.comments.length; commentIndex++) {
            const jsonComment = jsonAspectRoot.comments[commentIndex];
            if (!jsonAttribute.commentIds.includes(jsonComment.id)) {
               continue;
            }
            const sentiment: string = jsonComment.sentiment;
            switch (sentiment) {
              case 'positive': {
                positiveSentimentCount++;
                break;
              }
              case 'neutral': {
                neutralSentimentCount++;
                break;
              }
              case 'negative': {
                negativeSentimentCount++;
                break;
              }
            }
            const comment = new Comment();
            comment.text = jsonComment.text;
            comment.sentiment = jsonComment.sentiment;
            comment.sentiment = jsonComment.sentiment;
            comments.push(comment);
            bar.comments = comments;
        }

          bar.positiveSentimentCount = positiveSentimentCount;
          bar.neutralSentimentCount = neutralSentimentCount;
          bar.negativeSentimentCount = negativeSentimentCount;
          bars[attributeIndex] = bar;
      });

      aspect.bars = bars;
      result[rootAspectIndex] = aspect;
    });
    return result;
  }
}

export class Bar {
  attributeDescription: string;
  count: number;
  positiveSentimentCount: number;
  neutralSentimentCount: number;
  negativeSentimentCount: number;
  comments: Comment[];
}

export class Comment {
  text: string;
  sentiment: string;
}
